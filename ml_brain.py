import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import pickle
import warnings
import os

# Suppress warnings for clean output
warnings.filterwarnings('ignore')

DB_FILE = "budget_burners.db"

def train_brain():
    print("--- 🧠 STARTING PHASE 3: INTELLIGENCE ---")
    
    # 1. LOAD DATA FROM OFFLINE DB
    if not os.path.exists(DB_FILE):
        print(f"❌ Error: '{DB_FILE}' not found. Run 'setup_data.py' first!")
        return

    conn = sqlite3.connect(DB_FILE)
    # Load all columns
    df_all = pd.read_sql_query("SELECT * FROM expenses", conn)
    conn.close()

    if df_all.empty:
        print("❌ Error: Database is empty. Run Phase 2 first!")
        return

    # 2. FILTER: TRAIN ONLY ON 'EXPENSES'
    # We ignore 'Income' for the "Burner" models
    df = df_all[df_all['transaction_type'] == 'Expense'].copy()
    
    if df.empty:
        print("⚠️ Warning: No expenses found (only Income?). Cannot train models.")
        return

    # Preprocessing
    df['date'] = pd.to_datetime(df['date'])
    df['day_numeric'] = df['date'].dt.day  # Day of month (1-31)
    
    print(f"✅ Loaded {len(df)} Expense transactions for training.")

    # ==========================================
    # MODEL 1: THE "BURNER" (Anomaly Detection)
    # ==========================================
    # Logic: Detects if a specific transaction amount is suspiciously high.
    
    print("🔸 Training 'Burner' (Anomaly) Model...")
    
    # Prepare data (IsolationForest needs 2D array)
    X_anomaly = df[['amount']].values 
    
    # Contamination=0.05 means we guess ~5% of your past spendings were 'outliers'
    model_anomaly = IsolationForest(contamination=0.05, random_state=42)
    model_anomaly.fit(X_anomaly)
    
    # Save the model
    with open('model_burner.pkl', 'wb') as f:
        pickle.dump(model_anomaly, f)
        
    print("   -> Saved 'model_burner.pkl'")

    # ==========================================
    # MODEL 2: THE "BUDGET" (Forecasting)
    # ==========================================
    # Logic: Predicts Month-End total based on daily spending trend.
    
    print("🔹 Training 'Budget' (Forecast) Model...")
    
    # Group by Day to get Cumulative Spending curve
    # Day 1: 500, Day 2: 1200 (500+700), etc.
    daily_data = df.groupby('day_numeric')['amount'].sum().cumsum().reset_index()
    daily_data.columns = ['day', 'total_spent']
    
    if len(daily_data) < 2:
        print("   ⚠️ Not enough daily data for forecasting. Skipping Forecast Model.")
        # Create a dummy model to prevent app crash
        model_forecast = LinearRegression()
        model_forecast.fit([[1]], [[0]]) 
    else:
        X_forecast = daily_data[['day']]
        y_forecast = daily_data['total_spent']
        
        model_forecast = LinearRegression()
        model_forecast.fit(X_forecast, y_forecast)
    
    # Save the model
    with open('model_forecast.pkl', 'wb') as f:
        pickle.dump(model_forecast, f)

    print("   -> Saved 'model_forecast.pkl'")
    
    # ==========================================
    # TEST DRIVE (Verify it works)
    # ==========================================
    print("\n--- 🧪 TEST DRIVE ---")
    
    # Test Anomaly: Is 50,000 an anomaly?
    test_val = 50000
    res = model_anomaly.predict([[test_val]])[0] # -1 = Anomaly, 1 = Normal
    status = "⚠️ ANOMALY" if res == -1 else "✅ Normal"
    print(f"Test: Spending {test_val} -> {status}")
    
    # Test Forecast: Predict total for Day 30
    pred = model_forecast.predict([[30]])[0]
    print(f"Test: Predicted Month-End Total -> {pred:,.2f}")

    print("\n✅ Phase 3 Complete. Brains are ready.")

if __name__ == "__main__":
    train_brain()