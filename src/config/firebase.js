import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGUqgmhrn1boqiJAjUVeNNVQ6tfyb0264",
  authDomain: "swinsights-5b1c3.firebaseapp.com",
  projectId: "swinsights-5b1c3",
  storageBucket: "swinsights-5b1c3.appspot.com",
  messagingSenderId: "811126056538",
  appId: "1:811126056538:web:7479271f5c43053105da63"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };