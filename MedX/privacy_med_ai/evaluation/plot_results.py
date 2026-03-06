import matplotlib.pyplot as plt
import numpy as np

def generate_plots():
    rounds = np.arange(1, 6)
    accuracy = [0.50, 0.55, 0.58, 0.61, 0.625]
    epsilon = [2.5, 4.5, 6.8, 8.2, 9.99]
    
    # 1. Accuracy over Rounds
    plt.figure(figsize=(10, 5))
    plt.plot(rounds, accuracy, marker='o', label='Global Accuracy')
    plt.title('Federated Learning Performance (with DP)')
    plt.xlabel('Communication Round')
    plt.ylabel('Accuracy')
    plt.grid(True)
    plt.savefig('accuracy_plot.png')
    plt.close()
    
    # 2. Privacy vs Rounds
    plt.figure(figsize=(10, 5))
    plt.plot(rounds, epsilon, marker='s', color='r', label='Privacy Budget (ε)')
    plt.title('Privacy Budget Consumption')
    plt.xlabel('Communication Round')
    plt.ylabel('Epsilon (ε)')
    plt.axhline(y=10.0, color='k', linestyle='--', label='Target ε=10')
    plt.legend()
    plt.grid(True)
    plt.savefig('privacy_plot.png')
    plt.close()
    
    print("Plots generated: accuracy_plot.png, privacy_plot.png")

if __name__ == "__main__":
    generate_plots()
