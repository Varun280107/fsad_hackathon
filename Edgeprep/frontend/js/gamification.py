// API URL Configuration
const API_URL = 'http://localhost:5000/api';

// Gamification System - XP, Badges, Streaks, Leaderboard
class GamificationEngine {
    constructor() {
        this.xpThresholds = {
            bronze: 0,
            silver: 1000,
            gold: 5000,
            platinum: 10000,
            diamond: 20000
        };
        
        this.badges = {
            first_test: { name: '🌟 First Step', xp: 50, condition: 'completeFirstTest' },
            perfect_score: { name: '💯 Perfect Score', xp: 200, condition: 'getPerfectScore' },
            week_streak: { name: '🔥 7 Day Streak', xp: 500, condition: 'weekStreak' },
            month_streak: { name: '🏆 Monthly Warrior', xp: 2000, condition: 'monthStreak' },
            topic_master: { name: '📚 Topic Master', xp: 300, condition: 'masterTopic' },
            quick_learner: { name: '⚡ Quick Learner', xp: 100, condition: 'solve50Questions' },
            placement_ready: { name: '🎯 Placement Ready', xp: 1000, condition: 'reachReadiness' }
        };
        
        // Track earned badges for current user
        this.earnedBadges = new Set();
    }
    
    // Calculate XP earned
    calculateXP(score, timeSpent, streak) {
        let xp = 0;
        
        // Base XP: 10 points
        xp += 10;
        
        // Bonus for high score
        if (score >= 90) xp += 50;
        else if (score >= 70) xp += 30;
        else if (score >= 50) xp += 10;
        
        // Speed bonus (time in seconds)
        if (timeSpent < 30) xp += 20;
        else if (timeSpent < 60) xp += 10;
        
        // Streak bonus
        xp += Math.min(streak * 5, 50);
        
        return xp;
    }
    
    // Check and award badges
    checkBadges(userStats) {
        const earnedBadges = [];
        
        // Check each badge condition
        if (userStats.testsCompleted === 1 && !this.earnedBadges.has('first_test')) {
            earnedBadges.push(this.badges.first_test);
            this.earnedBadges.add('first_test');
        }
        
        if (userStats.perfectScores > 0 && !this.earnedBadges.has('perfect_score')) {
            earnedBadges.push(this.badges.perfect_score);
            this.earnedBadges.add('perfect_score');
        }
        
        if (userStats.streakDays >= 7 && !this.earnedBadges.has('week_streak')) {
            earnedBadges.push(this.badges.week_streak);
            this.earnedBadges.add('week_streak');
        }
        
        if (userStats.streakDays >= 30 && !this.earnedBadges.has('month_streak')) {
            earnedBadges.push(this.badges.month_streak);
            this.earnedBadges.add('month_streak');
        }
        
        if (userStats.totalQuestions >= 50 && !this.earnedBadges.has('quick_learner')) {
            earnedBadges.push(this.badges.quick_learner);
            this.earnedBadges.add('quick_learner');
        }
        
        if (userStats.placementReadiness >= 85 && !this.earnedBadges.has('placement_ready')) {
            earnedBadges.push(this.badges.placement_ready);
            this.earnedBadges.add('placement_ready');
        }
        
        return earnedBadges;
    }
    
    // Get user rank based on XP
    getRank(xp) {
        if (xp >= this.xpThresholds.diamond) {
            return { name: 'Diamond', color: '#b9f2ff', icon: '💎', minXp: this.xpThresholds.diamond };
        }
        if (xp >= this.xpThresholds.platinum) {
            return { name: 'Platinum', color: '#e5e4e2', icon: '🏆', minXp: this.xpThresholds.platinum };
        }
        if (xp >= this.xpThresholds.gold) {
            return { name: 'Gold', color: '#ffd700', icon: '🥇', minXp: this.xpThresholds.gold };
        }
        if (xp >= this.xpThresholds.silver) {
            return { name: 'Silver', color: '#c0c0c0', icon: '🥈', minXp: this.xpThresholds.silver };
        }
        return { name: 'Bronze', color: '#cd7f32', icon: '🥉', minXp: this.xpThresholds.bronze };
    }
    
