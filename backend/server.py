from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd
import pickle
import os

app = Flask(__name__)
CORS(app)  # Allows React to talk to this server

DB_FILE = "budget_burners.db"

# --- LOAD ML BRAINS ---
try:
    with open('model_burner.pkl', 'rb') as f:
        model_burner = pickle.load(f)
    with open('model_forecast.pkl', 'rb') as f:
        model_forecast = pickle.load(f)
    print("✅ ML Models Loaded.")
except:
    print("⚠️ ML Models missing. Run ml_brain.py first.")
    model_burner = None
    model_forecast = None

def run_query(query, params=(), fetch=False):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(query, params)
    if fetch:
        data = cursor.fetchall()
        cols = [description[0] for description in cursor.description]
        result = [dict(zip(cols, row)) for row in data]
    else:
        conn.commit()
        result = None
    conn.close()
    return result

# --- API ENDPOINTS ---

@app.route('/transactions', methods=['GET'])
def get_transactions():
    # Get last 20 transactions
    data = run_query("SELECT * FROM expenses ORDER BY date DESC, id DESC LIMIT 20", fetch=True)
    return jsonify(data)

@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    # Fetch all data to calculate totals
    data = run_query("SELECT * FROM expenses", fetch=True)
    df = pd.DataFrame(data)
    
    # Default State (Empty DB)
    if df.empty:
        return jsonify({
            "income": 0, "expense": 0, "balance": 0, "forecast": 0,
            "modes": {"Online": 0, "Cash": 0}
        })

    # 1. Total Income & Expense
    income = df[df['transaction_type'] == 'Income']['amount'].sum()
    expense = df[df['transaction_type'] == 'Expense']['amount'].sum()
    balance = income - expense
    
    # 2. Wallet Breakdown (Online vs Cash ONLY)
    modes = {"Online": 0, "Cash": 0}
    
    for mode in modes.keys():
        # How much entered this wallet (Income) vs left it (Expense)
        m_inc = df[(df['payment_mode'] == mode) & (df['transaction_type'] == 'Income')]['amount'].sum()
        m_exp = df[(df['payment_mode'] == mode) & (df['transaction_type'] == 'Expense')]['amount'].sum()
        modes[mode] = m_inc - m_exp

    # 3. ML Forecast (Month End Prediction)
    forecast_val = 0
    if model_forecast and expense > 0:
        forecast_val = model_forecast.predict([[30]])[0]

    return jsonify({
        "income": income,
        "expense": expense,
        "balance": balance,
        "forecast": round(forecast_val, 2),
        "modes": modes
    })

@app.route('/add', methods=['POST'])
def add_transaction():
    data = request.json
    try:
        run_query(
            "INSERT INTO expenses (date, category, amount, description, transaction_type, payment_mode) VALUES (?, ?, ?, ?, ?, ?)",
            (data['date'], data['category'], float(data['amount']), data['description'], data['type'], data['mode'])
        )
        
        # ML CHECK (Burner Alert) - Only for Expenses
        alert = None
        if data['type'] == 'Expense' and model_burner:
            # Predict: -1 = Anomaly
            is_anomaly = model_burner.predict([[float(data['amount'])]])[0]
            if is_anomaly == -1:
                alert = "🔥 High Burn Alert: This spending is unusually high for you!"

        return jsonify({"message": "Saved", "alert": alert})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-all', methods=['DELETE'])
def delete_all():
    try:
        run_query("DELETE FROM expenses")
        run_query("DELETE FROM sqlite_sequence WHERE name='expenses'") # Reset IDs
        return jsonify({"message": "All data wiped successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)