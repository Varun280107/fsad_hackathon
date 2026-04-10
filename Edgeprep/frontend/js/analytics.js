// Analytics and Chart Functions

// Initialize Charts
function initPerformanceChart(canvasId, data) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;
    
    // Simple canvas drawing without external libraries
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length === 0) return;
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
        const y = height - (i * height / 4);
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
    }
    
    // Draw bars
    const barWidth = (width - 60) / data.length - 10;
    const maxValue = Math.max(...data.map(d => d.value), 100);
    
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 60);
        const x = 50 + index * (barWidth + 10);
        const y = height - 20 - barHeight;
        
        // Bar
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = '#4a5568';
        ctx.font = '10px Arial';
        ctx.fillText(item.label, x, height - 5);
        
        // Value
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(item.value, x + 5, y - 5);
    });
}

// Update Performance Metrics
async function updatePerformanceMetrics(userId) {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update accuracy trend
            const accuracyElement = document.getElementById('accuracyTrend');
            if (accuracyElement) {
                const trend = calculateTrend(data.accuracyHistory);
                accuracyElement.innerHTML = trend > 0 ? `↑ ${trend}%` : `↓ ${Math.abs(trend)}%`;
                accuracyElement.style.color = trend > 0 ? '#48bb78' : '#f56565';
            }
            
            return data;
        }
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

// Calculate performance trend
function calculateTrend(history) {
    if (!history || history.length < 2) return 0;
    const recent = history.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    return ((last - first) / first * 100).toFixed(1);
}

// Generate topic breakdown chart
function renderTopicBreakdown(topics) {
    const container = document.getElementById('topicBreakdown');
    if (!container) return;
    
    container.innerHTML = topics.map(topic => `
        <div class="weak-area-item">
            <div>
                <div class="weak-area-topic">${topic.name}</div>
                <div class="progress-bar-small">
                    <div class="progress-fill-small" style="width: ${topic.accuracy}%"></div>
                </div>
            </div>
            <div class="weak-area-score">${topic.accuracy}%</div>
        </div>
    `).join('');
}

// Calculate placement readiness score
function calculateReadinessScore(performance) {
    const weights = {
        'Aptitude': 0.25,
        'Programming': 0.35,
        'Data Structures': 0.25,
        'CS Fundamentals': 0.15
    };
    
    let total = 0;
    for (const [category, weight] of Object.entries(weights)) {
        if (performance[category]) {
            total += performance[category].accuracy * weight;
        }
    }
    
    return total;
}

// Get readiness level
function getReadinessLevel(score) {
    if (score >= 85) return { level: 'Interview Ready', color: '#48bb78', icon: '🎯' };
    if (score >= 70) return { level: 'Almost Ready', color: '#ed8936', icon: '📈' };
    if (score >= 50) return { level: 'Needs Work', color: '#ecc94b', icon: '📚' };
    return { level: 'Beginner', color: '#f56565', icon: '🌱' };
}