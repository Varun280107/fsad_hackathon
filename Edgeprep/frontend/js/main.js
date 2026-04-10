// API Configuration
const API_URL = 'http://localhost:5000/api';

// Global variables
let currentUser = null;
let currentQuestions = [];
let userAnswers = {};
let testStartTime = null;

// Check authentication
function checkAuth() {
    const userId = localStorage.getItem('userId');
    const currentPage = window.location.pathname;
    
    if (!userId && !currentPage.includes('login') && !currentPage.includes('register') && !currentPage.includes('index')) {
        window.location.href = 'login.html';
    }
    
    if (userId) {
        currentUser = {
            id: userId,
            username: localStorage.getItem('username'),
            fullName: localStorage.getItem('fullName')
        };
        updateNavigation();
    }
}

// Update navigation with user info
function updateNavigation() {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv && currentUser) {
        userInfoDiv.innerHTML = `
            <span class="xp-badge" id="xpDisplay">⭐ 0 XP</span>
            <span class="streak-badge" id="streakDisplay">🔥 0 days</span>
            <span>👋 ${currentUser.username}</span>
            <button onclick="logout()" class="btn btn-outline" style="padding: 0.3rem 0.8rem;">Logout</button>
        `;
        loadUserStats();
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            const xpDisplay = document.getElementById('xpDisplay');
            if (xpDisplay) xpDisplay.innerHTML = `⭐ ${stats.total_xp || 0} XP`;
            
            const streakDisplay = document.getElementById('streakDisplay');
            if (streakDisplay) streakDisplay.innerHTML = `🔥 ${stats.streak_days || 0} days`;
            
            return stats;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
    return null;
}

// Logout function
async function logout() {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.clear();
    window.location.href = 'login.html';
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    } else {
        alert(message);
    }
}

// Load questions for practice
async function loadQuestions(category = null, topic = null, limit = 10) {
    try {
        let url = `${API_URL}/questions?limit=${limit}`;
        if (category) url += `&category=${category}`;
        if (topic) url += `&topic=${topic}`;
        
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
            currentQuestions = await response.json();
            displayQuestions();
            testStartTime = Date.now();
            return currentQuestions;
        } else {
            showAlert('Failed to load questions', 'error');
            return [];
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showAlert('Connection error. Make sure server is running.', 'error');
        return [];
    }
}

// Display questions in the UI
function displayQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    container.innerHTML = currentQuestions.map((q, index) => `
        <div class="question-card fade-in" data-qid="${q.id}">
            <div class="question-number">Question ${index + 1} of ${currentQuestions.length}</div>
            <div class="question-text">
                ${q.question}
            </div>
            <div class="question-tags">
                <span class="tag">${q.topic}</span>
                <span class="tag difficulty-${q.difficulty}">${q.difficulty}</span>
                ${q.company ? `<span class="tag">🏢 ${q.company}</span>` : ''}
            </div>
            <div class="options-list">
                ${['A', 'B', 'C', 'D'].map((letter, optIndex) => `
                    <div class="option" onclick="selectAnswer(${q.id}, '${letter}')" id="opt_${q.id}_${letter}">
                        <div class="option-letter">${letter}</div>
                        <div class="option-text">${q.options[optIndex]}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Add navigation buttons
    const navigationHTML = `
        <div class="navigation-buttons">
            <button onclick="previousQuestion()" class="btn btn-outline" id="prevBtn">← Previous</button>
            <button onclick="nextQuestion()" class="btn btn-outline" id="nextBtn">Next →</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', navigationHTML);
    
    // Restore previous answers if any
    restoreAnswers();
    updateProgress();
}

// Navigation functions
let currentQuestionIndex = 0;

function showQuestion(index) {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((q, i) => {
        q.style.display = i === index ? 'block' : 'none';
    });
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === questions.length - 1;
}

function nextQuestion() {
    const questions = document.querySelectorAll('.question-card');
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

// Select answer
function selectAnswer(questionId, answer) {
    userAnswers[questionId] = answer;
    
    // Update UI
    ['A', 'B', 'C', 'D'].forEach(letter => {
        const optDiv = document.getElementById(`opt_${questionId}_${letter}`);
        if (optDiv) {
            optDiv.classList.remove('selected');
        }
    });
    
    document.getElementById(`opt_${questionId}_${answer}`)?.classList.add('selected');
    updateProgress();
}

// Restore previously selected answers
function restoreAnswers() {
    for (const [qid, answer] of Object.entries(userAnswers)) {
        document.getElementById(`opt_${qid}_${answer}`)?.classList.add('selected');
    }
}

// Update progress bar
function updateProgress() {
    const answered = Object.keys(userAnswers).length;
    const total = currentQuestions.length;
    const percentage = (answered / total) * 100;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${answered}/${total} questions answered`;
}

