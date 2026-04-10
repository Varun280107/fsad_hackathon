import json
import random
from collections import Counter

class PlacementRecommender:
    """AI-powered recommendation engine for placement preparation"""
    
    def __init__(self):
        self.company_patterns = {
            'TCS': {
                'focus_topics': ['Aptitude', 'Programming Logic', 'English'],
                'difficulty': 'medium',
                'question_pattern': 'MCQ + Coding'
            },
            'Infosys': {
                'focus_topics': ['Puzzles', 'Logical Reasoning', 'Python'],
                'difficulty': 'medium-hard',
                'question_pattern': 'Coding + Reasoning'
            },
            'Amazon': {
                'focus_topics': ['Data Structures', 'Algorithms', 'System Design'],
                'difficulty': 'hard',
                'question_pattern': 'Technical + Problem Solving'
            },
            'Microsoft': {
                'focus_topics': ['DSA', 'Problem Solving', 'Communication'],
                'difficulty': 'hard',
                'question_pattern': 'Coding + Design'
            },
            'Google': {
                'focus_topics': ['Algorithms', 'Dynamic Programming', 'System Design'],
                'difficulty': 'very hard',
                'question_pattern': 'Complex Problem Solving'
            }
        }
        
    def get_next_topics(self, user_performance, limit=3):
        """Recommend next topics to study"""
        # Sort topics by weakness score
        weak_topics = []
        for topic, data in user_performance.items():
            weak_topics.append({
                'topic': topic,
                'accuracy': data.get('accuracy', 0),
                'attempts': data.get('attempts', 0)
            })
        
        # Sort by accuracy (lowest first)
        weak_topics.sort(key=lambda x: x['accuracy'])
        
        # Return top weak topics
        return weak_topics[:limit]
    
    def get_question_recommendations(self, user_level, topic, count=10):
        """Recommend questions based on user level"""
        recommendations = {
            'topic': topic,
            'user_level': user_level,
            'questions': [],
            'difficulty_distribution': {}
        }
        
        if user_level == 'beginner':
            distribution = {'easy': 7, 'medium': 3, 'hard': 0}
        elif user_level == 'intermediate':
            distribution = {'easy': 3, 'medium': 5, 'hard': 2}
        else:
            distribution = {'easy': 1, 'medium': 4, 'hard': 5}
        
        recommendations['difficulty_distribution'] = distribution
        
        return recommendations
    
    def get_company_preparation_plan(self, company_name, available_days=30):
        """Generate company-specific preparation plan"""
        if company_name not in self.company_patterns:
            return None
        
        pattern = self.company_patterns[company_name]
        
        plan = {
            'company': company_name,
            'focus_topics': pattern['focus_topics'],
            'difficulty': pattern['difficulty'],
            'days_required': available_days,
            'weekly_schedule': [],
            'resources': [],
            'mock_tests_needed': 5
        }
        
        # Create weekly schedule
        weeks = available_days // 7
        for week in range(1, weeks + 1):
            weekly = {
                'week': week,
                'topics': [],
                'daily_hours': 0,
                'practice_questions': 0
            }
            
            if week == 1:
                weekly['topics'] = pattern['focus_topics'][:2]
                weekly['daily_hours'] = 2
                weekly['practice_questions'] = 50
            elif week == weeks:
                weekly['topics'] = ['Mock Tests', 'Revision']
                weekly['daily_hours'] = 4
                weekly['practice_questions'] = 100
            else:
                weekly['topics'] = pattern['focus_topics']
                weekly['daily_hours'] = 3
                weekly['practice_questions'] = 75
            
            plan['weekly_schedule'].append(weekly)
        
        return plan
    
    def get_smart_study_tips(self, user_performance):
        """Generate personalized study tips"""
        tips = []
        
        # Analyze performance patterns
        total_accuracy = 0
        weak_count = 0
        
        for topic, data in user_performance.items():
            accuracy = data.get('accuracy', 0)
            total_accuracy += accuracy
            if accuracy < 60:
                weak_count += 1
        
        avg_accuracy = total_accuracy / len(user_performance) if user_performance else 0
        
        if avg_accuracy < 50:
            tips.append("🎯 Focus on building strong fundamentals first")
            tips.append("📚 Start with easy questions and gradually increase difficulty")
        elif avg_accuracy < 70:
            tips.append("⚡ Practice time management - set timers for each question")
            tips.append("📝 Review your mistakes and maintain an error log")
        else:
            tips.append("🏆 Take full-length mock tests to simulate real exam")
            tips.append("🎯 Focus on advanced topics and tricky problems")
        
        if weak_count > 3:
            tips.append("📊 Prioritize your weakest 3 topics this week")
        
        tips.append("💪 Consistency is key - practice at least 30 minutes daily")
        
        return tips
    
    def calculate_company_readiness(self, user_performance, target_company):
        """Calculate readiness score for specific company"""
        if target_company not in self.company_patterns:
            return 0
        
        required_topics = self.company_patterns[target_company]['focus_topics']
        
        total_score = 0
        topic_scores = {}
        
        for topic in required_topics:
            if topic in user_performance:
                score = user_performance[topic].get('accuracy', 0)
                topic_scores[topic] = score
                total_score += score
            else:
                topic_scores[topic] = 0
        
        avg_score = total_score / len(required_topics) if required_topics else 0
        
        return {
            'company': target_company,
            'readiness_score': avg_score,
            'topic_breakdown': topic_scores,
            'status': 'Ready' if avg_score >= 75 else 'Needs Preparation' if avg_score >= 50 else 'Not Ready',
            'gap_analysis': {topic: 75 - score for topic, score in topic_scores.items() if score < 75}
        }