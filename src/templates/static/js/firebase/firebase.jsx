import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDataConnect } from "firebase/data-connect";
import { connectorConfig, createSearch, getAllSearches, getMySearches } from "../../../../dataconnect-generated";

const firebaseWebConfig = {
  apiKey: "AIzaSyDflKFHFu5-Iio8KzTu4HJ64HtKzxMG6xI",
  authDomain: "jumppeace-7c331.firebaseapp.com",
  projectId: "jumppeace-7c331",
  storageBucket: "jumppeace-7c331.firebasestorage.app",
  messagingSenderId: "415087615887",
  appId: "1:415087615887:web:9a1d3cd513c03a8d69b5fa",
  measurementId: "G-HG5RQJLD7E"
};

export const app = initializeApp(firebaseWebConfig);
export const auth = getAuth(app);
export const dataConnect = getDataConnect(connectorConfig);

const sortNewestFirst = (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

// Returns the current signed-in user's most recent 5 searches.
export const getPastSearches = async (userId) => {
  if (!auth.currentUser) {
    return [];
  }

  const response = await getMySearches(dataConnect);
  const searches = Array.isArray(response?.data?.searches) ? response.data.searches : [];

  return searches
    .filter((entry) => !userId || entry.userId === undefined || entry.userId === userId)
    .sort(sortNewestFirst)
    .slice(0, 5)
    .map((entry) => ({
      userId: userId || auth.currentUser.uid,
      word: entry.word,
      startYear: entry.startYear,
      endYear: entry.endYear,
      createdAt: entry.createdAt
    }));
};

// Returns top 5 most frequent words from all searches.
export const getPopularSearches = async () => {
  const response = await getAllSearches(dataConnect);
  const searches = Array.isArray(response?.data?.searches) ? response.data.searches : [];

  const counts = searches.reduce((acc, entry) => {
    const word = (entry.word || "").trim();
    if (!word) {
      return acc;
    }
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts)
    .map((word) => ({ word, count: counts[word] }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 5);
};

export const addSearchToDatabase = async (userId, word, startYear, endYear) => {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to create searches.");
  }

  const normalizedWord = String(word || "").trim();
  if (!normalizedWord) {
    throw new Error("Search word is required.");
  }

  const payload = {
    userId: userId || auth.currentUser.uid,
    word: normalizedWord,
    startYear: Number(startYear),
    endYear: Number(endYear)
  };

  const response = await createSearch(dataConnect, payload);
  return response?.data?.search_insert || null;
};

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
      case 'auth/invalid-credential':
      return 'The credential is invalid.';

    default:
      return 'An error occurred. Please try again.';
      
  }  }