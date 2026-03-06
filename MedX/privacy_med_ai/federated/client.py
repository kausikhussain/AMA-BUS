import torch
import flwr as fl
from collections import OrderedDict
from opacus import PrivacyEngine
from torch.utils.data import DataLoader

from models.classifier import get_model
from privacy.dp_mechanism import apply_dp
from encryption.crypto import generate_key, encrypt_model_updates, decrypt_model_updates

# Shared key for simulation purposes
SIMULATION_KEY = b'vHI5XVZ3OfEhnzK8nIJiHPaeQa4qPX8F0rQoxeDYWJc=' # valid key from file

class MedClient(fl.client.NumPyClient):
    def __init__(self, data_loader, epochs, device, privacy_config):
        self.model = get_model()
        self.device = device
        self.train_loader = data_loader
        self.epochs = epochs
        self.privacy_config = privacy_config
        self.model.to(self.device)
        self.optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01, momentum=0.9)
        self.scheduler = torch.optim.lr_scheduler.StepLR(self.optimizer, step_size=1, gamma=0.95)
        self.privacy_engine = None

        if self.privacy_config['enabled']:
             self.model, self.optimizer, self.train_loader, self.privacy_engine = apply_dp(
                self.model,
                self.optimizer,
                self.train_loader,
                target_epsilon=self.privacy_config['target_epsilon'],
                target_delta=self.privacy_config['target_delta'],
                max_grad_norm=self.privacy_config['max_grad_norm'],
                epochs=self.epochs,
            )

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.train()
        
        for _ in range(self.epochs):
            for images, labels in self.train_loader:
                images, labels = images.to(self.device), labels.to(self.device).squeeze().long()
                self.optimizer.zero_grad()
                outputs = self.model(images)
                loss = torch.nn.functional.cross_entropy(outputs, labels)
                loss.backward()
                self.optimizer.step()
            
            self.scheduler.step()
        
        # Capture last batch loss for reporting
        loss = loss.item()
        
        # Privacy Accounting
        epsilon = 0.0
        if self.privacy_engine:
            epsilon = self.privacy_engine.get_epsilon(delta=self.privacy_config['target_delta'])
            print(f"Client Privacy Budget Spent: (epsilon = {epsilon:.2f}, delta = {self.privacy_config['target_delta']})")

        # Encryption Simulation
        # In a real scenario, we would send the encrypted blob.
        # Here we just demonstrate the encryption step.
        updated_params = self.get_parameters(config={})
        encrypted_params = encrypt_model_updates(updated_params, SIMULATION_KEY) # Demo encryption
        # For Flower simulation, we must return List[np.ndarray], so we return the raw params
        # but we've proved we can encrypt them.
        
        return updated_params, len(self.train_loader.dataset), {"epsilon": epsilon, "loss": float(loss)}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss, correct, total = 0.0, 0, 0
        with torch.no_grad():
            for images, labels in self.train_loader: # simplified, usually use val loader
                images, labels = images.to(self.device), labels.to(self.device)
                outputs = self.model(images)
                loss += torch.nn.functional.cross_entropy(outputs, labels).item()
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        accuracy = correct / total
        return float(loss), len(self.train_loader.dataset), {"accuracy": float(accuracy)}
