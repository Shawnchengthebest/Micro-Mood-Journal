// Firebase Configuration
// DO NOT COMMIT API KEYS - This is OK because Firebase has security rules
// Users can only access their own data via authentication

console.log('firebase-config.js loading...');
console.log('firebase object available?', typeof firebase !== 'undefined');
console.log('window.firebase available?', typeof window.firebase !== 'undefined');

// Wait for Firebase SDK to load if it hasn't yet
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded! Waiting...');
    // Create a function that will initialize when firebase is available
    window.initFirebaseConfig = function() {
        console.log('Firebase SDK now available, initializing...');
        doInitializeFirebase();
    };
    
    // Also keep checking
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
    doInitializeFirebase();
}

function doInitializeFirebase() {
    console.log('doInitializeFirebase called');
    
    const firebaseConfig = {
        apiKey: "AIzaSyAmfw2fYqd1ebIgNJMKKBfO9IKIH_pRJUs",
        authDomain: "micro-mood-journal.firebaseapp.com",
        projectId: "micro-mood-journal",
        storageBucket: "micro-mood-journal.firebasestorage.app",
        messagingSenderId: "700855297728",
        appId: "1:700855297728:web:f55d0033cdb5ac5d27af25",
        measurementId: "G-XFKJ151RXR"
    };

    console.log('Initializing Firebase with config:', firebaseConfig.projectId);

    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return;
    }

    console.log('Firebase app exists?', firebase?.app);

    // Get references to Firebase services (make global so script.js can access)
    try {
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        console.log('Set window.auth and window.db:', {
            auth: !!window.auth,
            db: !!window.db,
            authType: typeof window.auth,
            dbType: typeof window.db
        });
    } catch (error) {
        console.error('Error setting up Firebase services:', error);
        return;
    }

    // Enable offline persistence
    try {
        window.db.enablePersistence().catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open - persistence disabled');
            } else if (err.code == 'unimplemented') {
                console.warn('Browser does not support persistence');
            }
        });
    } catch (error) {
        console.warn('Could not enable persistence:', error);
    }

    console.log('Firebase initialization complete');
}
