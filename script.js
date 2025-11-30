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

// ===== DATABASE (localStorage) =====
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        if (!localStorage.getItem('users')) {
            // Add demo user for testing
            localStorage.setItem('users', JSON.stringify([
                {
                    id: 1000,
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'demo123',
                    createdAt: new Date().toISOString()
                }
            ]));
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

    console.log('Login attempt:', email, password);

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    const user = db.getUser(email, password);
    console.log('User found:', user);
    
    if (user) {
        currentUser = user;
        console.log('Current user set:', currentUser);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Immediately show app without delay
        showApp();
        
        // Show message after app is loaded
        setTimeout(() => {
            showNotification(`Welcome back, ${user.name}!`, 'success');
        }, 100);
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
    try {
        console.log('showApp called, currentUser:', currentUser);
        
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        console.log('Auth container found:', !!authContainer);
        console.log('App container found:', !!appContainer);
        
        if (authContainer) {
            authContainer.classList.add('hidden');
            console.log('Added hidden to auth-container');
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
        console.log('showApp complete');
    } catch (error) {
        console.error('Error in showApp:', error);
    }
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

        // Save the entry with the AI-detected mood
        db.addEntry({
            userId: currentUser.id,
            mood: detectedMood,
            text: text
        });

        showNotification(`✅ Entry saved! Mood detected: ${getMoodEmoji(detectedMood)}`, 'success');
        document.getElementById('mood-text').value = '';
        selectedMood = null;
        loadUserData();
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
function getTodayEntries() {
    const allEntries = db.getUserEntries(currentUser.id);
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
    const advice = {
        1: '💙 It sounds like you\'re going through a tough time. Consider reaching out to someone you trust, practicing self-care, or seeking professional support if needed.',
        2: '💙 You seem a bit down. Try doing something you enjoy, spend time with friends, or take a break to recharge.',
        3: '😐 You\'re feeling neutral. This is normal. Reflect on what could make your day better.',
        4: '😊 You\'re in a good place! Enjoy this moment and consider what\'s making you feel positive.',
        5: '🌟 You\'re feeling fantastic! Cherish this feeling and remember what brought you here for future reference.'
    };
    return advice[score] || advice[3];
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
