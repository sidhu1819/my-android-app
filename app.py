import streamlit as st
import pandas as pd
import sqlite3
import pickle
import datetime
import os

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================
st.set_page_config(page_title="Budget+Burners", page_icon="🔥", layout="centered")
DB_FILE = "budget_burners.db"

# Load ML Models (Cached so it doesn't reload every click)
@st.cache_resource
def load_models():
    try:
        with open('model_burner.pkl', 'rb') as f:
            burner = pickle.load(f)
        with open('model_forecast.pkl', 'rb') as f:
            forecast = pickle.load(f)
        return burner, forecast
    except FileNotFoundError:
        return None, None

model_burner, model_forecast = load_models()

# Database Connection Helper
def run_query(query, params=()):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    conn.close()

def get_data(query):
    conn = sqlite3.connect(DB_FILE)
    df = pd.read_sql(query, conn)
    conn.close()
    return df

# ==========================================
# 2. THE UI (User Interface)
# ==========================================
st.title("🔥 Budget + Burners")
st.write("### Track Smart. Stop Burning.")

# --- SECTION A: ADD TRANSACTION ---
with st.expander("➕ Add New Transaction", expanded=True):
    with st.form("entry_form"):
        # ROW 1: Type & Date
        col1, col2 = st.columns(2)
        with col1:
            trans_type = st.selectbox("Type", ["Expense", "Income"])
        with col2:
            trans_date = st.date_input("Date", datetime.date.today())
        
        # ROW 2: Details
        amount = st.number_input("Amount (₹)", min_value=0.0, step=10.0)
        category = st.selectbox("Category", [
            "Food", "Travel", "Bills", "Shopping", "Entertainment", 
            "Pocket Money", "Internship", "Other"
        ])
        
        # ROW 3: Mode & Desc
        mode = st.selectbox("Payment Mode", ["PhonePe (Online)", "Cash", "Borrowed", "Lent"])
        desc = st.text_input("Description (Optional)", placeholder="e.g. Burger King")
        
        submitted = st.form_submit_button("💾 Save Transaction")

        if submitted:
            # 1. Save to DB
            run_query(
                "INSERT INTO expenses (date, category, amount, description, transaction_type, payment_mode) VALUES (?, ?, ?, ?, ?, ?)",
                (trans_date, category, amount, desc, trans_type, mode)
            )
            st.success("Saved!")
            
            # 2. ML CHECK: BURNER ALERT (Only for Expenses)
            if trans_type == "Expense" and model_burner:
                # Prediction: -1 is Anomaly, 1 is Normal
                is_anomaly = model_burner.predict([[amount]])[0]
                if is_anomaly == -1:
                    st.error(f"⚠️ HIGH BURN ALERT: ₹{amount} is unusually high for you!")
            
            # Refresh page to show new data
            st.rerun()

# --- SECTION B: DASHBOARD ---
st.divider()

# Get Data for current month
current_month = datetime.date.today().strftime("%Y-%m")
df = get_data(f"SELECT * FROM expenses WHERE strftime('%Y-%m', date) = '{current_month}'")

if not df.empty:
    # Calculate Totals
    income = df[df['transaction_type'] == 'Income']['amount'].sum()
    expenses = df[df['transaction_type'] == 'Expense']['amount'].sum()
    balance = income - expenses

    # Metrics
    c1, c2, c3 = st.columns(3)
    c1.metric("Income", f"₹{income:,.0f}", delta_color="normal")
    c2.metric("Burned", f"₹{expenses:,.0f}", delta_color="inverse")
    c3.metric("Balance", f"₹{balance:,.0f}")

    # --- ML FORECAST ---
    if model_forecast and expenses > 0:
        day_of_month = datetime.date.today().day
        predicted_total = model_forecast.predict([[30]])[0]
        st.info(f"🔮 **AI Forecast:** At this rate, you will burn **₹{predicted_total:,.0f}** by month-end.")

    # --- RECENT HISTORY ---
    st.subheader("Recent Activity")
    st.dataframe(
        df.sort_values(by='date', ascending=False)[['date', 'category', 'amount', 'transaction_type', 'payment_mode']],
        hide_index=True,
        use_container_width=True
    )
else:
    st.info("No data found for this month. Add a transaction above!")