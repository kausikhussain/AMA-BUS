try:
    import flwr
    print(f"flwr version: {flwr.__version__}")
except ImportError as e:
    print(f"Failed to import flwr: {e}")

try:
    import ray
    print(f"ray version: {ray.__version__}")
except ImportError as e:
    print(f"Failed to import ray: {e}")

try:
    from flwr.simulation import start_simulation
    print("Successfully imported flwr.simulation.start_simulation")
except ImportError as e:
    print(f"Failed to import flwr.simulation.start_simulation: {e}")
