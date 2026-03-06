import flwr as fl
import torch
from torch.utils.data import DataLoader
import yaml
import numpy as np

from data.dataset import load_dataset, get_dataloader
from data.partition import partition_dataset
from federated.client import MedClient
from federated.server import get_strategy
from models.classifier import get_model

import csv
import os

def load_config(path="config.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def log_metrics(round_num, accuracy, epsilon, loss=0.0):
    file_exists = os.path.isfile("metrics.csv")
    with open("metrics.csv", "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Round", "Accuracy", "Privacy_Epsilon", "Loss"])
        writer.writerow([round_num, accuracy, epsilon, loss])

import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default="config.yaml", help="Path to config file")
    args = parser.parse_args()
    
    config = load_config(args.config)
    DEVICE = torch.device("cuda" if torch.cuda.is_available() and config['training']['device'] == 'cuda' else "cpu")
    print(f"Using device: {DEVICE}")

    # 1. Load Data
    print("Loading dataset...")
    # For simulation, we load the whole dataset and split it
    full_train_dataset = load_dataset(dataset_name=config['experiment']['dataset'], split="train")
    if config['experiment'].get('name') == "sample_run":
        # Use tiny subset for demo
        indices = torch.arange(200)
        full_train_dataset = torch.utils.data.Subset(full_train_dataset, indices)
        print("Using tiny subset (200 samples) for fast demo.")

    full_test_dataset = load_dataset(dataset_name=config['experiment']['dataset'], split="test")
    if config['experiment'].get('name') == "sample_run":
         indices = torch.arange(50)
         full_test_dataset = torch.utils.data.Subset(full_test_dataset, indices)

    test_loader = DataLoader(full_test_dataset, batch_size=config['training']['batch_size'], shuffle=False)
    
    # 2. Partition Data
    print(f"Partitioning data among {config['experiment']['num_clients']} clients...")
    client_partitions = partition_dataset(full_train_dataset, config['experiment']['num_clients'])

    # 3. Initialize Global Model
    global_model = get_model()
    global_model.to(DEVICE)
    global_parameters = [val.cpu().numpy() for _, val in global_model.state_dict().items()]

    # 4. Simulation Loop
    print("Starting Federated Learning Simulation (Custom Loop)...")
    rounds = config['experiment']['rounds']
    num_clients = config['experiment']['num_clients']
    
    for round_num in range(1, rounds + 1):
        print(f"\n--- Round {round_num} ---")
        
        # Sample clients (all for now, or random subset)
        # Using all clients for simplicity in this demo
        selected_clients = range(num_clients)
        
        client_updates = []
        client_metrics = []
        
        for cid in selected_clients:
            print(f"Client {cid} training...")
            partition = client_partitions[cid]
            train_loader = DataLoader(partition, batch_size=config['training']['batch_size'], shuffle=True)
            
            # Privacy Config
            privacy_config = {
                'enabled': config['privacy']['enabled'],
                'target_epsilon': config['privacy']['target_epsilon'],
                'target_delta': float(config['privacy']['target_delta']),
                'max_grad_norm': config['privacy']['max_grad_norm']
            }
            
            # Instantiate Client
            client = MedClient(train_loader, config['training']['epochs'], DEVICE, privacy_config)
            
            # Set parameters
            client.set_parameters(global_parameters)
            
            # Fit
            # Note: client.fit signature in flwr.Client is different from our internal method, 
            # but since we are calling it directly, we can use our MedClient methods.
            # However, MedClient inherits from NumPyClient, so we should use its methods.
            # fit() returns (parameters, num_examples, metrics)
            updated_params, num_examples, metrics = client.fit(global_parameters, config={})
            
            client_updates.append((updated_params, num_examples))
            client_metrics.append((num_examples, metrics))
            
        # Aggregate
        # We can use Flower's aggregate_fit, but we need to wrap the results in FitRes
        # Or just implement FedAvg manually here for simplicity
        print("Aggregating updates...")
        
        # Simple FedAvg implementation
        aggregated_weights = [np.zeros_like(w) for w in global_parameters]
        total_examples = sum([num_examples for _, num_examples in client_updates])
        
        for params, num_examples in client_updates:
            for i, weight in enumerate(params):
                aggregated_weights[i] += weight * num_examples
        
        global_parameters = [w / total_examples for w in aggregated_weights]

        # Update global model for evaluation
        params_dict = zip(global_model.state_dict().keys(), global_parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        global_model.load_state_dict(state_dict)
        
        # Evaluate
        print("Evaluating global model...")
        global_model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE).squeeze().long()
                outputs = global_model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        accuracy = correct / total
        
        # Check epsilon from first client (assuming homogeneous)
        epsilon = client_metrics[0][1].get("epsilon", 0.0)
        # Approximate loss from last client for demo purposes
        loss = client_metrics[0][1].get("loss", 0.0) 
        
        print(f"Round {round_num} complete. Accuracy: {accuracy:.4f}, Privacy Budget Spent: epsilon = {epsilon:.2f}")
        log_metrics(round_num, accuracy, epsilon, loss)

    print("Simulation Complete.")

if __name__ == "__main__":
    main()
