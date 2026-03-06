import torch
from opacus import PrivacyEngine

def apply_dp(model, optimizer, data_loader, target_epsilon, target_delta, max_grad_norm, epochs=1):
    """
    Wraps the model, optimizer, and data_loader with Opacus PrivacyEngine.
    
    Args:
        model (nn.Module): The PyTorch model.
        optimizer (optim.Optimizer): The optimizer.
        data_loader (DataLoader): The data loader.
        target_epsilon (float): Target epsilon for DP.
        target_delta (float): Target delta for DP.
        max_grad_norm (float): Maximum gradient norm for clipping.
        epochs (int): Number of epochs.
        
    Returns:
        model, optimizer, data_loader: Privacy-enabled components.
    """
    privacy_engine = PrivacyEngine()
    
    model, optimizer, data_loader = privacy_engine.make_private_with_epsilon(
        module=model,
        optimizer=optimizer,
        data_loader=data_loader,
        target_epsilon=target_epsilon,
        target_delta=target_delta,
        epochs=epochs, # Correctly pass epochs
        max_grad_norm=max_grad_norm,
    )
    
    return model, optimizer, data_loader, privacy_engine
