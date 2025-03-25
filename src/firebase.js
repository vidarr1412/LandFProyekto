// firebaseConfig.js
/*
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEqa8xOrWXqt9I68WdC4uE3W1vnA8jvW0",
    authDomain: "dengapp-5d20c.firebaseapp.com",
    projectId: "dengapp-5d20c",
    storageBucket: "dengapp-5d20c.appspot.com",
    messagingSenderId: "603039875561",
    appId: "1:603039875561:web:2b1c540cb1b1d067434b78",
    measurementId: "G-3DGJE66QX4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadString, getDownloadURL };
*/
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
  
// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBEqa8xOrWXqt9I68WdC4uE3W1vnA8jvW0",
  authDomain: "dengapp-5d20c.firebaseapp.com",
  projectId: "dengapp-5d20c",
  storageBucket: "dengapp-5d20c.appspot.com",
  messagingSenderId: "603039875561",
  appId: "1:603039875561:web:2b1c540cb1b1d067434b78",
  measurementId: "G-3DGJE66QX4"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Export the necessary Firebase functions
export { storage, db, uploadBytesResumable, getDownloadURL, ref, doc, updateDoc };