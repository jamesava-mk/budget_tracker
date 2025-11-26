# Smart Budget Tracker - Code Explanation

## A Complete Line-by-Line Guide for Presentation

---

## Part 1: Application Setup (app.py - Lines 1-40)

### Import Statements
\`\`\`python
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
\`\`\`
- **Flask**: Web framework that handles HTTP requests and responses
- **render_template**: Renders HTML files with Python variables
- **request**: Access form data submitted by users
- **jsonify**: Convert Python objects to JSON for API responses
- **session**: Store user data temporarily (login information)
- **redirect, url_for**: Navigate users between pages

\`\`\`python
from werkzeug.security import generate_password_hash, check_password_hash
\`\`\`
- **generate_password_hash**: Converts plain text passwords into secure hashes
- **check_password_hash**: Verifies if entered password matches stored hash

\`\`\`python
from datetime import datetime, timedelta
import sqlite3
\`\`\`
- **datetime**: Handle dates and times for transactions
- **sqlite3**: Lightweight database that doesn't require a server

### Flask App Initialization
\`\`\`python
app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'
\`\`\`
- Creates the Flask application
- Sets a secret key for encrypting session data (should be changed in production)

---

## Part 2: Database Initialization (init_db function)

### SQLite Tables Creation

#### Users Table
\`\`\`python
c.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)''')
\`\`\`
- **id**: Auto-incrementing unique identifier
- **username**: Login name (must be unique)
- **email**: User's email (must be unique)
- **password**: Hashed password (never stored as plain text)
- **created_at**: Account creation timestamp

#### Transactions Table
\`\`\`python
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
\`\`\`
- **user_id**: Links transaction to specific user
- **amount**: Transaction value
- **category**: Type of expense (Food, Transport, etc.)
- **description**: What the transaction was for
- **date**: When the transaction occurred
- **type**: "income" or "expense"
- **FOREIGN KEY**: Ensures user exists before creating transaction

#### Schedules Table
\`\`\`python
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
\`\`\`
- Stores calendar entries, bills, reminders
- Allows users to plan ahead and track scheduled expenses

---

## Part 3: Authentication System

### Login Decorator
\`\`\`python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
\`\`\`

**How it works:**
1. `@wraps(f)`: Preserves the original function's metadata
2. `if 'user_id' not in session`: Checks if user is logged in
3. If not logged in: Redirect to login page
4. If logged in: Execute the protected page

### Registration Route
\`\`\`python
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Get form data
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Check all fields are provided
        if not username or not email or not password:
            return render_template('register.html', error='All fields required')
        
        # Insert into database
        c.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                 (username, email, generate_password_hash(password)))
\`\`\`

**Security features:**
1. Password is hashed using `generate_password_hash()` - never stored as plain text
2. `?` placeholders prevent SQL injection attacks
3. UNIQUE constraints prevent duplicate usernames/emails

### Login Route
\`\`\`python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Query database for user
        c.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = c.fetchone()
        
        # Verify password
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']  # Set session
            session['username'] = user['username']
            return redirect(url_for('dashboard'))
\`\`\`

**Login flow:**
1. Query database for user with matching username
2. Compare entered password with stored hash using `check_password_hash()`
3. If match: Store user_id in session (browser cookie)
4. Redirect to dashboard

---

## Part 4: Core Application Routes

### Dashboard Route
\`\`\`python
@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    
    # Get first day of current month
    today = datetime.now()
    first_day = today.replace(day=1)
    
    # Query transactions for this month
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? AND date >= ? 
                 ORDER BY date DESC LIMIT 10''',
             (user_id, first_day.date()))
    recent_transactions = c.fetchall()
\`\`\`

**What this does:**
1. `@login_required`: Only logged-in users can access
2. Gets current user's ID from session
3. Calculates first day of current month
4. Queries recent transactions for the dashboard display

### Spending Summary
\`\`\`python
c.execute('''SELECT category, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = ? AND date >= ? AND type = 'expense'
             GROUP BY category''',
         (user_id, first_day.date()))
spending_by_category = c.fetchall()
\`\`\`

**SQL breakdown:**
- **SELECT category, SUM(amount)**: Group expenses by category
- **GROUP BY category**: Sum all amounts for each category
- **WHERE type = 'expense'**: Only count expenses (not income)
- **Result**: [{'category': 'Food', 'total': 250}, ...]

---

## Part 5: Transaction Management

### Add Transaction
\`\`\`python
@app.route('/transactions', methods=['GET', 'POST'])
@login_required
def transactions():
    user_id = session['user_id']
    
    if request.method == 'POST':
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
\`\`\`

**Steps:**
1. Get form data from user submission
2. Convert amount to float (for decimal support)
3. Insert into transactions table with user_id link
4. `conn.commit()` saves to database

### Export Transactions (CSV)
\`\`\`python
@app.route('/api/export', methods=['GET'])
@login_required
def api_export():
    # Query all user transactions
    c.execute('''SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date DESC''', (user_id,))
    transactions = c.fetchall()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Category', 'Description', 'Amount', 'Type'])
    
    for t in transactions:
        writer.writerow([t['date'], t['category'], t['description'], 
                        t['amount'], t['type']])
    
    return response_output, 200, {
        'Content-Disposition': 'attachment; filename=transactions.csv'
    }
\`\`\`

**Export flow:**
1. Query all user transactions
2. Create CSV writer object
3. Write header row
4. Write each transaction as a row
5. Return as downloadable file with CSV headers

---

## Part 6: AI Forecasting Engine (statistical_forecaster.py)

### Time-Series Forecasting
\`\`\`python
class StatisticalForecaster:
    def forecast(self, transactions):
        # Organize spending by category
        category_spending = defaultdict(list)
        daily_totals = defaultdict(float)
        
        for t in transactions:
            if t['type'] == 'expense':
                category_spending[t['category']].append(t['amount'])
                daily_totals[t['date']] += t['amount']
\`\`\`

**What this does:**
1. `defaultdict(list)`: Creates dictionary with empty list as default
2. Loop through all transactions
3. Group expenses by category and date
4. Creates lists like: `{'Food': [12.50, 15.00, 20.00], ...}`

### Statistical Analysis
\`\`\`python
category_stats = {}
for category, amounts in category_spending.items():
    category_stats[category] = {
        'average': np.mean(amounts),
        'std': np.std(amounts),
        'min': np.min(amounts),
        'max': np.max(amounts),
        'count': len(amounts)
    }
\`\`\`

**Statistics calculated:**
- **mean**: Average spending in category
- **std (standard deviation)**: How much spending varies
- **min/max**: Lowest and highest expenses
- **count**: Number of transactions

### 90-Day Forecast Generation
\`\`\`python
for i in range(self.forecast_days):
    date = today + timedelta(days=i)
    avg_daily = np.mean(list(daily_totals.values()))
    # Add variance: multiply by (1 + random variance)
    forecast_values.append(avg_daily * (1 + np.random.normal(0, 0.1)))
    forecast_dates.append(date.strftime('%Y-%m-%d'))
\`\`\`

**Algorithm:**
1. Loop 90 times (90 days)
2. Calculate average daily spending
3. Add random variance (±10%) for realistic prediction
4. Store date and predicted value
5. Returns arrays for charting

---

## Part 7: AI Recommendation Engine (category_analyzer.py)

### Anomaly Detection
\`\`\`python
def detect_anomalies(self, transactions):
    for t in transactions:
        if t['type'] == 'expense':
            category = t['category']
            amounts = category_spending[category]
            
            if len(amounts) > 1:
                mean = np.mean(amounts)
                std = np.std(amounts)
                
                if std > 0:
                    z_score = abs((t['amount'] - mean) / std)
                    if z_score > self.anomaly_threshold:  # Default: 2.0
                        anomalies.append({...})
\`\`\`

**Z-Score Method Explained:**
- **Formula**: z_score = |value - mean| / standard_deviation
- **Interpretation**:
  - z_score = 1: 1 standard deviation (normal)
  - z_score = 2: 2 standard deviations (unusual)
  - z_score = 3: 3 standard deviations (very unusual)
- **Example**: If avg Food spending is $20 with std=$5
  - A $40 expense: z_score = |40-20|/5 = 4.0 → FLAGGED as anomaly

### Smart Recommendations
\`\`\`python
for cat, total in sorted_categories:
    percentage = (total / total_spending * 100)
    if percentage > 40:
        recommendations_list.append({
            'type': 'warning',
            'title': f'High {cat} spending',
            'message': f'You spent {percentage:.1f}% on {cat}',
            'action': 'Consider reducing spending in this category'
        })
\`\`\`

**Logic:**
1. Calculate percentage of total for each category
2. If one category is >40% of budget, flag as warning
3. Provide actionable recommendation
4. User can adjust spending habits

---

## Part 8: Frontend - HTML Templates

### Base Template Structure
\`\`\`html
<nav class="navbar">
    <!-- Navigation links -->
    <a href="{{ url_for('dashboard') }}">Dashboard</a>
    <a href="{{ url_for('transactions') }}">Transactions</a>
</nav>

<main class="main-content">
    {% block content %}{% endblock %}
</main>
\`\`\`

**Template features:**
- `{{ url_for() }}`: Generates URLs dynamically (if route changes, links update automatically)
- `{% block %}`: Allows child templates to insert custom content
- `{% if 'user_id' in session %}`: Conditional rendering based on login status

### Form Template with Validation
\`\`\`html
<form method="POST" class="form">
    <div class="form-group">
        <label for="amount">Amount</label>
        <input type="number" id="amount" name="amount" step="0.01" required>
    </div>
    <button type="submit" class="btn btn-primary">Add Transaction</button>
</form>
\`\`\`

**Form security:**
- **type="number"**: Only allows numeric input (client-side validation)
- **step="0.01"**: Allows up to 2 decimal places (for cents)
- **required**: Field must be filled before submission
- **method="POST"**: Sends data securely (not in URL)

### Dynamic Data Display
\`\`\`html
{% for transaction in recent_transactions %}
<div class="transaction-item">
    <div class="transaction-category">{{ transaction.category }}</div>
    <div class="transaction-description">{{ transaction.description }}</div>
    <div class="transaction-amount {% if transaction.type == 'expense' %}expense{% endif %}">
        {% if transaction.type == 'expense' %}-{% endif %}${{ "%.2f"|format(transaction.amount) }}
    </div>
</div>
{% endfor %}
\`\`\`

**Template logic:**
- `{% for %}`: Loops through each transaction
- `{{ transaction.category }}`: Outputs transaction category
- `{% if %}`: Conditional CSS class and formatting
- `"%.2f"|format()`: Formats number to 2 decimal places
- Result: Expenses show as red with minus sign, income as green with plus

---

## Part 9: Frontend - CSS Styling

### Theme System (CSS Variables)
\`\`\`css
:root {
    --primary: #6C63FF;
    --primary-dark: #5847D9;
    --accent-success: #00D084;
    --accent-danger: #FF6B6B;
    --bg-primary: #0F1117;
    --text-primary: #C9D1D9;
}
\`\`\`

**Why CSS variables?**
1. **Consistency**: Change primary color once, applies everywhere
2. **Dark mode**: Can easily swap for light theme
3. **Maintenance**: No need to search and replace hex codes

### Card Component
\`\`\`css
.stat-card {
    background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border-top: 3px solid var(--accent-success);
}
\`\`\`

**Visual design:**
- **Gradient**: Subtle depth effect
- **Border**: Separates from background
- **Border-radius**: Modern rounded corners
- **Top border color**: Indicates data type (green for income, red for expenses)

### Responsive Grid
\`\`\`css
.summary-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    grid-column: 1 / -1;
}

@media (max-width: 768px) {
    .summary-section {
        grid-template-columns: 1fr;
    }
}
\`\`\`

**Responsive design:**
- **Desktop**: 3 columns (cards side by side)
- **Tablet/Mobile**: 1 column (stacked vertically)
- `grid-column: 1 / -1`: Makes grid item span full width

---

## Part 10: Frontend - JavaScript

### API Communication
\`\`\`javascript
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification('An error occurred', 'error');
        return null;
    }
}
\`\`\`

**Error handling:**
- `try/catch`: Catches network and parsing errors
- `if (!response.ok)`: Checks for HTTP errors (404, 500, etc.)
- `await response.json()`: Converts JSON response to object
- `showNotification()`: Alerts user to errors

### Chart.js Integration
\`\`\`javascript
fetch('/api/spending-by-category')
    .then(r => r.json())
    .then(data => {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.category),
                datasets: [{
                    data: data.map(d => d.total),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', ...]
                }]
            }
        });
    });
\`\`\`

**Chart flow:**
1. Fetch spending data from API
2. Transform data format for Chart.js
3. Create chart instance
4. Chart renders in canvas element

### Date Utilities
\`\`\`javascript
const dateUtils = {
    today: () => new Date().toISOString().split('T')[0],
    monthStart: () => {
        const date = new Date();
        date.setDate(1);
        return date.toISOString().split('T')[0];
    }
};
\`\`\`

**Why separate utilities?**
- Consistent date formatting across app
- Single place to modify date logic
- Reusable in multiple components

---

## Part 11: Database Operations

### Connection & Transactions
\`\`\`python
conn = sqlite3.connect('budget_tracker.db')
conn.row_factory = sqlite3.Row  # Access columns by name
c = conn.cursor()

c.execute(sql, parameters)
conn.commit()  # Save changes
conn.close()   # Release connection
\`\`\`

**Best practices:**
- **row_factory**: Makes queries return objects not tuples
- **commit()**: Required to save changes
- **close()**: Frees database connection
- **Parameters**: Use `?` placeholders to prevent SQL injection

### Query Examples

**Single row:**
\`\`\`python
c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
user = c.fetchone()  # Returns one row
\`\`\`

**Multiple rows:**
\`\`\`python
c.execute('SELECT * FROM transactions WHERE user_id = ?', (user_id,))
transactions = c.fetchall()  # Returns all matching rows
\`\`\`

**Aggregate:**
\`\`\`python
c.execute('''SELECT category, SUM(amount) as total
             FROM transactions
             WHERE user_id = ?
             GROUP BY category''', (user_id,))
\`\`\`

---

## Summary: How It All Works Together

### User Registration Flow
1. User fills register form
2. Flask receives POST request
3. Password hashed using Werkzeug
4. Data inserted into users table
5. User redirected to login

### Transaction Creation Flow
1. User fills transaction form
2. Flask receives POST request
3. Data inserted into transactions table
4. User redirected to transactions page
5. Chart updates via JavaScript
6. New transaction appears in list

### Forecast Generation Flow
1. User views Forecast page
2. Flask queries all user transactions
3. StatisticalForecaster calculates statistics
4. Returns 90-day predictions
5. Chart.js renders line graph
6. User sees predicted spending pattern

### Recommendation Generation Flow
1. User views Profile page
2. CategoryAnalyzer queries transactions
3. Calculates z-scores for anomaly detection
4. Generates recommendations based on patterns
5. Returns JSON to JavaScript
6. Recommendations display to user

---

## Key Takeaways

### Security
- Passwords hashed, never stored plain text
- SQL injection prevented with parameterized queries
- Sessions stored securely for authentication
- User data isolated per account

### Performance
- SQLite lightweight and fast for personal use
- Indexes on user_id speed up queries
- API endpoints return JSON for quick loading
- Chart data fetched asynchronously

### Scalability
- Table design supports growth
- Foreign keys prevent data corruption
- Modular code allows easy extensions
- AI engines separate from web code

### User Experience
- Simple, intuitive interface
- Real-time chart updates
- Clear error messages
- Responsive design for all devices

---

**This Smart Budget Tracker demonstrates modern web application development with security, AI, and user-friendly design!**
