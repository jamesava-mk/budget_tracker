# Smart Budget Tracker - Installation & Setup Guide

## Overview
Smart Budget Tracker is a comprehensive Python/Flask web application for tracking expenses, forecasting spending, and managing personal finances with AI-powered insights.

## Requirements
- Python 3.8 or higher
- pip (Python package manager)
- A web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Clone or Download the Project
\`\`\`bash
# If using git
git clone <repository-url>
cd smart-budget-tracker

# Or extract the downloaded ZIP file
unzip smart-budget-tracker.zip
cd smart-budget-tracker
\`\`\`

### 2. Create a Virtual Environment (Recommended)
\`\`\`bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
\`\`\`

### 3. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Initialize the Database
\`\`\`bash
python app.py
# The database will be created automatically on first run
\`\`\`

### 5. Run the Application
\`\`\`bash
python app.py
\`\`\`

The application will start on `http://localhost:5000`

### 6. Access the Application
Open your web browser and navigate to:
\`\`\`
http://localhost:5000
\`\`\`

You should see the login page. Create a new account to get started!

## First Time Setup

### Create Your Account
1. Click "Sign up" on the login page
2. Enter a username, email, and password
3. Click "Create Account"
4. Log in with your credentials

### Add Your First Transactions
1. Go to the "Transactions" page
2. Click "+ Add Transaction"
3. Fill in the details:
   - Amount: Enter the expense amount
   - Category: Select from predefined categories
   - Description: What you spent on
   - Type: Expense or Income
   - Date: When the transaction occurred
4. Click "Add Transaction"

### Explore Features

#### Dashboard
- View your monthly income and expenses summary
- See spending breakdown by category
- Check recent transactions

#### Transactions
- Add, view, and manage all transactions
- Export transactions to CSV
- Filter and search transactions

#### Calendar
- Add scheduled expenses and reminders
- Set upcoming bills and recurring payments
- Take notes on financial events

#### Forecast
- View 90-day spending forecast
- See AI-powered category insights
- Understand average daily spending patterns

#### Profile
- View account statistics
- Get AI-powered spending recommendations
- Check spending anomalies and alerts

## Features Explained

### AI-Powered Features

#### 1. Spending Forecast
The app uses statistical analysis of your historical transactions to predict:
- Future daily spending patterns
- Category-specific spending trends
- 90-day expense projection

#### 2. Smart Recommendations
The AI analyzer provides:
- High spending alerts (when a category exceeds 40% of budget)
- Inconsistent spending pattern warnings
- Budget optimization suggestions
- Anomaly detection for unusual transactions

#### 3. Spending Anomaly Detection
Automatically detects unusual transactions:
- Uses statistical analysis (Z-score method)
- Flags high and medium severity anomalies
- Provides context and severity levels

### Data Export
- Export all transactions to CSV format
- Use for external analysis or backup
- Compatible with Excel, Google Sheets, etc.

## File Structure

\`\`\`
smart-budget-tracker/
├── app.py                      # Main Flask application
├── statistical_forecaster.py   # AI forecasting engine
├── category_analyzer.py        # AI recommendations engine
├── requirements.txt            # Python dependencies
├── budget_tracker.db           # SQLite database (created on first run)
├── templates/
│   ├── base.html              # Base template
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── dashboard.html         # Dashboard page
│   ├── transactions.html      # Transactions page
│   ├── calendar.html          # Calendar page
│   ├── forecast.html          # Forecast page
│   └── profile.html           # Profile page
└── static/
    ├── css/
    │   └── style.css          # Main stylesheet
    └── js/
        └── main.js            # Main JavaScript
\`\`\`

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, you can change it:
\`\`\`bash
# In app.py, change the last line to:
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change 5000 to 5001 or any other port
\`\`\`

### Database Issues
To reset the database and start fresh:
\`\`\`bash
# Delete the existing database
rm budget_tracker.db

# Run the app again - a new database will be created
python app.py
\`\`\`

### Module Not Found
Make sure you've installed all dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Permission Errors on macOS/Linux
\`\`\`bash
chmod +x app.py
python3 app.py
\`\`\`

## Configuration

### Change Secret Key (Security)
In `app.py`, change the secret key for production:
\`\`\`python
app.secret_key = 'your-secret-key-change-this'
# Change to something secure for production
app.secret_key = 'a-long-random-string-of-characters'
\`\`\`

### Adjust Forecast Period
In `statistical_forecaster.py`:
\`\`\`python
def __init__(self, forecast_days=90):  # Change 90 to your desired number
    self.forecast_days = forecast_days
\`\`\`

### Modify Anomaly Detection Sensitivity
In `category_analyzer.py`:
\`\`\`python
def __init__(self, anomaly_threshold=2.0):  # Lower = more sensitive, Higher = less sensitive
    self.anomaly_threshold = anomaly_threshold
\`\`\`

## Deployment

### For Local Network Access
In `app.py`:
\`\`\`python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
\`\`\`

Then access from other devices at: `http://<your-ip>:5000`

### For Production Deployment
Consider using:
- Gunicorn: `pip install gunicorn`
- Run with: `gunicorn -w 4 app:app`
- Use a reverse proxy like Nginx
- Enable HTTPS/SSL certificates

## Data Privacy & Security

- **Local Storage**: All data is stored in a local SQLite database
- **No Cloud Upload**: Your financial data stays on your computer
- **Password Security**: Passwords are hashed using Werkzeug
- **Session Management**: Sessions are stored securely

⚠️ **Security Warning**: This application is designed for personal use. For production or multi-user scenarios, implement:
- HTTPS/SSL
- Stronger authentication (2FA, OAuth)
- Rate limiting
- Input validation enhancements
- Database encryption

## Support & Troubleshooting

### Common Issues

**Q: I get a "Module not found" error**
A: Run `pip install -r requirements.txt` to ensure all dependencies are installed

**Q: The app won't start**
A: Check that port 5000 is not in use, or modify the port number in app.py

**Q: My transactions aren't showing**
A: Make sure you're logged in to the correct account and the transactions are in the current date range

**Q: Forecast shows no data**
A: Add at least 5-10 transactions of historical data for accurate forecasting

## License

This project is open-source and free to use for personal projects.

## Contributing

Feel free to extend this application with:
- Additional categories
- Budget limit alerts
- Recurring transaction automation
- Bank account integration
- Mobile app version

---

**Happy budgeting!** 💰

For questions or issues, refer to the code comments throughout the application.
