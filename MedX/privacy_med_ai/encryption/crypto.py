from cryptography.fernet import Fernet
import pickle

def generate_key():
    return Fernet.generate_key()

def encrypt_model_updates(weights, key):
    """
    Encrypts model weights (list of numpy arrays) using Fernet (symmetric encryption).
    
    Args:
        weights (List[np.ndarray]): Model weights.
        key (bytes): Encryption key.
        
    Returns:
        bytes: Encrypted serialized weights.
    """
    f = Fernet(key)
    serialized = pickle.dumps(weights)
    encrypted = f.encrypt(serialized)
    return encrypted

def decrypt_model_updates(encrypted_data, key):
    """
    Decrypts model weights.
    
    Args:
        encrypted_data (bytes): Encrypted data.
        key (bytes): Encryption key.
        
    Returns:
        List[np.ndarray]: Decrypted model weights.
    """
    f = Fernet(key)
    decrypted = f.decrypt(encrypted_data)
    weights = pickle.loads(decrypted)
    return weights
