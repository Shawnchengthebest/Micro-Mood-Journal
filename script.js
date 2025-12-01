// ===== AI CONFIGURATION =====
// FREE AI API OPTIONS - Choose one that works best for you!
//
// 📊 COMPARISON TABLE:
// ┌─────────────┬────────────┬──────────┬────────────┐
// │ API         │ Free Tier  │ Quality  │ Speed      │
// ├─────────────┼────────────┼──────────┼────────────┤
// │ Groq ⭐     │ YES        │ Excellent│ Very Fast  │
// │ Hugging Face│ YES        │ Good     │ Moderate   │
// │ Together AI │ FREE $     │ Very Good│ Fast       │
// │ Cohere      │ YES        │ Very Good│ Fast       │
// │ OpenAI      │ Paid $$$   │ Best     │ Moderate   │
// └─────────────┴────────────┴──────────┴────────────┘
//
// RECOMMENDED: Use Groq (fastest + free)
//
// SETUP INSTRUCTIONS:
// 1. GROQ (Recommended):
//    - Go to: https://console.groq.com/keys
//    - Sign up (free)
//    - Create an API key
//    - Replace 'gsk_your-groq-api-key-here' with your key
//    - Set ACTIVE_AI = 'groq'
//
// 2. HUGGING FACE (Free):
//    - Go to: https://huggingface.co/settings/tokens
//    - Create a free account
//    - Generate an access token
//    - Replace 'hf_your-token-here' with your token
//    - Set ACTIVE_AI = 'huggingface'
//
// 3. COHERE (Free tier):
//    - Go to: https://cohere.com/
//    - Sign up (free)
//    - Get your API key
//    - Set ACTIVE_AI = 'cohere'
//
// 4. TOGETHER AI (Free credits):
//    - Go to: https://www.together.ai/
//    - Sign up (get free credits)
//    - Get your API key
//    - Set ACTIVE_AI = 'together'
//
// 5. OPENAI (Best quality, requires payment):
//    - Go to: https://openai.com/api
//    - Set up billing
//    - Get your API key
//    - Set ACTIVE_AI = 'openai'
//
// 6. LOCAL ONLY (No API needed):
//    - Set ACTIVE_AI = 'local'
//    - Uses keyword-based analysis (works offline!)

// Option 1: OpenAI API (paid, high quality)
const AI_CONFIG = {
    apiKey: 'sk-proj-your-api-key-here', // Get from https://openai.com/api
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions'
};

// Option 2: Hugging Face API (free tier available)
// Get free token: https://huggingface.co/settings/tokens
const HUGGING_FACE_CONFIG = {
    apiKey: 'hf_your-token-here',
    endpoint: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill'
};

// Option 3: Groq API (FREE, very fast - recommended!)
// Get free API key: https://console.groq.com/keys
// IMPORTANT: Set your API key as environment variable GROQ_API_KEY
// For development, add to a .env file or set in your deployment
const GROQ_CONFIG = {
    apiKey: localStorage.getItem('groq_api_key') || 'gsk_your-groq-api-key-here',
    model: 'mixtral-8x7b-32768',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
};

// Option 4: Cohere API (free tier)
// Get free API key: https://cohere.com/
const COHERE_CONFIG = {
    apiKey: 'your-cohere-api-key-here',
    endpoint: 'https://api.cohere.ai/v1/generate'
};

// Option 5: Together AI (free credits)
// Get free API key: https://www.together.ai/
const TOGETHER_AI_CONFIG = {
    apiKey: 'your-together-api-key-here',
    model: 'meta-llama/Llama-2-7b-chat',
    endpoint: 'https://api.together.xyz/v1/chat/completions'
};

// Set which API to use (1-5, or 'local')
// Options: 'openai', 'huggingface', 'groq', 'cohere', 'together', 'local'
const ACTIVE_AI = 'local'; // Change this to your chosen API

// ===== DATABASE (Firebase) =====
class Database {
    constructor() {
        this.initialized = false;
        this.initPromise = this.init();  // Store the promise but don't await here
    }

    async init() {
        try {
            // Wait for Firebase to be available first
            await this.ensureFirebaseReady();
            
            // Wait for Firebase to initialize
            await new Promise((resolve) => {
                window.auth.onAuthStateChanged((user) => {
                    if (user) {
                        currentUser = {
                            id: user.uid,
                            email: user.email,
                            name: user.displayName || 'User'
                        };
                        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                        console.log('User logged in from Firebase:', currentUser);
                    } else {
                        currentUser = null;
                        sessionStorage.removeItem('currentUser');
                    }
                    resolve();
                });
            });
            this.initialized = true;
        } catch (error) {
            console.error('Database init error:', error);
        }
    }

