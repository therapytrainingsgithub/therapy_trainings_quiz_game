import { createClient } from '../utils/supabase/client';
import axios from 'axios';

const supabase = createClient();

export interface Question {
  question: string;
  options: string[];
  correctOption: number;
  explanation: { [key: string]: string };
  difficulty: string;
}

// Fetch questions based on difficulty level
export const fetchQuestionsFromDatabase = async (difficultyLevel: number = 1): Promise<Question[]> => {
  try {
    const response = await axios.get('/api/fetch-questions', {
      params: { difficulty: difficultyLevel },
    });

    const questions = response.data.questions.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctOption: q.correct_option,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

// Shuffle questions array
export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Fetch user data (username, saved game, etc.) using Supabase
export const fetchUserData = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.error('Error fetching user:', error);
      return { username: '', savedGameExists: false };
    }

    const username = data.user.user_metadata.username;
    return { username, savedGameExists: false };  // You can adjust this logic based on your saved game logic
  } catch (err) {
    console.error('Error fetching user data:', err);
    return { username: '', savedGameExists: false };
  }
};

// Save game progress
export const saveGameProgress = async (username: string, score: number, round: number, streak: number, mode: string) => {
  try {
    await axios.post('/api/savegame', { username, score, round, streak, mode });
  } catch (error) {
    console.error('Error saving game progress:', error);
  }
};

// Check for saved progress
export const checkSavedProgress = async (username: string) => {
  try {
    const response = await axios.get(`/api/resume-progress?name=${username}`);
    return response.data.session || null;
  } catch (error) {
    console.error('Error checking saved progress:', error);
    return null;
  }
};

// Update the leaderboard
export const updateLeaderboard = async (username: string, score: number, round: number, streak: number) => {
  try {
    await axios.post('/api/quiz-results', { username, score, round, streak });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};
