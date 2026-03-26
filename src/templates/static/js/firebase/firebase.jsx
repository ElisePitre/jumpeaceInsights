// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth ,signInWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDflKFHFu5-Iio8KzTu4HJ64HtKzxMG6xI",
  authDomain: "jumppeace-7c331.firebaseapp.com",
  projectId: "jumppeace-7c331",
  storageBucket: "jumppeace-7c331.firebasestorage.app",
  messagingSenderId: "415087615887",
  appId: "1:415087615887:web:9a1d3cd513c03a8d69b5fa",
  measurementId: "G-HG5RQJLD7E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const errorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'The email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'The password is too weak.'; 
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    default:
      return 'An error occurred. Please try again.';
      
  }  }