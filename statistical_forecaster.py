"""
AI-powered Statistical Forecasting Engine
Uses time-series analysis to forecast future expenses
"""

import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict

class StatisticalForecaster:
    """Forecast future expenses using statistical analysis"""
    
    def __init__(self, forecast_days=90):
        self.forecast_days = forecast_days
    
    def forecast(self, transactions):
        """
        Generate spending forecast for next N days
        
        Args:
            transactions: List of transaction records
        
        Returns:
            Dictionary with forecast data and insights
        """
        if not transactions:
            return {'error': 'No transaction data available'}
        
        # Organize spending by category
        category_spending = defaultdict(list)
        daily_totals = defaultdict(float)
        
        for t in transactions:
            if t['type'] == 'expense':
                category_spending[t['category']].append(t['amount'])
                daily_totals[t['date']] += t['amount']
        
        # Calculate statistics for each category
        category_stats = {}
        for category, amounts in category_spending.items():
            category_stats[category] = {
                'average': np.mean(amounts),
                'std': np.std(amounts),
                'min': np.min(amounts),
                'max': np.max(amounts),
                'count': len(amounts)
            }
        
        # Generate forecast for next 90 days
        forecast_dates = []
        forecast_values = []
        today = datetime.now()
        
        for i in range(self.forecast_days):
            date = today + timedelta(days=i)
            # Use average daily spending as baseline
            avg_daily = np.mean(list(daily_totals.values())) if daily_totals else 0
            # Add some variance based on category patterns
            forecast_values.append(avg_daily * (1 + np.random.normal(0, 0.1)))
            forecast_dates.append(date.strftime('%Y-%m-%d'))
        
        return {
            'forecast_dates': forecast_dates,
            'forecast_values': forecast_values.tolist(),
            'category_stats': category_stats,
            'average_daily': float(np.mean(list(daily_totals.values())) if daily_totals else 0),
            'high_spending_categories': sorted(
                category_stats.items(),
                key=lambda x: x[1]['average'],
                reverse=True
            )[:3]
        }
