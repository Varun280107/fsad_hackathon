from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
app.secret_key = 'secret123'
CORS(app, supports_credentials=True)

DB_PATH = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            xp INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Questions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            correct_answer TEXT,
            topic TEXT,
            difficulty TEXT
        )
    ''')
    
    # Results table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question_id INTEGER,
            is_correct BOOLEAN,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert sample questions
    cursor.execute("SELECT COUNT(*) FROM questions")
    if cursor.fetchone()[0] == 0:
        sample_questions = [
            ("What is the time complexity of binary search?", "O(n)", "O(log n)", "O(n²)", "O(1)", "B", "Algorithms", "Easy"),
            ("Which data structure uses LIFO?", "Queue", "Array", "Stack", "Linked List", "C", "Data Structures", "Easy"),
            ("What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "None", "A", "Web", "Easy"),
            ("What is Python?", "A snake", "Programming language", "Database", "Operating System", "B", "Programming", "Easy"),
            ("What is SQL used for?", "Styling pages", "Database queries", "Game development", "AI", "B", "Databases", "Easy"),
            ("Which company created Java?", "Microsoft", "Apple", "Sun Microsystems", "Google", "C", "Programming", "Medium"),
            ("What does CPU stand for?", "Computer Processing Unit", "Central Processing Unit", "Central Program Unit", "Computer Program Unit", "B", "CS Basics", "Easy"),
            ("Which is not a programming language?", "Python", "Java", "HTML", "C++", "C", "Programming", "Easy"),
        ]
        
        for q in sample_questions:
            cursor.execute('''INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, topic, difficulty)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', q)
    
    conn.commit()
    conn.close()
    print("Database initialized!")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        hashed = hash_password(data['password'])
        cursor.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                      (data['username'], data['email'], hashed))
        conn.commit()
        return jsonify({'message': 'Success'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username exists'}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    hashed = hash_password(data['password'])
    cursor.execute('SELECT id, username FROM users WHERE username = ? AND password = ?',
                  (data['username'], hashed))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user['id']
        return jsonify({'user_id': user['id'], 'username': user['username']}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/questions', methods=['GET'])
def get_questions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, topic FROM questions LIMIT 10')
    questions = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': q['id'],
        'question': q['question'],
        'options': [q['option_a'], q['option_b'], q['option_c'], q['option_d']],
        'correct_answer': q['correct_answer'],
        'topic': q['topic']
    } for q in questions])

@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401
    
    data = request.json
    answers = data.get('answers', [])
    user_id = session['user_id']
    
    conn = get_db()
    cursor = conn.cursor()
    
    correct = 0
    for answer in answers:
        cursor.execute('SELECT correct_answer FROM questions WHERE id = ?', (answer['question_id'],))
        q = cursor.fetchone()
        if q:
            is_correct = (answer['user_answer'] == q['correct_answer'])
            if is_correct:
                correct += 1
            cursor.execute('INSERT INTO results (user_id, question_id, is_correct) VALUES (?, ?, ?)',
                          (user_id, answer['question_id'], is_correct))
    
    # Update XP
    xp_earned = correct * 10
    cursor.execute('UPDATE users SET xp = xp + ? WHERE id = ?', (xp_earned, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'correct': correct, 'total': len(answers), 'xp_earned': xp_earned})

@app.route('/api/dashboard/stats', methods=['GET'])
def get_stats():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401
    
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct FROM results WHERE user_id = ?', (user_id,))
    stats = cursor.fetchone()
    
    cursor.execute('SELECT xp FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    conn.close()
    
    total = stats['total'] or 0
    correct = stats['correct'] or 0
    
    return jsonify({
        'total_questions': total,
        'accuracy': (correct / total * 100) if total > 0 else 0,
        'total_xp': user['xp'] if user else 0
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)