// Firebase Configuration
console.log('[Firebase] Config loading...');

// Wait for Firebase SDK to be available
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds
        
        const checkFb = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.app) {
                console.log('[Firebase] SDK detected');
                clearInterval(checkFb);
                resolve();
                return;
            }
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(checkFb);
                console.error('[Firebase] SDK failed to load');
                reject(new Error('Firebase SDK failed to load'));
            }
        }, 100);
    });
}

waitForFirebase().then(() => {
    console.log('[Firebase] Initializing...');
    
    const firebaseConfig = {
        apiKey: "AIzaSyAmfw2fYqd1ebIgNJMKKBfO9IKIH_pRJUs",
        authDomain: "micro-mood-journal.firebaseapp.com",
        projectId: "micro-mood-journal",
        storageBucket: "micro-mood-journal.firebasestorage.app",
        messagingSenderId: "700855297728",
        appId: "1:700855297728:web:f55d0033cdb5ac5d27af25",
        measurementId: "G-XFKJ151RXR"
    };

    try {
        firebase.initializeApp(firebaseConfig);
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        console.log('[Firebase] ✓ Initialized successfully');
        console.log('[Firebase] Auth:', !!window.auth);
        console.log('[Firebase] Firestore:', !!window.db);
        
        // Enable offline persistence
        window.db.enablePersistence().catch((err) => {
            console.warn('[Firebase] Persistence:', err.code);
        });
    } catch (error) {
        console.error('[Firebase] Init error:', error);
    }
}).catch((error) => {
    console.error('[Firebase] Config error:', error);
});
