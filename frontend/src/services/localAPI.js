// frontend/src/services/localAPI.js

const DB_KEY = 'budget_burners_data';

// --- Helper: Get Data ---
export const getLocalData = () => {
  const str = localStorage.getItem(DB_KEY);
  return str ? JSON.parse(str) : [];
};

// --- Helper: Save Data ---
const saveLocalData = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- 1. Add Transaction (Replaces POST /api/transactions) ---
export const addTransaction = (transaction) => {
  const current = getLocalData();
  const newTxn = {
    id: Date.now(), // Unique ID based on timestamp
    ...transaction,
    amount: parseFloat(transaction.amount), // Ensure number
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  };
  
  const updated = [newTxn, ...current]; // Add to top of list
  saveLocalData(updated);
  return newTxn;
};

// --- 2. Get History (Replaces GET /api/history) ---
export const getHistory = () => {
  return getLocalData();
};

// --- 3. Dashboard Stats (Replaces GET /api/dashboard) ---
export const getDashboardStats = () => {
  const transactions = getLocalData();
  if (transactions.length === 0) {
    return { total_spent: 0, forecast: 0, burn_rate: 0 };
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const daysActive = new Set(transactions.map(t => t.date)).size || 1;
  const burnRate = (totalSpent / daysActive).toFixed(2);
  
  // Simple forecast: Burn Rate * 30 days
  const forecast = (burnRate * 30).toFixed(2);

  return {
    total_spent: totalSpent.toFixed(2),
    burn_rate: burnRate,
    forecast: forecast
  };
};

// --- 4. Burner Logic (Replaces Python ML Model) ---
export const checkBurnerAnomaly = (amount) => {
  const transactions = getLocalData();
  if (transactions.length < 5) return { is_burner: false, threshold: 0 };

  const amounts = transactions.map(t => t.amount);
  const sum = amounts.reduce((a, b) => a + b, 0);
  const avg = sum / amounts.length;

  // Standard Deviation Calculation
  const squareDiffs = amounts.map(val => Math.pow(val - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  // Threshold: Mean + 2 * StdDev
  const threshold = avg + (2 * stdDev);

  return {
    is_burner: amount > threshold,
    threshold: threshold.toFixed(2)
  };
};