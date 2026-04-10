import json
import time
from datetime import datetime, timedelta
from collections import defaultdict
import math

class EdgeProcessor:
    """Advanced Edge Computing Engine for Placement Preparation"""
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.local_cache = {}
        self.performance_cache = {}
        
    def process_test_locally(self, answers, questions_data):
        """Complete edge-based test processing"""
        start_time = time.time()
        
        results = {
            'score': 0,
            'total': len(answers),
            'correct': 0,
            'wrong': 0,
            'skipped': 0,
            'time_taken': 0,
            'topic_analysis': {},
            'category_analysis': {},
            'difficulty_analysis': {},
            'recommendations': [],
            'strengths': [],
            'weaknesses': [],
            'improvement_areas': []
        }
        
        # Process each answer locally
        for answer in answers:
            q = questions_data[answer['question_id']]
            is_correct = (answer['user_answer'].upper() == q['correct_answer'].upper())
            
            if is_correct:
                results['correct'] += 1
            else:
                results['wrong'] += 1
                
            # Topic-wise analysis
            topic = q['topic']
            if topic not in results['topic_analysis']:
                results['topic_analysis'][topic] = {'correct': 0, 'total': 0}
            results['topic_analysis'][topic]['total'] += 1
            if is_correct:
                results['topic_analysis'][topic]['correct'] += 1
        
        results['score'] = (results['correct'] / results['total']) * 100
        results['time_taken'] = time.time() - start_time
        
        # Generate intelligent recommendations
        results['recommendations'] = self.generate_recommendations(results['topic_analysis'])
        results['strengths'], results['weaknesses'] = self.analyze_strengths_weaknesses(results['topic_analysis'])
        results['improvement_areas'] = self.get_improvement_areas(results['topic_analysis'])
        
        # Add edge computing metadata
        results['edge_processed'] = True
        results['processing_time_ms'] = results['time_taken'] * 1000
        results['privacy_note'] = "All answers processed locally on your device"
        
        return results
    
    def generate_recommendations(self, topic_analysis):
        """Generate smart recommendations based on performance"""
        recommendations = []
        
        for topic, data in topic_analysis.items():
            accuracy = (data['correct'] / data['total']) * 100
            
            if accuracy < 40:
                recommendations.append({
                    'topic': topic,
                    'priority': 'Critical',
                    'message': f"⚠️ CRITICAL: Need immediate improvement in {topic}",
                    'action': 'Start with basics, practice 50+ questions',
                    'estimated_hours': 8,
                    'resources': ['Video tutorials', 'Basic concepts', 'Easy problems']
                })
            elif accuracy < 60:
                recommendations.append({
                    'topic': topic,
                    'priority': 'High',
                    'message': f"📚 NEEDS IMPROVEMENT: Practice more in {topic}",
                    'action': 'Solve 30 medium-level questions',
                    'estimated_hours': 5,
                    'resources': ['Practice sets', 'Topic-wise tests']
                })
            elif accuracy < 80:
                recommendations.append({
                    'topic': topic,
                    'priority': 'Medium',
                    'message': f"👍 GOOD: Keep practicing {topic}",
                    'action': 'Maintain with 15 questions daily',
                    'estimated_hours': 2,
                    'resources': ['Advanced problems', 'Mock tests']
                })
            else:
                recommendations.append({
                    'topic': topic,
                    'priority': 'Low',
                    'message': f"✅ EXCELLENT: Strong in {topic}",
                    'action': 'Take advanced challenges',
                    'estimated_hours': 1,
                    'resources': ['Competitive problems']
                })
        
        return sorted(recommendations, key=lambda x: 
                     {'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1}[x['priority']], 
                     reverse=True)
    
    def analyze_strengths_weaknesses(self, topic_analysis):
        """Identify strengths and weaknesses"""
        strengths = []
        weaknesses = []
        
        for topic, data in topic_analysis.items():
            accuracy = (data['correct'] / data['total']) * 100
            if accuracy >= 70:
                strengths.append({'topic': topic, 'accuracy': accuracy})
            else:
                weaknesses.append({'topic': topic, 'accuracy': accuracy})
        
        return strengths, weaknesses
    
    def get_improvement_areas(self, topic_analysis):
        """Get specific areas needing improvement"""
        areas = []
        for topic, data in topic_analysis.items():
            accuracy = (data['correct'] / data['total']) * 100
            if accuracy < 60:
                areas.append({
                    'topic': topic,
                    'current_score': accuracy,
                    'target_score': 80,
                    'gap': 80 - accuracy,
                    'questions_needed': math.ceil((80 - accuracy) / 10) * 20
                })
        return areas
    
    def generate_study_plan(self, weak_areas, days=7):
        """Generate personalized study plan"""
        plan = {
            'daily_schedule': [],
            'total_hours': 0,
            'total_questions': 0,
            'priority_topics': []
        }
        
        # Sort weak areas by priority
        sorted_areas = sorted(weak_areas, key=lambda x: x['gap'], reverse=True)
        plan['priority_topics'] = sorted_areas[:3]
        
        # Create daily schedule
        for day in range(1, days + 1):
            daily_plan = {
                'day': day,
                'date': (datetime.now() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'topics': [],
                'questions': 0,
                'hours': 0
            }
            
            # Assign topics based on priority
            for i, area in enumerate(sorted_areas[:3]):
                if day % 3 == i:
                    daily_plan['topics'].append(area['topic'])
                    daily_plan['questions'] += area['questions_needed'] // days
                    daily_plan['hours'] += area['questions_needed'] // 20
            
            if daily_plan['topics']:
                plan['daily_schedule'].append(daily_plan)
                plan['total_hours'] += daily_plan['hours']
                plan['total_questions'] += daily_plan['questions']
        
        return plan
    
    def calculate_placement_readiness(self, all_performances):
        """Calculate overall placement readiness score"""
        # Weightage for different categories
        weights = {
            'Aptitude': 0.25,
            'Programming': 0.35,
            'Data Structures': 0.20,
            'CS Fundamentals': 0.20
        }
        
        total_score = 0
        category_scores = {}
        
        for category, weight in weights.items():
            if category in all_performances:
                cat_score = all_performances[category]['accuracy']
                category_scores[category] = cat_score
                total_score += cat_score * weight
        
        # Determine readiness level
        if total_score >= 85:
            level = "Interview Ready"
            message = "You're fully prepared! Start applying to companies."
        elif total_score >= 70:
            level = "Almost Ready"
            message = "Good progress! Focus on weak areas for 2 more weeks."
        elif total_score >= 50:
            level = "Needs Work"
            message = "Keep practicing daily. You'll get there in 4 weeks."
        else:
            level = "Beginner"
            message = "Start with basics. Consistent practice for 8 weeks needed."
        
        return {
            'overall_score': total_score,
            'category_scores': category_scores,
            'readiness_level': level,
            'message': message,
            'estimated_preparation_time': self.get_preparation_time(total_score)
        }
    
    def get_preparation_time(self, score):
        """Estimate preparation time needed"""
        if score >= 85:
            return "Ready now"
        elif score >= 70:
            return "2-3 weeks"
        elif score >= 50:
            return "4-6 weeks"
        else:
            return "8-10 weeks"
    
    def predict_improvement(self, current_score, daily_hours, target_days=30):
        """Predict score improvement based on study time"""
        # Learning rate: 2% improvement per hour of daily practice
        improvement_rate = 2 * daily_hours
        predicted_score = min(100, current_score + (improvement_rate * target_days / 7))
        
        return {
            'current_score': current_score,
            'predicted_score': predicted_score,
            'daily_hours_needed': daily_hours,
            'days_to_target': self.calculate_days_needed(current_score, 75, daily_hours)
        }
    
    def calculate_days_needed(self, current, target, daily_hours):
        """Calculate days needed to reach target score"""
        improvement_per_day = daily_hours * 2  # 2% per hour
        gap = target - current
        if gap <= 0:
            return 0
        return math.ceil(gap / improvement_per_day)