    // Calculate next level XP needed
    getNextLevelXP(currentXP) {
        const levels = [
            { name: 'Bronze', threshold: 0 },
            { name: 'Silver', threshold: 1000 },
            { name: 'Gold', threshold: 5000 },
            { name: 'Platinum', threshold: 10000 },
            { name: 'Diamond', threshold: 20000 }
        ];
        
        for (let i = 0; i < levels.length; i++) {
            if (currentXP < levels[i].threshold) {
                return {
                    currentLevel: levels[i-1]?.name || 'Bronze',
                    nextLevel: levels[i].name,
                    xpNeeded: levels[i].threshold - currentXP,
                    progress: (currentXP / levels[i].threshold) * 100
                };
            }
        }
        
        return { 
            currentLevel: 'Diamond', 
            nextLevel: 'Max', 
            xpNeeded: 0,
            progress: 100
        };
    }
    
    // Update leaderboard
    async updateLeaderboard(userId, xp) {
        try {
            const response = await fetch(`${API_URL}/leaderboard/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, xp }),
                credentials: 'include'
            });
            return response.ok;
        } catch (error) {
            console.error('Leaderboard update error:', error);
            return false;
        }
    }
    
    // Show achievement notification
    showAchievement(badge) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">🏆</span>
                <div>
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${badge.name}</div>
                    <div class="achievement-xp">+${badge.xp} XP</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    // Update XP display in UI
    updateXPDisplay(xp) {
        const xpElement = document.getElementById('xpDisplay');
        if (xpElement) {
            xpElement.innerHTML = `⭐ ${xp} XP`;
        }
        
        const rank = this.getRank(xp);
        const rankElement = document.getElementById('rankDisplay');
        if (rankElement) {
            rankElement.innerHTML = `${rank.icon} ${rank.name}`;
        }
        
        // Update progress bar
        const nextLevel = this.getNextLevelXP(xp);
        const progressBar = document.getElementById('xpProgress');
        if (progressBar) {
            progressBar.style.width = `${nextLevel.progress}%`;
        }
    }
    
    // Load user stats from backend
    async loadUserStats(userId) {
        try {
            const response = await fetch(`${API_URL}/dashboard/stats`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const stats = await response.json();
                return {
                    testsCompleted: stats.testsCompleted || 0,
                    perfectScores: stats.perfectScores || 0,
                    streakDays: stats.streakDays || 0,
                    totalQuestions: stats.totalQuestions || 0,
                    placementReadiness: stats.placementReadiness || 0,
                    totalXP: stats.totalXP || 0
                };
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
        
        return null;
    }
}

// Add achievement notification styles to document
const achievementStyles = `
    .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 2000;
    }
    
    .achievement-notification.show {
        transform: translateX(0);
    }
    
    .achievement-content {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .achievement-icon {
        font-size: 2rem;
    }
    
    .achievement-title {
        font-size: 0.8rem;
        opacity: 0.9;
    }
    
    .achievement-name {
        font-weight: bold;
        margin: 0.2rem 0;
    }
    
    .achievement-xp {
        font-size: 0.8rem;
        color: #f6d365;
    }
    
    /* XP Progress Bar */
    .xp-progress-container {
        background: #e2e8f0;
        border-radius: 10px;
        height: 8px;
        overflow: hidden;
        margin: 0.5rem 0;
    }
    
    .xp-progress-fill {
        background: linear-gradient(90deg, #f6d365, #fda085);
        height: 100%;
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 10px;
    }
    
    .rank-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
`;

// Check if styles already added
if (!document.querySelector('#gamification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'gamification-styles';
    styleSheet.textContent = achievementStyles;
    document.head.appendChild(styleSheet);
}

// Initialize gamification engine
const gamification = new GamificationEngine();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gamification;
}