import streamlit as st
import pandas as pd
import time
import os
import matplotlib.pyplot as plt

st.set_page_config(page_title="Federated Medical AI Dashboard", layout="wide")

st.title("🏥 Privacy-Preserving Federated Medical AI")
st.markdown("Real-time monitoring of decentralized training with Differential Privacy.")

# Metrics file path
METRICS_FILE = "metrics.csv"
if not os.path.exists(METRICS_FILE):
    # Create empty file if not exists
    pd.DataFrame(columns=["Round", "Accuracy", "Privacy_Epsilon", "Loss"]).to_csv(METRICS_FILE, index=False)

# Layout
col1, col2, col3 = st.columns(3)
placeholder_metrics = st.empty()
placeholder_charts = st.empty()

def load_data():
    if os.path.exists(METRICS_FILE):
        try:
            return pd.read_csv(METRICS_FILE)
        except pd.errors.EmptyDataError:
            return pd.DataFrame(columns=["Round", "Accuracy", "Privacy_Epsilon", "Loss"])
    return pd.DataFrame(columns=["Round", "Accuracy", "Privacy_Epsilon", "Loss"])

while True:
    df = load_data()
    
    if not df.empty:
        last_round = df.iloc[-1]
        
        with col1:
            st.metric("Global Accuracy", f"{last_round['Accuracy']:.2%}")
        with col2:
            st.metric("Privacy Budget Given", "10.0")
        with col3:
            st.metric("Privacy Spent (ε)", f"{last_round['Privacy_Epsilon']:.2f}", delta_color="inverse")

        # Charts
        with placeholder_charts.container():
            chart_col1, chart_col2 = st.columns(2)
            
            with chart_col1:
                st.subheader("Accuracy / Loss Trend")
                st.line_chart(df.set_index("Round")[["Accuracy", "Loss"]])
                
            with chart_col2:
                st.subheader("Privacy Consumption")
                st.line_chart(df.set_index("Round")[["Privacy_Epsilon"]])

            st.dataframe(df.style.highlight_max(axis=0), use_container_width=True)

    time.sleep(2) # Refresh every 2 seconds
