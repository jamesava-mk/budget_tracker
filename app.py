"""
Smaat - Flask Application
A comprehensive expense tracking and forecasting app with AI-powered insights
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import sqlite3
import json
import os
from functools import wraps
import csv
import io
from statistical_forecaster import StatisticalForecaster
from category_analyzer import CategoryAnalyzer

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('budget_tracker.db')
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Transactions table
    c.execute('''CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Budgets table
    c.execute('''CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        month TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Schedule/Calendar entries table
    c.execute('''CREATE TABLE IF NOT EXISTS schedule_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        entry_type TEXT NOT NULL,
        amount REAL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Forecasts cache table
    c.execute('''CREATE TABLE IF NOT EXISTS forecasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        forecast_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# ============================================================================
# AUTHENTICATION HELPER FUNCTIONS
# ============================================================================

def login_required(f):
    """Decorator to require login for a route"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_db():
    """Get database connection"""
    conn = sqlite3.connect('budget_tracker.db')
    conn.row_factory = sqlite3.Row
    return conn

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Register a new user"""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username or not email or not password:
            return render_template('register.html', error='All fields required')
        
        conn = get_db()
        c = conn.cursor()
        
        try:
            c.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                     (username, email, generate_password_hash(password)))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            conn.close()
            return render_template('register.html', error='Username or email already exists')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = c.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('dashboard'))
        
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    return redirect(url_for('login'))

# ============================================================================
# MAIN APPLICATION ROUTES
# ============================================================================

@app.route('/')
def index():
    """Redirect to dashboard if logged in, else to login"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard page"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    # Get current month transactions
    today = datetime.now()
    first_day = today.replace(day=1)
    
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? AND date >= ? 
                 ORDER BY date DESC LIMIT 10''',
             (user_id, first_day.date()))
    recent_transactions = c.fetchall()
    
    # Calculate spending summary
    c.execute('''SELECT category, SUM(amount) as total 
                 FROM transactions 
                 WHERE user_id = ? AND date >= ? AND type = 'expense'
                 GROUP BY category''',
             (user_id, first_day.date()))
    spending_by_category = c.fetchall()
    
    # Get total income and expenses
    c.execute('''SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
                 FROM transactions 
                 WHERE user_id = ? AND date >= ?''',
             (user_id, first_day.date()))
    summary = c.fetchone()
    
    conn.close()
    
    return render_template('dashboard.html',
                         recent_transactions=recent_transactions,
                         spending_by_category=spending_by_category,
                         summary=summary)

@app.route('/transactions', methods=['GET', 'POST'])
@login_required
def transactions():
    """Transactions management page"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'POST':
        # Add new transaction
        amount = float(request.form.get('amount'))
        category = request.form.get('category')
        description = request.form.get('description')
        date = request.form.get('date')
        transaction_type = request.form.get('type')
        
        c.execute('''INSERT INTO transactions 
                     (user_id, amount, category, description, date, type)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                 (user_id, amount, category, description, date, transaction_type))
        conn.commit()
    
    # Get all transactions for user
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date DESC''', (user_id,))
    user_transactions = c.fetchall()
    
    conn.close()
    return render_template('transactions.html', transactions=user_transactions)

@app.route('/forecast')
@login_required
def forecast():
    """AI-powered forecast page"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    # Get user's transaction history
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date ASC''', (user_id,))
    transactions = c.fetchall()
    conn.close()
    
    # Generate forecast using AI
    forecaster = StatisticalForecaster()
    forecast_data = forecaster.forecast(transactions)
    
    return render_template('forecast.html', forecast=forecast_data)

@app.route('/calendar')
@login_required
def calendar():
    """Calendar and schedule page"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    # Get all schedule entries
    c.execute('''SELECT * FROM schedule_entries 
                 WHERE user_id = ? 
                 ORDER BY date ASC''', (user_id,))
    entries = c.fetchall()
    conn.close()
    
    return render_template('calendar.html', entries=entries)

@app.route('/profile')
@login_required
def profile():
    """User profile page"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    
    # Get spending statistics
    c.execute('''SELECT 
                    COUNT(*) as transaction_count,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
                 FROM transactions WHERE user_id = ?''', (user_id,))
    stats = c.fetchone()
    
    conn.close()
    return render_template('profile.html', user=user, stats=stats)

# ============================================================================
# API ENDPOINTS FOR AJAX REQUESTS
# ============================================================================

@app.route('/api/transactions', methods=['GET'])
@login_required
def api_transactions():
    """Get transactions as JSON"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date DESC''', (user_id,))
    transactions = c.fetchall()
    conn.close()
    
    return jsonify([dict(t) for t in transactions])

@app.route('/api/spending-by-category', methods=['GET'])
@login_required
def api_spending_by_category():
    """Get spending by category"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''SELECT category, SUM(amount) as total 
                 FROM transactions 
                 WHERE user_id = ? AND type = 'expense'
                 GROUP BY category''', (user_id,))
    data = c.fetchall()
    conn.close()
    
    return jsonify([dict(d) for d in data])

@app.route('/api/spending-trends', methods=['GET'])
@login_required
def api_spending_trends():
    """Get spending trends over time"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''SELECT date, SUM(amount) as total 
                 FROM transactions 
                 WHERE user_id = ? AND type = 'expense'
                 GROUP BY date
                 ORDER BY date ASC''', (user_id,))
    data = c.fetchall()
    conn.close()
    
    return jsonify([dict(d) for d in data])

@app.route('/api/schedule', methods=['GET', 'POST', 'DELETE'])
@login_required
def api_schedule():
    """Manage schedule entries"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        c.execute('''SELECT * FROM schedule_entries 
                     WHERE user_id = ? 
                     ORDER BY date ASC''', (user_id,))
        entries = c.fetchall()
        conn.close()
        return jsonify([dict(e) for e in entries])
    
    elif request.method == 'POST':
        data = request.json
        c.execute('''INSERT INTO schedule_entries 
                     (user_id, title, description, date, entry_type, amount, category)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                 (user_id, data['title'], data['description'], data['date'],
                  data['type'], data.get('amount'), data.get('category')))
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'})
    
    elif request.method == 'DELETE':
        entry_id = request.json.get('id')
        c.execute('DELETE FROM schedule_entries WHERE id = ? AND user_id = ?',
                 (entry_id, user_id))
        conn.commit()
        conn.close()
        return jsonify({'status': 'success'})

@app.route('/api/export', methods=['GET'])
@login_required
def api_export():
    """Export transactions as CSV"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date DESC''', (user_id,))
    transactions = c.fetchall()
    conn.close()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Category', 'Description', 'Amount', 'Type'])
    
    for t in transactions:
        writer.writerow([t['date'], t['category'], t['description'], t['amount'], t['type']])
    
    response_output = output.getvalue()
    output.close()
    
    return response_output, 200, {
        'Content-Disposition': 'attachment; filename=transactions.csv'
    }

@app.route('/api/recommendations', methods=['GET'])
@login_required
def api_recommendations():
    """Get AI-powered spending recommendations"""
    user_id = session['user_id']
    conn = get_db()
    c = conn.cursor()
    
    # Get user's transaction history
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date ASC''', (user_id,))
    transactions = c.fetchall()
    conn.close()
    
    # Generate recommendations
    analyzer = CategoryAnalyzer()
    recommendations = analyzer.generate_recommendations(transactions)
    
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