    async addUser(user) {
        try {
            // Wait for Firebase to be available
            await this.ensureFirebaseReady();
            
            // Double check that Firebase is available
            if (!window.auth || !window.db) {
                console.error('Firebase not available after ensureFirebaseReady:', {
                    auth: !!window.auth,
                    db: !!window.db
                });
                throw new Error('Firebase failed to load');
            }
            
            // Create user with Firebase Auth
            const userCredential = await window.auth.createUserWithEmailAndPassword(user.email, user.password);
            const uid = userCredential.user.uid;
            
            // Store user profile in Firestore
            await window.db.collection('users').doc(uid).set({
                email: user.email,
                name: user.name,
                createdAt: new Date().toISOString()
            });
            
            return { success: true };
        } catch (error) {
            console.error('addUser error:', error);
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, message: 'Email already registered' };
            }
            return { success: false, message: error.message };
        }
    }

    async getUser(email, password) {
        try {
            // Wait for Firebase to be available
            await this.ensureFirebaseReady();
            
            // Double check that Firebase is available
            if (!window.auth || !window.db) {
                console.error('Firebase not available after ensureFirebaseReady:', {
                    auth: !!window.auth,
                    db: !!window.db
                });
                throw new Error('Firebase failed to load');
            }
            
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Get user profile from Firestore
            const docSnap = await window.db.collection('users').doc(user.uid).get();
            if (docSnap.exists) {
                return {
                    id: user.uid,
                    email: user.email,
                    name: docSnap.data().name
                };
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }

    async getUserById(id) {
        try {
            await this.ensureFirebaseReady();
            const docSnap = await window.db.collection('users').doc(id).get();
            if (docSnap.exists) {
                return {
                    id: id,
                    ...docSnap.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            await this.ensureFirebaseReady();
            const snapshot = await window.db.collection('users').get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return users;
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    }

    async addEntry(entry) {
        try {
            await this.ensureFirebaseReady();
            if (!currentUser) {
                throw new Error('User not logged in');
            }
            
            const entryData = {
                userId: currentUser.id,
                mood: entry.mood,
                text: entry.text,
                createdAt: entry.createdAt || new Date().toISOString()
            };
            
            const docRef = await window.db.collection('entries').add(entryData);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Add entry error:', error);
            return { success: false, message: error.message };
        }
    }

    async getUserEntries(userId) {
        try {
            await this.ensureFirebaseReady();
            const snapshot = await window.db.collection('entries')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const entries = [];
            snapshot.forEach(doc => {
                entries.push({ id: doc.id, ...doc.data() });
            });
            return entries;
        } catch (error) {
            console.error('Get user entries error:', error);
            return [];
        }
    }

    async getAllEntries() {
        try {
            await this.ensureFirebaseReady();
            const snapshot = await window.db.collection('entries').get();
            const entries = [];
            snapshot.forEach(doc => {
                entries.push({ id: doc.id, ...doc.data() });
            });
            return entries;
        } catch (error) {
            console.error('Get all entries error:', error);
            return [];
        }
    }

    async deleteAllData() {
        try {
            await this.ensureFirebaseReady();
            // Delete all entries for current user
            const entries = await this.getUserEntries(currentUser.id);
            for (const entry of entries) {
                await window.db.collection('entries').doc(entry.id).delete();
            }
            return { success: true };
        } catch (error) {
            console.error('Delete data error:', error);
            return { success: false, message: error.message };
        }
    }

    // Ensure Firebase is loaded before using it
    async ensureFirebaseReady() {
        return new Promise((resolve) => {
            if (window.auth && window.db) {
                console.log('Firebase already ready');
                resolve();
                return;
            }
            
            console.log('Waiting for Firebase to load...');
            
            // Wait up to 10 seconds for Firebase to load
            let attempts = 0;
            const checkInterval = setInterval(() => {
                if (window.auth && window.db) {
                    clearInterval(checkInterval);
                    console.log('Firebase loaded successfully');
                    resolve();
                }
                attempts++;
                if (attempts > 100) { // 100 * 100ms = 10 seconds
                    clearInterval(checkInterval);
                    console.error('Firebase failed to load after 10 seconds');
                    console.error('window.auth:', typeof window.auth);
                    console.error('window.db:', typeof window.db);
                    resolve(); // resolve anyway to avoid hanging
                }
            }, 100);
        });
    }
}

// ===== STATE MANAGEMENT =====
const database = new Database();
let currentUser = null;
let sortOrder = 'desc';
let selectedMood = null;
let selectedCalendarDate = null; // ISO date string (yyyy-mm-dd)
let calYear = null;
let calMonth = null; // 0-based
let moodChart = null;

// Use 'database' variable for Firebase calls (was 'db' before, but db is now Firestore)

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

// ===== MODAL FUNCTIONS =====
function openAuthModal(mode) {
    console.log('openAuthModal called with mode:', mode);
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    console.log('Modal element found:', !!modal);
    console.log('Modal current classes:', modal?.className);
    
    modal.classList.remove('hidden');
    
    console.log('Modal after removing hidden:', modal?.className);
    
    if (mode === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else if (mode === 'signup') {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('hidden');
    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
    document.getElementById('auth-message').className = 'auth-message';
}

// ===== MOOD ADVICE FUNCTIONS =====
let pendingMoodData = null;

function showMoodAdvice(moodScore, analysisText) {
    const panel = document.getElementById('mood-advice-panel');
    const emoji = document.getElementById('advice-mood-emoji');
    const moodText = document.getElementById('advice-mood-text');
    const adviceText = document.getElementById('advice-text');
    
    // Get advice based on mood score
    const advice = getMoodAdvice(moodScore);
    
    // Update emoji and mood level
    emoji.textContent = getMoodEmoji(moodScore);
    moodText.textContent = `Mood Level: ${moodScore}/5`;
    
    // Format advice text
    const adviceHTML = `
        <p><strong>${advice.title}</strong></p>
        <p>${advice.messages.map(msg => msg === '' ? '<br>' : msg).join('<br>')}</p>
    `;
    adviceText.innerHTML = adviceHTML;
    
    // Add mood-specific styling
    panel.classList.remove('mood-bad', 'mood-neutral', 'mood-good');
    if (moodScore <= 2) {
        panel.classList.add('mood-bad');
    } else if (moodScore === 3) {
        panel.classList.add('mood-neutral');
    } else {
        panel.classList.add('mood-good');
    }
    
    // Store the mood data for saving later
    pendingMoodData = { moodScore, text: analysisText };
    
    // Show the panel
    panel.classList.remove('hidden');
}

function closeMoodAdvice() {
    const panel = document.getElementById('mood-advice-panel');
    panel.classList.add('hidden');
    pendingMoodData = null;
}

function saveMoodAndCloseAdvice() {
    if (!pendingMoodData) {
        closeMoodAdvice();
        return;
    }
    
    const moodText = document.getElementById('mood-text').value.trim();
    if (!moodText) {
        showNotification('Please write something in the journal first', 'error');
        return;
    }
    
    // Add entry with the detected mood
    const createdAt = selectedCalendarDate 
        ? new Date(selectedCalendarDate + 'T12:00:00').toISOString()
        : new Date().toISOString();
    
    database.addEntry({
        userId: currentUser.id,
        mood: pendingMoodData.moodScore,
        text: moodText,
        createdAt: createdAt
    }).then(() => {
        // Clear and refresh UI
        document.getElementById('mood-text').value = '';
        selectedCalendarDate = null;
        loadUserData();
        renderMoodChart();
        renderCalendar(calYear, calMonth);
        
        closeMoodAdvice();
        showNotification(`✅ Entry saved with mood ${pendingMoodData.moodScore}/5!`, 'success');
    }).catch(error => {
        console.error('Error saving entry:', error);
        showNotification('Error saving entry. Please try again.', 'error');
    });
}

// ===== AUTHENTICATION HANDLERS =====
async function handleLogin() {
    try {
        // Ensure database is initialized
        if (database.initPromise) {
            await database.initPromise;
        }
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        console.log('Login attempt:', email);

        if (!email || !password) {
            showAuthMessage('Please fill in all fields', 'error');
            return;
        }

        const user = await database.getUser(email, password);
        console.log('User found:', user);
        
        if (user) {
            currentUser = user;
            console.log('Current user set:', currentUser);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            closeAuthModal();
            // Immediately show app without delay
            showApp();
            
            // Show message after app is loaded
            setTimeout(() => {
                showNotification(`Welcome back, ${user.name}!`, 'success');
            }, 100);
        } else {
            showAuthMessage('Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage(`Error: ${error.message}`, 'error');
    }
}

async function handleSignUp() {
    try {
        // Ensure database is initialized
        if (database.initPromise) {
            await database.initPromise;
        }
        
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

        const result = await database.addUser({ name, email, password });
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
    } catch (error) {
        console.error('Signup error:', error);
        showAuthMessage(`Error: ${error.message}`, 'error');
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
    try {
        console.log('showApp called, currentUser:', currentUser);
        
        const landingPage = document.getElementById('landing-page');
        const appContainer = document.getElementById('app-container');
        const authModal = document.getElementById('auth-modal');
        
        console.log('Landing page found:', !!landingPage);
        console.log('App container found:', !!appContainer);
        
        if (landingPage) {
            landingPage.classList.add('hidden');
            console.log('Added hidden to landing-page');
        }
        
        if (authModal) {
            authModal.classList.add('hidden');
            console.log('Added hidden to auth-modal');
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
            console.log('Removed hidden from app-container');
        }
        
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome && currentUser) {
            userWelcome.textContent = `Welcome, ${currentUser.name}!`;
            console.log('Set user welcome text');
        }
        
        console.log('About to load user data');
        loadUserData();
        // initialize calendar and chart
        startCalendar();
        renderMoodChart();
        console.log('showApp complete');
    } catch (error) {
        console.error('Error in showApp:', error);
    }
}

function showAuthScreen() {
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.getElementById('app-container');
    const authModal = document.getElementById('auth-modal');
    
    if (landingPage) {
        landingPage.classList.remove('hidden');
    }
    if (appContainer) {
        appContainer.classList.add('hidden');
    }
    if (authModal) {
        authModal.classList.add('hidden');
    }
    
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
async function handleMoodSubmit() {
    const text = document.getElementById('mood-text').value.trim();
    const btn = document.getElementById('submit-btn');

    if (!text) {
        showNotification('Please write something', 'error');
        return;
    }

    // Show loading state
    btn.classList.add('loading');
    btn.textContent = '🔄 Analyzing mood...';
    btn.disabled = true;

    try {
        // Analyze the text with AI to determine mood
        const analysis = await getMoodAnalysis(text);
        const detectedMood = analysis.moodScore;

        // Show the advice panel instead of saving immediately
        showMoodAdvice(detectedMood, text);
        
    } catch (error) {
        console.error('Error analyzing mood:', error);
        showNotification('Error analyzing mood. Please try again.', 'error');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = 'Save Entry & Analyze Mood';
        btn.disabled = false;
    }
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
async function loadUserData() {
    const entries = await database.getUserEntries(currentUser.id);
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
    loadUserData();
}

// ===== ADMIN FUNCTIONS =====
async function viewAllUsers() {
    const users = await database.getAllUsers();
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

async function viewAllEntries() {
    const entries = await database.getAllEntries();
    const output = document.getElementById('admin-output');
    
    if (entries.length === 0) {
        output.textContent = 'No entries in database';
        return;
    }

    const formatted = entries.map(async entry => {
        const user = await database.getUserById(entry.userId);
        const userName = user ? user.name : 'Unknown';
        return `User: ${userName}\nMood: ${getMoodEmoji(entry.mood)} (${entry.mood}/5)\nText: ${entry.text}\nDate: ${formatDate(entry.createdAt)}\n`;
    });

    Promise.all(formatted).then(results => {
        output.textContent = results.join('\n---\n');
    });
}

async function clearAllData() {
    if (confirm('Are you sure? This will delete ALL entries. This cannot be undone!')) {
        await database.deleteAllData();
        showNotification('All entries cleared', 'success');
        loadUserData();
    }
}

// ===== AI ANALYSIS FUNCTIONS =====
let aiAnalysisResult = null;
let aiMoodSuggestion = null;

// Analyze today's mood from journal entries
async function analyzeCurrentMood() {
    const todayEntries = getTodayEntries();
    
    if (todayEntries.length === 0) {
        showNotification('No journal entries yet today. Start writing to get AI mood analysis!', 'error');
        return;
    }

    // Combine all today's entries into one text
    const allText = todayEntries.map(e => e.text).join(' ');
    
    const btn = event.target;
    btn.classList.add('loading');
    btn.textContent = '🔄 Analyzing...';
    btn.disabled = true;

    try {
        aiMoodSuggestion = await getMoodAnalysis(allText);
        
        if (aiMoodSuggestion) {
            displayMoodSuggestion(aiMoodSuggestion);
        } else {
            showNotification('Could not analyze mood. Please try again.', 'error');
        }
    } catch (error) {
        console.error('AI Analysis error:', error);
        showNotification('Error analyzing mood. Make sure API key is set.', 'error');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = '🤖 Analyze Today';
        btn.disabled = false;
    }
}

// Get entries from today
async function getTodayEntries() {
    if (!currentUser) return [];
    const allEntries = await database.getUserEntries(currentUser.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });
}

// Display the mood suggestion
function displayMoodSuggestion(result) {
    const suggestion = document.getElementById('ai-suggestion');
    const resultDiv = document.getElementById('ai-suggestion-result');
    
    resultDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
            <span style="font-size: 2rem;">${getMoodEmoji(result.moodScore)}</span>
            <p style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">Mood Level: ${result.moodScore}/5</p>
        </div>
        <p>${result.analysis}</p>
    `;
    
    suggestion.classList.add('visible');
    suggestion.classList.remove('hidden');
}

// Accept the AI suggestion and apply it
function acceptAISuggestion() {
    if (!aiMoodSuggestion) return;
    
    // Set the mood
    if (aiMoodSuggestion.moodScore) {
        selectedMood = aiMoodSuggestion.moodScore;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.mood === aiMoodSuggestion.moodScore.toString()) {
                btn.classList.add('selected');
            }
        });
    }
    
    dismissAISuggestion();
    showNotification('✅ Mood suggestion applied! Review and save when ready.', 'success');
}

// Dismiss the suggestion
function dismissAISuggestion() {
    const suggestion = document.getElementById('ai-suggestion');
    suggestion.classList.remove('visible');
    suggestion.classList.add('hidden');
}

function toggleAIHelper() {
    const helper = document.getElementById('ai-helper');
    helper.classList.toggle('visible');
    helper.classList.toggle('hidden');
    if (helper.classList.contains('visible')) {
        document.getElementById('ai-analysis-input').focus();
    }
}

function closeAIHelper() {
    const helper = document.getElementById('ai-helper');
    helper.classList.remove('visible');
    helper.classList.add('hidden');
    const output = document.getElementById('ai-output');
    output.classList.remove('visible');
    output.classList.add('hidden');
}

// ===== CALENDAR & CHART FUNCTIONS =====
function startCalendar() {
    const today = new Date();
    calYear = today.getFullYear();
    calMonth = today.getMonth();
    renderCalendar(calYear, calMonth);
}

function prevMonth() {
    calMonth -= 1;
    if (calMonth < 0) { calMonth = 11; calYear -= 1; }
    renderCalendar(calYear, calMonth);
}

function nextMonth() {
    calMonth += 1;
    if (calMonth > 11) { calMonth = 0; calYear += 1; }
    renderCalendar(calYear, calMonth);
}

function renderCalendar(year, month) {
    const calendarEl = document.getElementById('calendar');
    const title = document.getElementById('calendar-month-year');
    title.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    calendarEl.innerHTML = '';

    // first day of month
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0-6
    // number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // previous month days to show
    const prevDays = startDay;
    const prevMonthLast = new Date(year, month, 0).getDate();

    // get all user entries to mark days
    if (currentUser) {
        database.getUserEntries(currentUser.id).then(entries => {
            const entryDates = new Set(entries.map(e => (new Date(e.createdAt)).toISOString().slice(0,10)));

            // Render 6 weeks grid (42 cells)
            for (let i = 0; i < 42; i++) {
                const cell = document.createElement('div');
                cell.className = 'day';

                let dayNum = i - prevDays + 1;
                let cellDate = null;
                if (i < prevDays) {
                    // previous month
                    const d = prevMonthLast - (prevDays - 1 - i);
                    cell.textContent = d;
                    cell.classList.add('other-month');
                    const dt = new Date(year, month -1, d);
                    cellDate = dt.toISOString().slice(0,10);
                } else if (dayNum <= daysInMonth) {
                    // current month
                    cell.textContent = dayNum;
                    const dt = new Date(year, month, dayNum);
                    cellDate = dt.toISOString().slice(0,10);
                } else {
                    // next month
                    const d = dayNum - daysInMonth;
                    cell.textContent = d;
                    cell.classList.add('other-month');
                    const dt = new Date(year, month +1, d);
                    cellDate = dt.toISOString().slice(0,10);
                }

                // mark if there are entries on that date
                if (entryDates.has(cellDate)) {
                    const mark = document.createElement('div');
                    mark.style.fontSize = '0.9rem';
                    mark.style.marginTop = '6px';
                    mark.textContent = '•';
                    cell.appendChild(mark);
                }

                // click handler
                cell.addEventListener('click', () => {
                    selectCalendarDate(cellDate);
                });

                // highlight selected
                if (selectedCalendarDate && selectedCalendarDate === cellDate) {
                    cell.classList.add('selected');
                }

                calendarEl.appendChild(cell);
            }
        });
    }
}

function selectCalendarDate(dateISO) {
    selectedCalendarDate = dateISO; // yyyy-mm-dd
    // update selected visuals
    document.querySelectorAll('.calendar-grid .day').forEach(el => {
        el.classList.remove('selected');
        if (el.textContent && (new Date(dateISO)).getDate().toString() === el.textContent) {
            // rough match: ensure in same month
            el.classList.add('selected');
        }
    });
    // bring focus to journal box and prefill if there is an entry for that date (optional)
    if (currentUser) {
        database.getUserEntries(currentUser.id).then(entries => {
            const filtered = entries.filter(e => new Date(e.createdAt).toISOString().slice(0,10) === dateISO);
            if (filtered.length > 0) {
                // show latest entry for that day in the textarea for editing/new
                document.getElementById('mood-text').value = filtered[0].text;
            } else {
                document.getElementById('mood-text').value = '';
            }
            document.getElementById('mood-text').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function renderMoodChart() {
    if (!currentUser) return;
    
    database.getUserEntries(currentUser.id).then(allEntries => {
        // compute last 12 months
        const now = new Date();
        const labels = [];
        const averages = [];

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            labels.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));

            // filter entries in this month
            const monthEntries = allEntries.filter(e => {
                const dt = new Date(e.createdAt);
                return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
            });
            if (monthEntries.length === 0) {
                averages.push(null);
            } else {
                const avg = monthEntries.reduce((s, x) => s + x.mood, 0) / monthEntries.length;
                averages.push(Number(avg.toFixed(2)));
            }
        }

        // create or update chart
        const ctx = document.getElementById('moodChart').getContext('2d');
        if (moodChart) {
            moodChart.data.labels = labels;
            moodChart.data.datasets[0].data = averages;
            moodChart.update();
        } else {
            moodChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Average Mood',
                        data: averages,
                        borderColor: 'rgba(74,144,226,0.9)',
                        backgroundColor: 'rgba(74,144,226,0.2)',
                        tension: 0.3,
                        spanGaps: true
                    }]
                },
                options: {
                    scales: {
                        y: { min: 1, max: 5, ticks: { stepSize: 1 } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    });
}


async function analyzeWithAI() {
    const text = document.getElementById('ai-analysis-input').value.trim();
    
    if (!text) {
        showNotification('Please enter some text to analyze', 'error');
        return;
    }

    const btn = event.target;
    btn.classList.add('loading');
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        // Call the analysis function
        aiAnalysisResult = await getMoodAnalysis(text);
        
        if (aiAnalysisResult) {
            displayAIAnalysis(aiAnalysisResult);
        } else {
            showNotification('Could not analyze text. Please try again.', 'error');
        }
    } catch (error) {
        console.error('AI Analysis error:', error);
        showNotification('Error analyzing text. Check console and API key.', 'error');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = 'Analyze with AI';
        btn.disabled = false;
    }
}

async function getMoodAnalysis(text) {
    // Try different APIs based on ACTIVE_AI setting
    
    if (ACTIVE_AI === 'openai') {
        return await analyzeWithOpenAI(text);
    } else if (ACTIVE_AI === 'groq') {
        return await analyzeWithGroq(text);
    } else if (ACTIVE_AI === 'huggingface') {
        return await analyzeWithHuggingFace(text);
    } else if (ACTIVE_AI === 'cohere') {
        return await analyzeWithCohere(text);
    } else if (ACTIVE_AI === 'together') {
        return await analyzeWithTogether(text);
    } else {
        return generateLocalAnalysis(text);
    }
}

// OpenAI Implementation
async function analyzeWithOpenAI(text) {
    try {
        const response = await fetch(AI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a compassionate mood analysis assistant. Analyze the user\'s text and provide: 1) A mood score (1-5), 2) Key emotions detected, 3) Brief supportive advice. Keep response concise and helpful.'
                    },
                    {
                        role: 'user',
                        content: `Analyze my mood from this text: "${text}"`
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error('OpenAI Error:', response.status);
            return generateLocalAnalysis(text);
        }

        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        return {
            analysis: analysisText,
            moodScore: extractMoodScore(analysisText),
            source: 'openai'
        };
    } catch (error) {
        console.log('OpenAI API failed:', error);
        return generateLocalAnalysis(text);
    }
}

// Groq Implementation (FREE - Recommended!)
async function analyzeWithGroq(text) {
    try {
        const response = await fetch(GROQ_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: GROQ_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a mood analysis assistant. Analyze the mood and provide: mood score (1-5), emotions, and brief advice.'
                    },
                    {
                        role: 'user',
                        content: `Analyze mood: "${text}"`
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error('Groq Error:', response.status);
            return generateLocalAnalysis(text);
        }

        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        return {
            analysis: analysisText,
            moodScore: extractMoodScore(analysisText),
            source: 'groq'
        };
    } catch (error) {
        console.log('Groq API failed:', error);
        return generateLocalAnalysis(text);
    }
}

// Hugging Face Implementation (FREE)
async function analyzeWithHuggingFace(text) {
    try {
        const response = await fetch(HUGGING_FACE_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text
            })
        });

        if (!response.ok) {
            console.error('Hugging Face Error:', response.status);
            return generateLocalAnalysis(text);
        }

        const data = await response.json();
        const analysisText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        
        return {
            analysis: analysisText || 'Analysis generated',
            moodScore: extractMoodScore(text),
            source: 'huggingface'
        };
    } catch (error) {
        console.log('Hugging Face API failed:', error);
        return generateLocalAnalysis(text);
    }
}

// Cohere Implementation (FREE tier)
async function analyzeWithCohere(text) {
    try {
        const response = await fetch(COHERE_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COHERE_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: `Analyze the mood and emotions in this text and provide a score 1-5. Text: "${text}". Provide: mood score, emotions, advice.`,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            console.error('Cohere Error:', response.status);
            return generateLocalAnalysis(text);
        }

        const data = await response.json();
        const analysisText = data.generations[0]?.text;
        
        return {
            analysis: analysisText || 'Analysis generated',
            moodScore: extractMoodScore(analysisText || text),
            source: 'cohere'
        };
    } catch (error) {
        console.log('Cohere API failed:', error);
        return generateLocalAnalysis(text);
    }
}

// Together AI Implementation (FREE credits)
async function analyzeWithTogether(text) {
    try {
        const response = await fetch(TOGETHER_AI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_AI_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: TOGETHER_AI_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze mood and provide score 1-5, emotions, and brief advice.'
                    },
                    {
                        role: 'user',
                        content: `Analyze mood: "${text}"`
                    }
                ],
                max_tokens: 200
            })
        });

        if (!response.ok) {
            console.error('Together AI Error:', response.status);
            return generateLocalAnalysis(text);
        }

        const data = await response.json();
        const analysisText = data.output?.choices?.[0]?.text || data.choices?.[0]?.message?.content;
        
        return {
            analysis: analysisText || 'Analysis generated',
            moodScore: extractMoodScore(analysisText || text),
            source: 'together'
        };
    } catch (error) {
        console.log('Together AI failed:', error);
        return generateLocalAnalysis(text);
    }
}

function generateLocalAnalysis(text) {
    // Local mood analysis using keywords
    const textLower = text.toLowerCase();
    
    // Define mood keywords
    const sadKeywords = ['sad', 'depressed', 'lonely', 'upset', 'miserable', 'terrible', 'awful', 'hate', 'worst'];
    const unhappyKeywords = ['bad', 'wrong', 'difficult', 'hard', 'frustrated', 'annoyed', 'disappointed'];
    const neutralKeywords = ['okay', 'fine', 'alright', 'neutral', 'normal', 'average'];
    const happyKeywords = ['good', 'happy', 'great', 'nice', 'fun', 'enjoyed', 'pleased'];
    const excellentKeywords = ['excellent', 'amazing', 'fantastic', 'wonderful', 'love', 'best', 'awesome'];
    
    const countMatches = (keywords) => keywords.filter(kw => textLower.includes(kw)).length;
    
    const sadCount = countMatches(sadKeywords);
    const unhappyCount = countMatches(unhappyKeywords);
    const neutralCount = countMatches(neutralKeywords);
    const happyCount = countMatches(happyKeywords);
    const excellentCount = countMatches(excellentKeywords);
    
    let moodScore = 3;
    if (excellentCount > 0) moodScore = 5;
    else if (happyCount > unhappyCount) moodScore = 4;
    else if (sadCount > 0) moodScore = 1;
    else if (unhappyCount > happyCount) moodScore = 2;
    
    const emotions = [];
    if (sadCount > 0) emotions.push('Sadness');
    if (unhappyCount > 0) emotions.push('Frustration');
    if (happyCount > 0) emotions.push('Joy');
    if (excellentCount > 0) emotions.push('Elation');
    
    const advice = getMoodAdvice(moodScore);
    
    const analysis = `
📊 **Mood Analysis**
Detected Mood: ${getMoodEmoji(moodScore)} (${moodScore}/5)
Emotions: ${emotions.length > 0 ? emotions.join(', ') : 'Neutral'}

💭 **Insights:**
${advice}

Remember: Your feelings are valid. Consider journaling more details to track patterns.
    `.trim();
    
    return {
        analysis: analysis,
        moodScore: moodScore,
        source: 'local'
    };
}

function getMoodAdvice(score) {
    const adviceMap = {
        1: {
            title: "Your mood seems quite low right now 💙",
            messages: [
                "It's okay to feel sad sometimes. Your emotions are valid and important.",
                "Consider these supportive steps:",
                "• Take a short walk or get some fresh air",
                "• Reach out to someone you trust or care about",
                "• Practice deep breathing: 4 seconds in, 6 seconds out",
                "• Engage in a small activity you enjoy",
                "• Be kind to yourself - this feeling will pass",
                "",
                "If you're experiencing persistent sadness, please reach out to a mental health professional or crisis helpline. You're not alone. 💚"
            ]
        },
        2: {
            title: "You seem to be experiencing some challenges 💙",
            messages: [
                "It's natural to have difficult moments. Acknowledge your feelings.",
                "Here are some helpful suggestions:",
                "• Talk to someone about what's bothering you",
                "• Identify one small positive thing to focus on",
                "• Try a relaxing activity (music, reading, art)",
                "• Practice self-compassion - treat yourself like a good friend",
                "• Movement can help - stretch, dance, or exercise",
                "",
                "Remember, seeking help is a sign of strength, not weakness."
            ]
        },
        3: {
            title: "You're feeling neutral or balanced 😐",
            messages: [
                "Neutral moods are normal and can be a good time for reflection.",
                "Consider these mindful actions:",
                "• Reflect on what contributes to your emotional balance",
                "• Set a small goal or intention for today",
                "• Connect with someone important to you",
                "• Engage in something that brings you joy or purpose",
                "• Practice gratitude for the stability you're feeling",
                "",
                "Use this calm moment to build positive habits for your well-being."
            ]
        },
        4: {
            title: "You're feeling good! 🙂",
            messages: [
                "Great! You're in a positive frame of mind.",
                "Make the most of this good mood:",
                "• Channel this energy into something productive or creative",
                "• Share your positivity with others around you",
                "• Tackle something you've been putting off",
                "• Strengthen relationships with people you care about",
                "• Notice what's contributing to your good mood",
                "",
                "Appreciate these good moments and let them fuel your motivation!"
            ]
        },
        5: {
            title: "You're feeling amazing! 😄",
            messages: [
                "Wonderful! You're experiencing a high level of happiness and well-being.",
                "Celebrate and expand this positive state:",
                "• Express your gratitude and appreciation to others",
                "• Use this energy to help or inspire someone else",
                "• Start that project or goal you've been dreaming about",
                "• Share your joy - it's contagious!",
                "• Document this feeling to revisit on difficult days",
                "",
                "Keep nurturing what makes you feel this way. You deserve it! 🌟"
            ]
        }
    };

    return adviceMap[score] || adviceMap[3];
}

function extractMoodScore(text) {
    // Try to extract a mood score from the analysis text
    const scoreMatch = text.match(/(\d)\/5|score[:\s]*(\d)|mood[:\s]*(\d)/i);
    if (scoreMatch) {
        const score = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
        return Math.min(Math.max(score, 1), 5);
    }
    return 3;
}

function displayAIAnalysis(result) {
    const output = document.getElementById('ai-output');
    const resultDiv = document.getElementById('ai-result');
    
    resultDiv.textContent = result.analysis;
    output.classList.add('visible');
    output.classList.remove('hidden');
}

function applyAIAnalysis() {
    if (!aiAnalysisResult) return;
    
    // Apply the suggested mood score
    if (aiAnalysisResult.moodScore) {
        selectedMood = aiAnalysisResult.moodScore;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.mood === aiAnalysisResult.moodScore.toString()) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Fill in the textarea with the analysis input
    const analysisInput = document.getElementById('ai-analysis-input').value;
    if (analysisInput) {
        document.getElementById('mood-text').value = analysisInput;
    }
    
    // Close the AI helper
    closeAIHelper();
    showNotification('Analysis applied! Review and submit when ready.', 'success');
}

// ===== EVENT LISTENERS =====
function attachMoodButtonListeners() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleMoodSelect(parseInt(btn.dataset.mood));
        });
    });
}

// ===== API KEY MANAGEMENT =====
function setGroqApiKey(apiKey) {
    localStorage.setItem('groq_api_key', apiKey);
    GROQ_CONFIG.apiKey = apiKey;
    console.log('Groq API key set successfully');
}

function getGroqApiKey() {
    return localStorage.getItem('groq_api_key');
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
