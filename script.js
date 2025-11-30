// ===== DATABASE (localStorage) =====
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('entries')) {
            localStorage.setItem('entries', JSON.stringify([]));
        }
    }

    // User Management
    addUser(user) {
        const users = JSON.parse(localStorage.getItem('users'));
        if (users.some(u => u.email === user.email)) {
            return { success: false, message: 'Email already exists' };
        }
        users.push({
            ...user,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, message: 'User created successfully' };
    }

    getUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.email === email && u.password === password);
    }

    getUserById(id) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.id === id);
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem('users'));
    }

    // Entry Management
    addEntry(entry) {
        const entries = JSON.parse(localStorage.getItem('entries'));
        entries.push({
            ...entry,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    getUserEntries(userId) {
        const entries = JSON.parse(localStorage.getItem('entries'));
        return entries.filter(e => e.userId === userId);
    }

    getAllEntries() {
        return JSON.parse(localStorage.getItem('entries'));
    }

    deleteAllData() {
        localStorage.setItem('users', JSON.stringify([]));
        localStorage.setItem('entries', JSON.stringify([]));
    }
}

// ===== STATE MANAGEMENT =====
const db = new Database();
let currentUser = null;
let sortOrder = 'desc';
let selectedMood = null;

// ===== HELPER FUNCTIONS =====
function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    setTimeout(() => {
        messageEl.className = 'auth-message';
    }, 3000);
}

function showNotification(message, type = 'success') {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        setTimeout(() => {
            messageEl.className = 'auth-message';
        }, 3000);
    }
}

function getMoodEmoji(mood) {
    const moods = {
        1: '😢',
        2: '😟',
        3: '😐',
        4: '🙂',
        5: '😄'
    };
    return moods[mood] || '😐';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function switchToSignUp(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('auth-message').className = 'auth-message';
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('auth-message').className = 'auth-message';
}

// ===== AUTHENTICATION HANDLERS =====
function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    const user = db.getUser(email, password);
    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        showAuthMessage(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => showApp(), 500);
    } else {
        showAuthMessage('Invalid email or password', 'error');
    }
}

function handleSignUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!name || !email || !password || !confirm) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }

    const result = db.addUser({ name, email, password });
    if (result.success) {
        showAuthMessage('Account created! Please login.', 'success');
        setTimeout(() => switchToLogin({ preventDefault: () => {} }), 500);
        // Clear form
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm').value = '';
    } else {
        showAuthMessage(result.message, 'error');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        showAuthScreen();
    }
}

// ===== UI TRANSITIONS =====
function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('user-welcome').textContent = `Welcome, ${currentUser.name}!`;
    loadUserData();
}

function showAuthScreen() {
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
    document.getElementById('mood-text').value = '';
    selectedMood = null;
}

// ===== MOOD ENTRY HANDLERS =====
function handleMoodSubmit() {
    const text = document.getElementById('mood-text').value.trim();
    
    if (!selectedMood) {
        showNotification('Please select a mood', 'error');
        return;
    }

    if (!text) {
        showNotification('Please write something', 'error');
        return;
    }

    db.addEntry({
        userId: currentUser.id,
        mood: selectedMood,
        text: text
    });

    showNotification('Entry saved successfully!', 'success');
    document.getElementById('mood-text').value = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    selectedMood = null;
    loadUserData();
}

function handleMoodSelect(moodValue) {
    selectedMood = moodValue;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.mood === moodValue.toString()) {
            btn.classList.add('selected');
        }
    });
}

// ===== DATA LOADING & DISPLAY =====
function loadUserData() {
    const entries = db.getUserEntries(currentUser.id);
    displayStats(entries);
    displayHistory(entries);
    attachMoodButtonListeners();
}

function displayStats(entries) {
    const totalEntries = entries.length;
    const avgMood = entries.length > 0 
        ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
        : 'N/A';
    
    const streak = calculateStreak(entries);

    document.getElementById('total-entries').textContent = totalEntries;
    document.getElementById('avg-mood').textContent = avgMood;
    document.getElementById('streak').textContent = `${streak} days`;
}

function calculateStreak(entries) {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === streak) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function displayHistory(entries) {
    const listEl = document.getElementById('mood-list');
    const sorted = [...entries].sort((a, b) => 
        sortOrder === 'desc' 
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
    );

    if (sorted.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p>No entries yet. Start tracking your mood!</p></div>';
        return;
    }

    listEl.innerHTML = sorted.map(entry => `
        <div class="mood-entry">
            <div class="mood-entry-header">
                <span class="mood-emoji">${getMoodEmoji(entry.mood)}</span>
                <span class="mood-date">${formatDate(entry.createdAt)}</span>
            </div>
            <div class="mood-text">${entry.text}</div>
        </div>
    `).join('');
}

function toggleSortOrder() {
    sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    const entries = db.getUserEntries(currentUser.id);
    displayHistory(entries);
}

// ===== ADMIN FUNCTIONS =====
function viewAllUsers() {
    const users = db.getAllUsers();
    const output = document.getElementById('admin-output');
    
    if (users.length === 0) {
        output.textContent = 'No users in database';
        return;
    }

    const formatted = users.map(user => 
        `ID: ${user.id}\nName: ${user.name}\nEmail: ${user.email}\nCreated: ${formatDate(user.createdAt)}\n`
    ).join('\n---\n');

    output.textContent = formatted;
}

function viewAllEntries() {
    const entries = db.getAllEntries();
    const output = document.getElementById('admin-output');
    
    if (entries.length === 0) {
        output.textContent = 'No entries in database';
        return;
    }

    const formatted = entries.map(entry => {
        const user = db.getUserById(entry.userId);
        const userName = user ? user.name : 'Unknown';
        return `User: ${userName}\nMood: ${getMoodEmoji(entry.mood)} (${entry.mood}/5)\nText: ${entry.text}\nDate: ${formatDate(entry.createdAt)}\n`;
    }).join('\n---\n');

    output.textContent = formatted;
}

function clearAllData() {
    if (confirm('Are you sure? This will delete ALL users and entries. This cannot be undone!')) {
        db.deleteAllData();
        showNotification('All data cleared', 'success');
        showAuthScreen();
    }
}

// ===== EVENT LISTENERS =====
function attachMoodButtonListeners() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleMoodSelect(parseInt(btn.dataset.mood));
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        showAuthScreen();
    }
});
