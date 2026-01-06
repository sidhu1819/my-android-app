import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sqlite3
import os

# ==========================================
# CONFIGURATION
# ==========================================
CSV_FILE = "expenses.csv"
DB_FILE = "budget_burners.db" 
# ==========================================

def run_phase_2():
    print("--- 🚀 STARTING PHASE 2: DATA (UPDATED SCHEMA) ---")

    # 1. LOAD DATA
    if not os.path.exists(CSV_FILE):
        print(f"❌ ERROR: '{CSV_FILE}' not found.")
        return
    
    df = pd.read_csv(CSV_FILE)
    print(f"✅ Loaded {CSV_FILE}.")

    # 2. CLEANING
    df.columns = [c.lower().strip() for c in df.columns]
    
    rename_map = {
        'transaction_date': 'date', 'expense_type': 'category',
        'debit': 'amount', 'particulars': 'description'
    }
    df.rename(columns=rename_map, inplace=True)

    # Clean Amount
    df['amount'] = df['amount'].astype(str).str.replace(',', '', regex=True)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')

    # Clean Date
    df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)
    
    # --- NEW: ADD DEFAULT COLUMNS FOR OLD DATA ---
    # Since CSV doesn't have mode/type, we assume defaults for training data
    df['transaction_type'] = 'Expense' 
    df['payment_mode'] = 'Online'      

    df.dropna(subset=['date', 'amount', 'category'], inplace=True)

    print(f"✅ Data Cleaned. {len(df)} records ready.")

    # 3. VISUALIZATIONS (Keep these for your report)
    print("📊 Generating Visuals...")
    sns.set_style("whitegrid")

    # Chart: Categories
    plt.figure(figsize=(10, 6))
    top_cats = df.groupby('category')['amount'].sum().nlargest(10)
    sns.barplot(x=top_cats.values, y=top_cats.index, hue=top_cats.index, palette='viridis', legend=False)
    plt.title('Top 10 Categories')
    plt.savefig('chart_categories.png')
    print("   -> Created 'chart_categories.png'")

    # 4. SAVE TO LOCAL DATABASE (SQLite) WITH NEW COLUMNS
    print("💾 Saving to Local Offline Database...")
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # UPDATED SCHEMA: Added transaction_type and payment_mode
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            category TEXT,
            amount REAL,
            description TEXT,
            transaction_type TEXT,
            payment_mode TEXT
        )
    ''')
    
    cursor.execute("DELETE FROM expenses")

    for _, row in df.iterrows():
        date_str = row['date'].strftime("%Y-%m-%d")
        desc = row['description'] if 'description' in row else 'No Description'
        
        # Insert with new columns
        cursor.execute("""
            INSERT INTO expenses (date, category, amount, description, transaction_type, payment_mode) 
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (date_str, row['category'], row['amount'], desc, row['transaction_type'], row['payment_mode'])
        )

    conn.commit()
    conn.close()
    
    print(f"✅ Success! Database updated with 'Payment Mode' & 'Income/Expense'.")

if __name__ == "__main__":
    run_phase_2()