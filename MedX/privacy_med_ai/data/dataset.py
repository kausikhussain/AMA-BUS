import torch
from torchvision import transforms
from torch.utils.data import DataLoader, Subset
import medmnist
from medmnist import INFO

def load_dataset(dataset_name="pneumoniamnist", download=True, split="train"):
    """
    Loads a MedMNIST dataset.
    
    Args:
        dataset_name (str): Name of the dataset (e.g., 'pneumoniamnist', 'retinamnist').
        download (bool): Whether to download the data.
        split (str): 'train', 'val', or 'test'.
        
    Returns:
        dataset (torch.utils.data.Dataset): The requested dataset.
    """
    info = INFO[dataset_name]
    DataClass = getattr(medmnist, info['python_class'])
    
    # Preprocessing
    if split == "train":
        data_transform = transforms.Compose([
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[.5], std=[.5])
        ])
    else:
        data_transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[.5], std=[.5])
        ])
    
    dataset = DataClass(split=split, transform=data_transform, download=download)
    return dataset

def get_dataloader(dataset, batch_size=32, shuffle=True):
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)
