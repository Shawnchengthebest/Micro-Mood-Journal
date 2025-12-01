// Firebase Configuration
// DO NOT COMMIT API KEYS - This is OK because Firebase has security rules
// Users can only access their own data via authentication

console.log('firebase-config.js loading...');

// Check if Firebase SDK is available
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded! Waiting...');
    
    // Wait for Firebase SDK to load
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            console.log('Firebase SDK detected, initializing...');
            doInitializeFirebase();
        }
        attempts++;
        if (attempts > 100) {
            clearInterval(checkFirebase);
            console.error('Firebase SDK failed to load after 10 seconds');
        }
    }, 100);
} else {
    console.log('Firebase SDK available, initializing immediately');
    doInitializeFirebase();
}

function doInitializeFirebase() {
    console.log('Initializing Firebase...');
    
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
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log('Firebase app initialized:', app.name);
        
        // Get Auth and Firestore references
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        console.log('Firebase services ready:', {
            auth: !!window.auth,
            db: !!window.db
        });
        
        // Enable offline persistence
        window.db.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open - persistence disabled');
            } else if (err.code == 'unimplemented') {
                console.warn('Browser does not support persistence');
            }
        });
        
        console.log('✓ Firebase initialization complete');
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}
