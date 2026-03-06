import numpy as np
from torch.utils.data import Subset

def partition_dataset(dataset, num_clients, iid=True):
    """
    Splits a dataset into `num_clients` partitions.
    
    Args:
        dataset (torch.utils.data.Dataset): The dataset to split.
        num_clients (int): Number of clients.
        iid (bool): If True, split data identically and independently.
        
    Returns:
        partitions (List[Subset]): List of dataset subsets for each client.
    """
    num_items = len(dataset)
    indices = np.arange(num_items)
    
    if iid:
        np.random.shuffle(indices)
        partitions = []
        split_size = num_items // num_clients
        for i in range(num_clients):
            start = i * split_size
            end = (i + 1) * split_size if i < num_clients - 1 else num_items
            partition_indices = indices[start:end]
            partitions.append(Subset(dataset, partition_indices))
    else:
        # Simple non-IID: sort by label then split
        # Note: This is a simplified non-IID simulation
        targets = np.array(dataset.labels)
        sorted_indices = np.argsort(targets)
        partitions = []
        split_size = num_items // num_clients
        for i in range(num_clients):
            start = i * split_size
            end = (i + 1) * split_size if i < num_clients - 1 else num_items
            partition_indices = indices[sorted_indices[start:end]]
            partitions.append(Subset(dataset, partition_indices))
            
    return partitions
