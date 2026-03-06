import os
import subprocess
import sys

def run_experiment(config_path="config.yaml"):
    print(f"Running experiment with config: {config_path}")
    subprocess.run([sys.executable, "main.py", "--config", config_path], check=True)

if __name__ == "__main__":
    # In a real scenario, this script would modify config.yaml dynamically
    # For now, it just runs the default main.py
    run_experiment()
