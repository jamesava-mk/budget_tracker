"""
AI-powered Category Analysis and Recommendations
Detects anomalies and provides personalized spending insights
"""

import numpy as np
from collections import defaultdict
from datetime import datetime, timedelta

class CategoryAnalyzer:
    """Analyze spending categories and generate recommendations"""
    
    def __init__(self, anomaly_threshold=2.0):
        self.anomaly_threshold = anomaly_threshold
    
    def detect_anomalies(self, transactions):
        """
        Detect unusual spending patterns
        
        Args:
            transactions: List of transaction records
        
        Returns:
            List of anomalous transactions
        """
        category_spending = defaultdict(list)
        
        for t in transactions:
            if t['type'] == 'expense':
                category_spending[t['category']].append(t['amount'])
        
        anomalies = []
        
        for t in transactions:
            if t['type'] == 'expense':
                category = t['category']
                amounts = category_spending[category]
                
                if len(amounts) > 1:
                    mean = np.mean(amounts)
                    std = np.std(amounts)
                    
                    if std > 0:
                        z_score = abs((t['amount'] - mean) / std)
                        if z_score > self.anomaly_threshold:
                            anomalies.append({
                                'transaction': t['description'],
                                'amount': t['amount'],
                                'category': category,
                                'severity': 'high' if z_score > 3 else 'medium',
                                'message': f"Unusual {category} spending detected"
                            })
        
        return anomalies
    
    def generate_recommendations(self, transactions):
        """
        Generate personalized spending recommendations
        
        Args:
            transactions: List of transaction records
        
        Returns:
            List of actionable recommendations
        """
        recommendations = []
        
        # Analyze spending patterns
        category_spending = defaultdict(list)
        total_spending = 0
        
        for t in transactions:
            if t['type'] == 'expense':
                category_spending[t['category']].append(t['amount'])
                total_spending += t['amount']
        
        if not category_spending:
            return {'recommendations': []}
        
        # Find top spending categories
        category_totals = {cat: sum(amounts) for cat, amounts in category_spending.items()}
        sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        
        # Generate recommendations
        recommendations_list = []
        
        # Recommendation 1: High spending category
        if sorted_categories:
            top_category = sorted_categories[0]
            percentage = (top_category[1] / total_spending * 100)
            if percentage > 40:
                recommendations_list.append({
                    'type': 'warning',
                    'title': f'High {top_category[0]} spending',
                    'message': f'You spent {percentage:.1f}% of your budget on {top_category[0]}',
                    'action': 'Consider reducing spending in this category'
                })
        
        # Recommendation 2: Spending consistency
        if len(transactions) > 5:
            daily_totals = defaultdict(float)
            for t in transactions:
                if t['type'] == 'expense':
                    daily_totals[t['date']] += t['amount']
            
            if daily_totals:
                daily_values = list(daily_totals.values())
                variance = np.var(daily_values)
                if variance > np.mean(daily_values) ** 2:
                    recommendations_list.append({
                        'type': 'info',
                        'title': 'Inconsistent spending patterns',
                        'message': 'Your daily spending varies significantly',
                        'action': 'Try to stabilize your expenses for better budgeting'
                    })
        
        # Recommendation 3: Set budget targets
        if sorted_categories:
            recommendations_list.append({
                'type': 'suggestion',
                'title': 'Budget by category',
                'message': f'You have {len(category_spending)} spending categories',
                'action': 'Set specific budget limits for each category'
            })
        
        # Anomaly detection
        anomalies = self.detect_anomalies(transactions)
        
        return {
            'recommendations': recommendations_list,
            'anomalies': anomalies,
            'category_breakdown': [
                {'category': cat, 'total': total, 'percentage': (total/total_spending*100)}
                for cat, total in sorted_categories
            ]
        }
