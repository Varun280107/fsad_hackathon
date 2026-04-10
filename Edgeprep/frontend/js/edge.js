// Edge Computing Core Logic

class EdgeProcessor {
    constructor() {
        this.localCache = {};
        this.processingTime = 0;
    }
    
    // Process answers locally
    processAnswers(answers, questions) {
        const startTime = performance.now();
        
        const results = {
            total: answers.length,
            correct: 0,
            wrong: 0,
            score: 0,
            topicAnalysis: {},
            timePerQuestion: [],
            recommendations: []
        };
        
        // Process each answer
        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) continue;
            
            const isCorrect = answer.userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                results.correct++;
            } else {
                results.wrong++;
            }
            
            // Topic analysis
            if (!results.topicAnalysis[question.topic]) {
                results.topicAnalysis[question.topic] = { correct: 0, total: 0 };
            }
            results.topicAnalysis[question.topic].total++;
            if (isCorrect) {
                results.topicAnalysis[question.topic].correct++;
            }
        }
        
        results.score = (results.correct / results.total) * 100;
        
        // Generate recommendations based on topic performance
        for (const [topic, data] of Object.entries(results.topicAnalysis)) {
            const accuracy = (data.correct / data.total) * 100;
            
            if (accuracy < 50) {
                results.recommendations.push({
                    topic: topic,
                    priority: 'High',
                    message: `Need significant improvement in ${topic}`,
                    action: 'Practice basics and solve 30+ questions'
                });
            } else if (accuracy < 70) {
                results.recommendations.push({
                    topic: topic,
                    priority: 'Medium',
                    message: `Good but can improve in ${topic}`,
                    action: 'Solve 15-20 medium level questions'
                });
            }
        }
        
        this.processingTime = performance.now() - startTime;
        results.processingTime = this.processingTime;
        results.edgeProcessed = true;
        
        return results;
    }
    
    // Cache questions locally
    cacheQuestions(questions) {
        this.localCache.questions = questions;
        this.localCache.timestamp = Date.now();
        localStorage.setItem('edgeCache', JSON.stringify(this.localCache));
    }
    
    // Get cached questions
    getCachedQuestions() {
        const cached = localStorage.getItem('edgeCache');
        if (cached) {
            const data = JSON.parse(cached);
            // Cache valid for 24 hours
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                return data.questions;
            }
        }
        return null;
    }
    
    // Generate study plan
    generateStudyPlan(weakTopics) {
        const plan = {
            daily: [],
            weekly: [],
            totalHours: 0
        };
        
        for (const topic of weakTopics.slice(0, 3)) {
            const hours = topic.accuracy < 50 ? 4 : (topic.accuracy < 70 ? 2 : 1);
            plan.totalHours += hours;
            plan.daily.push({
                topic: topic.name,
                hours: hours,
                questions: hours * 10
            });
        }
        
        return plan;
    }
    
    // Check if edge processing is available
    isEdgeAvailable() {
        return 'serviceWorker' in navigator && 'localStorage' in window;
    }
}

// Initialize edge processor
const edgeProcessor = new EdgeProcessor();

// Service Worker for offline capability
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('Service Worker registered for offline edge processing');
    });
}