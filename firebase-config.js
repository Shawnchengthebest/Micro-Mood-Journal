// Firebase Configuration
// DO NOT COMMIT API KEYS - This is OK because Firebase has security rules
// Users can only access their own data via authentication

console.log('firebase-config.js loading...');

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log('Firebase app initialized');

// Get references to Firebase services (make global so script.js can access)
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('Set window.auth and window.db:', {
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

console.log('Firebase initialized successfully');