// Submit test
async function submitTest() {
    if (Object.keys(userAnswers).length < currentQuestions.length) {
        showAlert(`Please answer all questions! (${Object.keys(userAnswers).length}/${currentQuestions.length})`, 'error');
        return;
    }
    
    const timeSpent = (Date.now() - testStartTime) / 1000;
    const answers = Object.entries(userAnswers).map(([qid, answer]) => ({
        question_id: parseInt(qid),
        user_answer: answer
    }));
    
    showAlert('⚡ Processing answers on edge device...', 'info');
    
    // Show loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <h3>Processing on Edge Device...</h3>
            <p>Your answers are being analyzed locally</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        const response = await fetch(`${API_URL}/submit-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, time_spent: timeSpent }),
            credentials: 'include'
        });
        
        loadingDiv.remove();
        
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('testResults', JSON.stringify(result));
            window.location.href = 'results.html';
        } else {
            const error = await response.json();
            showAlert(error.error || 'Error submitting test', 'error');
        }
    } catch (error) {
        loadingDiv.remove();
        console.error('Error:', error);
        showAlert('Connection error. Make sure server is running.', 'error');
    }
}

// Display test results
function displayResults() {
    const results = JSON.parse(localStorage.getItem('testResults'));
    if (!results) {
        window.location.href = 'practice.html';
        return;
    }
    
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    const scoreColor = results.results.score >= 70 ? '#48bb78' : 
                      (results.results.score >= 50 ? '#ed8936' : '#f56565');
    
    container.innerHTML = `
        <div class="card" style="text-align: center;">
            <h2>📊 Test Results</h2>
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.8rem; border-radius: 8px; margin: 1rem 0;">
                ⚡ Processed on Edge Device - ${results.results.processing_time_ms?.toFixed(0) || 0}ms
            </div>
            <div class="stat-value" style="color: ${scoreColor};">${results.results.score?.toFixed(1) || 0}%</div>
            <p style="font-size: 1.2rem;">${results.results.correct || 0}/${results.results.total || 0} correct answers</p>
            <p>⭐ Earned ${results.xp_earned || 0} XP!</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                <button onclick="location.href='practice.html'" class="btn btn-primary">Practice Again</button>
                <button onclick="location.href='dashboard.html'" class="btn btn-outline">Go to Dashboard</button>
            </div>
        </div>
        
        <div class="card">
            <h3>📈 Performance Analysis</h3>
            <div class="stats-grid">
                <div class="stat-card" style="background: #48bb78; color: white;">
                    <div class="stat-value">${results.results.correct || 0}</div>
                    <div class="stat-label">Correct</div>
                </div>
                <div class="stat-card" style="background: #f56565; color: white;">
                    <div class="stat-value">${results.results.wrong || 0}</div>
                    <div class="stat-label">Wrong</div>
                </div>
                <div class="stat-card" style="background: #ed8936; color: white;">
                    <div class="stat-value">${results.results.processing_time_ms?.toFixed(0) || 0}ms</div>
                    <div class="stat-label">Edge Processing Time</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3>🎯 Smart Recommendations (Edge-Generated)</h3>
            ${results.results.recommendations?.map(rec => `
                <div class="recommendation-item" style="border-left-color: ${
                    rec.priority === 'Critical' ? '#f56565' : 
                    rec.priority === 'High' ? '#ed8936' : '#48bb78'
                }">
                    <strong>${rec.topic}</strong> - ${rec.priority}<br>
                    ${rec.message}<br>
                    <small>Action: ${rec.action}</small>
                </div>
            `).join('') || '<p>Great job! Keep practicing to maintain your skills.</p>'}
        </div>
        
        <div class="card">
            <h3>📚 Personalized Study Plan</h3>
            <p><strong>Total Study Time:</strong> ${results.study_plan?.total_hours || 0} hours</p>
            <p><strong>Questions to Practice:</strong> ${results.study_plan?.total_questions || 0}</p>
            <h4 style="margin-top: 1rem;">Priority Topics:</h4>
            ${results.study_plan?.priority_topics?.map(topic => `
                <div class="topic-tag difficulty-hard">
                    ${topic.topic}: ${topic.current_score?.toFixed(1) || 0}% → Target ${topic.target_score || 80}%
                    <br><small>${topic.questions_needed || 0} questions needed</small>
                </div>
            `).join('') || '<p>All topics look good! Maintain with regular practice.</p>'}
        </div>
    `;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Load page-specific data
    if (window.location.pathname.includes('dashboard.html')) {
        loadUserStats();
    }
    
    if (window.location.pathname.includes('practice.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const topic = urlParams.get('topic');
        loadQuestions(category, topic, 10);
    }
    
    if (window.location.pathname.includes('results.html')) {
        displayResults();
    }
});

// Export functions for use in HTML
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitTest = submitTest;
window.logout = logout;