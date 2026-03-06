# Privacy-Preserving Federated Medical Image Classification

This project demonstrates a secure, privacy-preserving federated learning system for medical image classification using Differential Privacy (DP). It simulates multiple hospitals collaborating to train a shared model without sharing raw patient data.

## Features

- **Federated Learning**: Uses [Flower](https://flower.ai/) to manage client-server communication.
- **Differential Privacy**: Uses [Opacus](https://opacus.ai/) to add gradient noise and clipping during local training, providing formal privacy guarantees.
- **Secure Aggregation Simulation**: Implements encryption simulation for model updates.
- **Medical Imaging**: Designed for Chest X-Ray (Pneumonia) or Diabetic Retinopathy classification.
- **Comprehensive Evaluation**: Metrics for Accuracy, Precision, Recall, F1-score, and Privacy Budget ($\epsilon$).

## Directory Structure

- `data/`: Dataset handling and partitioning.
- `models/`: PyTorch model definitions.
- `federated/`: Flower client and server logic.
- `privacy/`: Differential Privacy mechanism and accounting.
- `encryption/`: Encryption utilities.
- `experiments/`: Scripts for running baseline and FL experiments.
- `evaluation/`: plotting and analysis tools.

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### 1. Run Federated Learning Simulation
Run the main simulation. This will now log real-time metrics to `metrics.csv`.

```bash
python main.py
```

### 2. Launch Interactive Dashboard
Visualize the training progress, privacy budget, and accuracy in real-time.

```bash
streamlit run dashboard.py
```

### 3. Monitor Progress
The script prints logs to the console, while the dashboard provides a rich visual interface.

### 4. Visualizations (Static)
The system automatically tracks metrics. You can regenerate the performance plots using:

```bash
python evaluation/plot_results.py
```

## Results
- **Report**: A detailed research report draft is available at `research_report.md`.
- **Plots**: Performance and privacy plots are saved in the `evaluation/` directory.
- **Logs**: Training logs are printed to the console.

## Configuration
You can customize the simulation by editing `config.yaml`:
- `experiment.rounds`: Number of FL rounds (default: 5)
- `experiment.num_clients`: Number of simulated clients (default: 2)
- `privacy.target_epsilon`: Desired privacy budget (default: 10.0)
- `training.batch_size`: Batch size for local training

