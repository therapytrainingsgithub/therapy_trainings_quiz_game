'use client';
import Confetti from 'react-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect , useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/db';
import { createClient } from 'utils/supabase/client';
import { useRouter } from 'next/router';

const Loader = () => (
  <svg
    className="animate-spin h-10 w-10 text-black" // Increased size
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);


interface Question {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string; // Single explanation for the entire question
  difficulty: string;
}


interface LeaderboardEntry {
  name: string;
  score: number;
  streak: number;
  round: number;
  timestamp: string; // Add timestamp as a string (ISO date format)
}

function shuffleArray(array: Question[]): Question[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function QuizPage() {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [difficulty, setDifficulty] = useState(1); 
  const [roundWon, setRoundWon] = useState(0); 
  const [audiencePollUsed, setAudiencePollUsed] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [showAllScores, setShowAllScores] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);  
  const [loading, setLoading] = useState(false); // Add loading state
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSavingDialog, setShowSavingDialog] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [TimeEnd, setTimeEnd]=useState(false);
  const [showSaveSuccessDialog, setShowSaveSuccessDialog] = useState(false);
  const [remainingPoints, setRemainingPoints] = useState(1000);
  const [score, setScore] = useState(0);
  const [hasWonGame, setHasWonGame] = useState(false);  // For when the user completes all 10 rounds
  const [streak, setStreak] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [showAudiencePoll, setShowAudiencePoll] = useState(false);
  const [audiencePollResults, setAudiencePollResults] = useState<number[]>([]);
  const [lifelineUsed, setLifelineUsed] = useState({ poll: false, phone: false, fiftyFifty: false });
  const [fiftyFiftyOptions, setFiftyFiftyOptions] = useState<number[]>([]);
  const [phoneFriendResponse, setPhoneFriendResponse] = useState<string | null>(null);
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);
  const [showScore, setShowScore] = useState(true); // Initialize showScore state
  const [savedGameExists, setSavedGameExists] = useState(false); // For saved game check
  const [showSavePopup, setShowSavePopup] = useState(false); // Track if the save popup is shown
  const [showErrorPopup, setShowErrorPopup] = useState(false); // Track if the error popup is shown
  const [showOverwritePopup, setShowOverwritePopup] = useState(false);
  const [existingRound, setExistingRound] = useState<number | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [mode, setMode] = useState<'classic' | 'advanced' | null>(null);
  const [classicTimer, setClassicTimer] = useState(30); 
  const [advancedTimer, setAdvancedTimer] = useState(20); 
  const supabase = createClient(); // Initialize Supabase client
  const [showNoSaveDialog, setShowNoSaveDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Simulating loading
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [loadingUsername, setLoadingUsername] = useState(true); // Track loading state for username
  
  const fetchUserData = async () => {
    try {
      setLoadingUsername(true); // Start loading
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error('Error fetching user:', authError);
        return;
      }

      const userId = authData.user.id;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile data:', profileError);
        return;
      }

      // Set the fetched username from the profiles table
      setUsername(profileData.username);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoadingUsername(false); // End loading
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);


  useEffect(() => {
    // When the game is won (round 10 completed), update the leaderboard with the correct score and round
    if (hasWonGame) {
      updateLeaderboard(score, roundWon);
    }
  }, [hasWonGame, score, roundWon]);
  useEffect(() => {
    if (buttonsRef.current.length > 0) {
      buttonsRef.current.forEach((button) => {
        if (button) {
          button.style.height = 'auto'; // Reset to auto
        }
      });

      let maxHeight = 0;
      buttonsRef.current.forEach((button) => {
        if (button) {
          const buttonHeight = button.offsetHeight;
          if (buttonHeight > maxHeight) {
            maxHeight = buttonHeight;
          }
        }
      });

      // Step 3: Apply the max height to all buttons
      buttonsRef.current.forEach((button) => {
        if (button) {
          button.style.height = `${maxHeight}px`; // Set all buttons to the max height
        }
      });
    }
  }, [options, currentQuestionIndex]); // Run every time the options or question changes

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/quiz-results');
        console.log('Fetched Leaderboard Data:', response.data.leaderboard); // Log to verify fetched data
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);
  
  

  useEffect(() => {
    if (isQuizStarted && mode && !isAnswerSelected) {
      if (mode === 'classic' && classicTimer > 0) {
        const countdown = setTimeout(() => {
          setClassicTimer(prev => prev - 1);
          const decrementValue = Math.floor(1000 / 30);
          setRemainingPoints(prevPoints => Math.max(0, prevPoints - decrementValue));
        }, 1000);

        return () => clearTimeout(countdown);
      } else if (mode === 'advanced' && advancedTimer > 0) {
        const countdown = setTimeout(() => {
          setAdvancedTimer(prev => prev - 1);
          const decrementValue = Math.floor(1000 / 20);
          setRemainingPoints(prevPoints => Math.max(0, prevPoints - decrementValue));
        }, 1000);

        return () => clearTimeout(countdown);
      } else if ((mode === 'classic' && classicTimer === 0) || (mode === 'advanced' && advancedTimer === 0)) {
        handleAnswer(null); 
      }
    }
  }, [classicTimer, advancedTimer, isQuizStarted, mode, isAnswerSelected]);

  const fetchQuestionsFromDatabase = async (difficultyLevel: number) => {
    try {
      setLoading(true); // Start loading
      const response = await axios.get('/api/fetch-questions', {
        params: { difficulty: difficultyLevel }
      });
  
      const fetchedQuestions = response.data.questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctOption: q.correct_option,
        explanation: q.explanation,  // Single explanation from the server
        difficulty: q.difficulty,
      }));
  
      const shuffledQuestions = shuffleArray(fetchedQuestions).slice(0, 10);
      setQuestions(shuffledQuestions);
  
      if (shuffledQuestions.length > 0) {
        loadNewQuestion(0, shuffledQuestions); // Load the first question
      }
      
      setLoading(false); // End loading
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions. Please try again later.');
    }
  };
  
// const renderLoader = () => (
//   <div className="flex items-center justify-center h-full w-full">
//     <div className="loader">
//       <Loader/>
//     </div>
//   </div>
// );

const renderLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <Loader />
  </div>
);

const loadNewQuestion = (index: number, questionsList: Question[]) => {
  setTimeEnd(false)
  if (!questionsList || questionsList.length === 0) {
    console.error('No questions to load.');
    return;
  }
  
  const nextQuestion = questionsList[index];
  console.log(`Loading question ${index + 1}: Difficulty - ${nextQuestion.difficulty}`); 
  setCurrentQuestionIndex(index);
  setQuestion(nextQuestion.question);
  setOptions(nextQuestion.options);
  setSelectedOption(null);
  setExplanation('');
  setIsAnswerSelected(false);
  setFiftyFiftyOptions([]);
  setPhoneFriendResponse(null);
  // setLifelineUsed({ poll: false, phone: false, fiftyFifty: false });
  // setLifelineUsed({ poll: false, phone: false, fiftyFifty: false });
  setShowAudiencePoll(false);

  if (mode === 'classic') {
    setClassicTimer(30);
  } else if (mode === 'advanced') {
    setAdvancedTimer(20);
  }

  setRemainingPoints(1000);
  console.log(`Question ${index + 1} loaded: ${nextQuestion.question}`);
};


const handleAnswer = async (index: number | null) => {
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion || isAnswerSelected) return;

  setAnswerCorrect(false);
  setIsAnswerSelected(true);

  let isCorrect = false;
  let pointsEarned = 0;

  if (index !== null && index === currentQuestion.correctOption) {
    isCorrect = true;
    pointsEarned = remainingPoints;
    setScore((prevScore) => prevScore + pointsEarned);
    setStreak((prevStreak) => prevStreak + 1);
    setExplanation(`Correct! ${currentQuestion.explanation}`); // Show correct explanation
    setAnswerCorrect(true);
  } else {
    setExplanation(`Incorrect! ${currentQuestion.explanation}`); // Show incorrect explanation
    isCorrect = false;
  }

  setSelectedOption(index);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (isCorrect && currentQuestionIndex + 1 === questions.length) {
    const newRound = roundWon + 1;

    await wait(500);
    if (newRound === 10) {
      setRoundWon(newRound);
      setHasWonGame(true);
    } else {
      showRoundCompletion(newRound);
    }
  } else if (!isCorrect) {
    await wait(3000);
    setIsGameOver(true);
    await handleGameEnd();
  } else {
    await wait(1000);
    loadNewQuestion(currentQuestionIndex + 1, questions);
  }
};


const updateLeaderboard = async (finalScore: number, roundsWon: number) => {
  console.log("Updating leaderboard with final score:", finalScore, "Rounds won:", roundsWon);

  const newEntry = { 
    name: username,
    score: finalScore,
    round: roundsWon,
    streak: streak
  };
  
  try {
    const response = await axios.post('/api/quiz-results', newEntry);

    if (response.data.message) {
      // Display a notification if the score wasn't updated
      console.log(response.data.message); // Or use any other notification method
    } else {
      // Update the leaderboard if the score was saved/updated
      await fetchLeaderboard();
    }
  } catch (error) {
    console.error('Error saving score:', error);
  }
};


// Fetch leaderboard and update the state
const fetchLeaderboard = async () => {
  try {
    const response = await axios.get('/api/quiz-results');
    console.log('Fetched Leaderboard Data:', response.data.leaderboard);
    setLeaderboard(response.data.leaderboard); // Update the leaderboard state with the fetched data
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    setLeaderboard([]);
  }
};
const returnToMenu = () => {
  resetGame();  // Reset the game state
  handleGameEndd(false);  // Do not update leaderboard
  window.location.href = '/';  // Navigate to the main menu
};


const handleGameEnd = async () => {
  // Ensure score and roundWon are fully updated before ending the game
  await new Promise((resolve) => {
    setScore((prevScore) => {
      const updatedScore = prevScore;  // Ensure score is finalized
      resolve(updatedScore);
      return updatedScore;
    });

    setRoundWon((prevRound) => {
      const updatedRound = prevRound;  // Ensure round is finalized
      resolve(updatedRound);
      return updatedRound;
    });
  });

  // Mark game as over and update leaderboard
  setIsGameOver(true);
  await updateLeaderboard(score, roundWon);

  // Re-fetch the leaderboard to ensure the most recent scores are displayed
  try {
    const response = await axios.get('/api/quiz-results');
    setLeaderboard(response.data.leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
};
const handleGameEndd = async (shouldUpdateLeaderboard: boolean = true) => {
  // Ensure score and roundWon are fully updated before ending the game
  await new Promise((resolve) => {
    setScore((prevScore) => {
      const updatedScore = prevScore;  // Ensure score is finalized
      resolve(updatedScore);
      return updatedScore;
    });

    setRoundWon((prevRound) => {
      const updatedRound = prevRound;  // Ensure round is finalized
      resolve(updatedRound);
      return updatedRound;
    });
  });

  // Mark game as over
  setIsGameOver(true);

  // Only update the leaderboard if shouldUpdateLeaderboard is true
  if (shouldUpdateLeaderboard) {
    await updateLeaderboard(score, roundWon);
  }

  // Re-fetch the leaderboard to ensure the most recent scores are displayed
  try {
    const response = await axios.get('/api/quiz-results');
    setLeaderboard(response.data.leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
};


  
  
  // This function handles the completion of the round
  const showRoundCompletion = (newRound: number) => {
    setRoundWon(newRound);  // Incremented once
    setIsRoundCompleted(true);
    console.log(`You've completed round ${newRound}!`);
  };
  
  // Handles transitioning to the next round
  const handleNextRound = async () => {
    setIsRoundCompleted(false);
    const nextDifficulty = difficulty + 1; // Increment difficulty
  
    setDifficulty(nextDifficulty); 
    try {
      await fetchQuestionsFromDatabase(nextDifficulty);
    } catch (error) {
      console.error('Error loading next round questions:', error);
    }
  };
  
  
  const resetGame = () => {
    setIsQuizStarted(false);
    setIsGameOver(false);
    setQuestions([]);
    setExplanation('');
    setScore(0);
    setClassicTimer(30); // Reset Classic Mode timer
    setAdvancedTimer(20); // Reset Advanced Mode timer
    setRemainingPoints(1000);
    setShowScore(true);
    setIsAnswerSelected(false);
    setStreak(0);
    setLifelineUsed({ poll: false, phone: false, fiftyFifty: false });
    setFiftyFiftyOptions([]);
    setAudiencePollUsed(false);
    setAudiencePollResults([]);
    setShowAudiencePoll(false);
    setHasWonGame(false); // Ensure that the won state is reset
    setPhoneFriendResponse(null);
    setRoundWon(0);
  };
  

  // Reset the game to its initial state
  const restartGame = () => {
    setHasWonGame(false); // Ensure that the won state is reset
    setIsQuizStarted(false);
    setIsGameOver(false);
    setQuestions([]);
    setExplanation('');
    setScore(0);
    setClassicTimer(30); // Reset Classic Mode timer
    setAdvancedTimer(20); // Reset Advanced Mode timer
    setRemainingPoints(1000);
    setShowScore(true);
    setIsAnswerSelected(false);
    setStreak(0);
    setLifelineUsed({ poll: false, phone: false, fiftyFifty: false });
    setFiftyFiftyOptions([]);
    setAudiencePollUsed(false);
    setAudiencePollResults([]);
    setShowAudiencePoll(false);
    setPhoneFriendResponse(null);
    setRoundWon(0);
    if (mode === 'classic') {
      startQuiz('classic');
    } else if (mode === 'advanced') {
      startQuiz('advanced');
    }
  };
  


  
  const startQuiz = (mode: 'classic' | 'advanced') => {
    setIsQuizStarted(true);
    setIsGameOver(false);
    setScore(0);
    setRoundWon(0);
    setDifficulty(1);  
    setMode(mode);
    fetchQuestionsFromDatabase(1);  
  };
  
  const useAudiencePoll = () => {
    if (lifelineUsed.poll || !isQuizStarted || isAnswerSelected) return;
    
    const correctOptionIndex = questions[currentQuestionIndex].correctOption;
    const totalPercentage = 100;
    const correctOptionPercentage = Math.floor(Math.random() * 40) + 50; // 50% to 90%
    const remainingPercentage = totalPercentage - correctOptionPercentage;
    const otherOptionsPercentage = remainingPercentage / (options.length - 1);
  
    const pollResults = options.map((_, index) => {
      return index === correctOptionIndex ? correctOptionPercentage : Math.floor(otherOptionsPercentage);
    });
  
    setAudiencePollResults(pollResults);
    setShowAudiencePoll(true);
    setLifelineUsed((prevState) => ({ ...prevState, poll: true })); // Mark poll as used
  };
  
  const useFiftyFifty = () => {
    if (lifelineUsed.fiftyFifty || !isQuizStarted || isAnswerSelected) return;
  
    const correctOption = questions[currentQuestionIndex].correctOption;
  
    let incorrectOptions = options.map((_, index) => index).filter((index) => index !== correctOption);
    const randomIncorrectOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
  
    setFiftyFiftyOptions([correctOption, randomIncorrectOption]);
    setLifelineUsed((prevState) => ({ ...prevState, fiftyFifty: true })); // Mark 50:50 as used
  };
  
  const usePhoneFriend = () => {
    if (lifelineUsed.phone || !isQuizStarted || isAnswerSelected) return;
  
    const correctOption = questions[currentQuestionIndex].correctOption;
  
    let friendSuggestionIndex = Math.random() < 0.7 ? correctOption : Math.floor(Math.random() * options.length);
  
    const friendSuggestionLetter = String.fromCharCode(65 + friendSuggestionIndex);
    const friendSuggestionText = `Hi ${username}, I'm 75% sure the answer is ${friendSuggestionLetter}: ${options[friendSuggestionIndex]}`;

    console.log('Phone a Friend Suggestion:', friendSuggestionText);
  
    setPhoneFriendResponse(friendSuggestionText);
  
    setLifelineUsed((prevState) => ({ ...prevState, phone: true }));
  
    console.log('Lifelines Used:', lifelineUsed);
  };
  

  
  

  
  const checkSavedProgress = async (name: string) => {
    try {
      const response = await axios.get(`/api/resume-progress?name=${name}`);
      
      if (response.data.session) {
        setSavedGameExists(true); // Saved game exists
      } else {
        setSavedGameExists(false); // No saved game
      }
    } catch (error) {
      console.error('Error checking saved progress:', error);
    }
  };
  
  useEffect(() => {
    const initialize = async () => {
      await fetchUserData(); // Fetch the user's data (username)
  
      if (username) {
        await checkSavedProgress(username); // Only check progress once username is set
      }
    };
  
    initialize();
  }, [username]);
  const confirmResume = async (confirmed: boolean) => {
    if (confirmed) {
      // Restore the game state if the user confirms
      if (mode === 'classic') {
        setClassicTimer(30);
      } else if (mode === 'advanced') {
        setAdvancedTimer(20);
      }

      setIsQuizStarted(true);
      await fetchQuestionsFromDatabase(roundWon + 1); // Pass the correct difficulty/round
      await deleteSavedGame(username); // Delete the saved game once resumed
    }
    setShowResumeDialog(false); // Close the dialog
  };

  const resumeSavedProgress = async () => {
    try {
      setLoading(true); // Show loader while fetching
      const response = await axios.get(`/api/resume-progress?name=${username}`);
      setLoading(false); // Hide loader after fetching
  
      if (response.status === 200 && response.data.session) {
        const { score, streak, round, questionIndex, mode } = response.data.session;
        setScore(score);
        setStreak(streak);
        setRoundWon(round);
        setCurrentQuestionIndex(questionIndex);
        setDifficulty(difficulty);
        setMode(mode); // Restore the mode
  
        // Show the resume confirmation dialog
        setExistingRound(round);
        setShowResumeDialog(true);
      }
    } catch (error) {
      setLoading(false);
  
      if (axios.isAxiosError(error)) {
        // AxiosError type guard
        if (error.response && error.response.status === 404) {
          setShowNoSaveDialog(true);
        } else {
          console.error('Error resuming saved progress:', error.message);
        }
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };
  

  const deleteSavedGame = async (name: string) => {
    try {
      const response = await fetch('/api/delete-saved-game', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Game deleted:', result.message);
      } else {
        console.error('Error deleting game:', result.error);
      }
    } catch (error) {
      console.error('Error deleting saved game:', error);
    }
  };


  

  const checkForExistingSaveGame = async () => {
    try {
      const response = await axios.post('/api/check-savegame', { name: username });
      if (response.data.exists) {
        return { round: response.data.round }; // Actual round data from the save
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error checking for saved game:', error);
      return null;
    }
  };

  const saveGame = async (overwrite: boolean) => {
    try {
      await axios.post('/api/savegame', {
        round: difficulty,
        name: username,
        score: score,
        streak: streak,
        mode: mode, // Save the mode (either 'classic' or 'advanced')
        overwrite: overwrite,
      });
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };
  const updateLeaderboardUsername = async (newUsername: string) => {
    try {
      setLoading(true); // Show loader during the update
      const response = await axios.post('/api/update-leaderboard-username', {
        oldUsername: username,  // Current username
        newUsername: newUsername,  // New username entered by the user
      });
  
      if (response.status === 200) {
        setUsername(newUsername); // Update local username
        alert("Leaderboard updated successfully!");
      } else {
        alert("Failed to update leaderboard. Please try again.");
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      alert('An error occurred while updating the leaderboard.');
    } finally {
      setLoading(false); // Stop loader
    }
  };
  
  /**
   * Handle saving progress logic
   */
  const handleSaveProgress = async () => {
    setShowSavingDialog(true); // Show the saving dialog
    const existingSave = await checkForExistingSaveGame(); // Check if a save exists
    setShowSavingDialog(false); // Hide the saving dialog once the check is done

    if (existingSave) {
      setExistingRound(existingSave.round); // Set the existing round for the dialog
      setShowOverwriteDialog(true); // Show the overwrite confirmation dialog
    } else {
      // No existing save, proceed to save
      setShowSavingDialog(true); // Show saving dialog again
      await saveGame(false); // Save without overwriting
      setShowSavingDialog(false); // Hide saving dialog after save is done
      setShowSaveSuccessDialog(true); // Show success dialog
    }
  };

  const confirmOverwrite = async (confirmed: boolean) => {
    setShowOverwriteDialog(false); // Hide the overwrite dialog
    if (confirmed) {
      setShowSavingDialog(true); // Show saving dialog again
      await saveGame(true); // Save with overwrite
      setShowSavingDialog(false); // Hide saving dialog after save
      setShowSaveSuccessDialog(true); // Show success dialog
    }
  };
  
  if (isRoundCompleted) {

    // if (roundWon === 10) {
    //   return (
    //     <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] overflow-x-hidden">  {/* Prevent horizontal scrolling */}
    //       <Card className="w-full max-w-md sm:max-w-2xl p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center">
    //         <div className="text-3xl font-bold text-green-600 mb-4">Champion!</div>
    //         <p className="text-lg text-gray-800 mb-6">You have successfully completed all 10 rounds!</p>
    //         <Button onClick={resetGame} className="bg-[#709D51] text-white py-2 px-6 text-lg font-bold">
    //           Play Again
    //         </Button>
    //       </Card>
    //     </div>
    //   );
    // }
    // else
    // {
      
      return (
        
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5]">
        {/* Confetti Background */}
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        
        {/* Card Container */}
        <Card className="w-full max-w-2xl p-4 md:p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-4">Congratulations!</h1>
          <p className="text-md md:text-lg text-gray-800 mb-6">You've completed round {roundWon}!</p>
          <p className="text-sm md:text-md text-gray-800 mb-6">
            Get ready for the next round with increased difficulty.
          </p>
  
          {/* Buttons */}
          <div className="flex flex-col md:flex-col justify-center space-y-2 md:space-x-4 mt-6">
            
          <div className='flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4'>
              {/* Save Progress Button */}
              <Button
              onClick={handleSaveProgress}
              className="w-full md:w-auto bg-[#4C6A36] text-white py-2 px-8 text-lg font-bold rounded-lg hover:bg-[#2C4423]"
            >
              Save Progress
            </Button>
  
            {/* Next Round Button */}
            <Button
              onClick={handleNextRound}
              className="w-full md:w-auto bg-[#709D51] text-white py-2 px-8 text-lg font-bold rounded-lg hover:bg-[#50822D]"
            >
              Next Round
            </Button>
          </div>
          <div>
          <Button
              onClick={returnToMenu}
              className="w-full md:w-auto bg-black text-white py-2 px-8 text-lg font-bold rounded-lg hover:bg-[#50822D]"
            >
              Exit to Menu
            </Button>
          </div>
          </div>
  
          {/* Overwrite Confirmation Dialog */}
          <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Overwrite Save Game?</DialogTitle>
                <DialogDescription>
                  A saved game of round {existingRound} was found. Are you sure you want to overwrite?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => confirmOverwrite(true)}
                  className="bg-green-500 text-white"
                >
                  Yes, Overwrite
                </Button>
                <Button
                  onClick={() => setShowOverwriteDialog(false)}
                  className="bg-red-500 text-white"
                >
                  No, Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
  
          {/* Saving Progress Dialog */}
          <Dialog open={showSavingDialog} onOpenChange={setShowSavingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Saving Game</DialogTitle>
                <DialogDescription>
                  Saving your progress, please wait...
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
  
          {/* Save Success Dialog */}
          <Dialog open={showSaveSuccessDialog} onOpenChange={setShowSaveSuccessDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Game Saved Successfully!</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => setShowSaveSuccessDialog(false)}
                  className="bg-green-500 text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
}

const renderLeaderboard = () => {
  // Since each user will have only one entry, we can directly find the user's entry without sorting/filtering multiple
  const userEntry = leaderboard.find((entry) => entry.name === username);
  
  let leaderboardToDisplay = showAllScores ? leaderboard : leaderboard.slice(0, 5);

  // Add the current user's entry to the displayed leaderboard if it's not already in the top 5
  if (!showAllScores && userEntry && !leaderboardToDisplay.includes(userEntry)) {
    leaderboardToDisplay.push(userEntry);
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 mb-10">
      <h2 className="text-[#191919] text-center text-[28px] sm:text-[24px] font-roboto font-bold mb-4">
        Leaderboard
      </h2>

      {leaderboard.length > 0 ? (
        <div className="overflow-x-auto sm:overflow-visible whitespace-nowrap sm:whitespace-normal pb-4 scroll-touch">
          {leaderboardToDisplay.map((entry, index) => {
            const actualRank = leaderboard.indexOf(entry) + 1; // The rank based on index

            return (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg mb-2 min-w-[150%] sm:min-w-full 
                  ${userEntry === entry ? 'bg-[#709D50] text-white' : 'bg-[#F9FAFB]'}`}
              >
                <div className="flex items-center w-1/3">
                  <span
                    className={`font-semibold text-sm md:text-lg ${userEntry === entry ? 'text-white' : 'text-gray-700'}`}
                  >
                    #{actualRank}
                  </span>

                  <div className="hidden sm:flex h-10 w-10 bg-green-300 rounded-full items-center justify-center ml-3">
                    <img
                      src={`https://avatar.oxro.io/avatar.svg?name=${entry.name.charAt(0)}&length=1`}
                      alt="avatar"
                      className="h-full w-full rounded-full"
                    />
                  </div>

                  <span className={`ml-3 font-semibold text-sm md:text-lg ${userEntry === entry ? 'text-white' : 'text-gray-700'}`}>
                    {entry.name}
                  </span>
                </div>

                <div className="text-center w-1/3">
                  <span className={`font-semibold  text-sm md:text-lg ${userEntry === entry ? 'text-white' : 'text-gray-700'}`}>
                    {entry.score} points
                  </span>
                </div>

                <div className="text-right w-1/3">
                  <span className={`font-semibold text-sm md:text-lg ${userEntry === entry ? 'text-white' : 'text-gray-700'}`}>
                    {entry.round > 0 ? `Round ${entry.round}` : '-'}
                  </span>
                </div>
              </div>
            );
          })}

          {!showAllScores && leaderboard.length > 5 && (
            <div className=' text-right'>

            <button
              onClick={() => setShowAllScores(true)}
              className="mt-4 text-green-600 text-lg underline"
              >
              View All Scores &rarr;
            </button>
              </div>
          )}

          {showAllScores && (
            <button
              onClick={() => setShowAllScores(false)}
              className="mt-4 text-green-600 text-lg underline "
            >
              Hide All Scores &larr;
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No scores yet.</p>
      )}
    </div>
  );
};


  
if (!isQuizStarted) {
  return (
    <div
    className="min-h-screen flex flex-col justify-start items-center"
    style={{ paddingTop: '5px', overflowX: 'hidden' }} // Adjusted padding for mobile
  >
    <div
      className="w-full py-10 text-center flex flex-col items-center justify-center relative rounded-lg"
      style={{
        background: 'linear-gradient(115deg, #FCFEF2 10%, #91BF70 90%)',
        borderRadius: '20px',  // Adjust border radius for mobile
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden rounded-b-[20px]">
        <img
          src="Group.png"
          alt="wave background"
          className="w-full h-full object-cover"
        />
      </div>
  
      <div className="relative z-10 max-w-2xl mx-auto px-2 sm:px-4" style={{ overflowX: 'hidden' }}>
        <h1 className="text-[#191919] text-[22px] sm:text-[28px] font-roboto font-bold mb-2 leading-none">
          Therapy Trainings™ Diagnostic Challenge
        </h1>
  
        <p className="text-[#191919] text-[14px] sm:text-[16px] font-roboto mb-4">
          Improve your skills to stay on the leaderboard
        </p>
  
        {username && (
          <h1 className="text-[#191919] text-[22px] sm:text-[28px] font-roboto font-bold mb-2 leading-none">
            Welcome {username}!
          </h1>
        )}
  
        <div className="flex flex-col space-y-3 max-w-xs mx-auto">
          <Button
            onClick={() => startQuiz('classic')}
            className="w-full bg-[#709D50] text-[#FFFFFF] py-2 text-[12px] sm:text-[14px] font-roboto hover:bg-[#4C6A36] transition duration-150"
          >
            Classic Mode (30s Timer)
          </Button>
  
          <Button
            onClick={() => startQuiz('advanced')}
            className="w-full bg-[#709D50] text-[#FFFFFF] py-2 text-[12px] sm:text-[14px] font-roboto hover:bg-[#4C6A36] transition duration-150"
          >
            Advanced Mode (20s Timer)
          </Button>
  
          <Button
            onClick={resumeSavedProgress}
            className="w-full bg-[#000000] text-white py-2 text-[12px] sm:text-[14px] hover:bg-opacity-90 transition duration-150"
          >
            Resume Progress
          </Button>
  
          <div className="">
  <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
    <DialogContent className="px-4 sm:px-8"> {/* Added padding to the dialog content */}
      <DialogHeader>
        <DialogTitle>Resume Saved Game?</DialogTitle>
        <DialogDescription>
          A saved game of round {existingRound} was found. Do you want to resume your game?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div className="flex row-auto space-x-2">
          <Button
            onClick={() => confirmResume(true)}
            className="bg-green-500 text-white py-1 px-3 text-xs sm:text-sm font-bold rounded-md hover:bg-green-600 w-full sm:w-auto"
          >
            Yes, Resume
          </Button>
          <Button
            onClick={() => setShowResumeDialog(false)}
            className="bg-red-500 text-white py-1 px-3 text-xs sm:text-sm font-bold rounded-md hover:bg-red-600 w-full sm:w-auto"
          >
            No, Cancel
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog open={showNoSaveDialog} onOpenChange={setShowNoSaveDialog}>
    <DialogContent className=" sm:px-8"> 
      <DialogHeader>
        <DialogTitle>No Saved Game</DialogTitle>
        <DialogDescription>
          No saved game was found for this user. Please start a new game.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          onClick={() => setShowNoSaveDialog(false)}
          className="bg-green-500 text-white"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>

        </div>
      </div>
    </div>
  
    <div id="leaderboard-section" className="w-full px-2 mt-5" style={{ overflowX: 'hidden' }}>
      {renderLeaderboard()}
  
      <div className="w-full bg-[#709D50] text-white py-4 text-center mt-6" style={{ overflowX: 'hidden' }}>
        <p className="text-sm">© 2024 Therapy Trainings. All rights reserved.</p>
      </div>
    </div>
  </div>
  );
}

if (hasWonGame) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] overflow-x-hidden">  {/* Prevent horizontal scrolling */}
      <Card className="w-full max-w-md sm:max-w-2xl p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center"> {/* Added max-w-md for mobile */}
        
        {/* Game Over, Explanation, and Buttons */}
        {/* <div className="text-2xl font-bold text-gray-800 mb-4">Game Over</div> */}
        <p className="text-gray-800 text-lg mb-4 font-bold">
          Congratulations , you have completed all 10 rounds.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 mb-4">
          <Button
            onClick={resetGame}
            className="bg-black text-white py-2 px-6 text-lg font-bold hover:bg-opacity-90 transition duration-150"
          >
            Main Menu
          </Button>
          <Button
            onClick={restartGame}
            className="bg-[#709D51] text-white py-2 px-6 text-lg font-bold hover:bg-[#50822D] transition duration-150"
          >
            Play Again
          </Button>
        </div>
  
        {/* Score and Leaderboard Section */}
        <div className="flex flex-col sm:flex-row justify-around mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col items-center">
            <div className="text-gray-500 text-lg font-bold mb-2">Your Score</div>
            <div className="flex items-center justify-center bg-[#709D51] text-white rounded-lg px-6 py-3">
              <div className="text-5xl font-bold">
                {score}
              </div>
              <div className="text-xl ml-2">Points</div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-gray-500 text-lg font-bold mb-2">Current Leader</div>
            <div className="flex items-center justify-center bg-[#709D51] text-white rounded-lg px-6 py-3">
              <div className="text-5xl font-bold">
                {Math.max(...leaderboard.map(entry => entry.score))}
              </div>
              <div className="text-xl ml-2">Points</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {renderLeaderboard()}

      </Card>
    </div>
  );
}  

if (isGameOver) {


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] overflow-x-hidden">  {/* Prevent horizontal scrolling */}
      <Card className="w-full max-w-md sm:max-w-2xl p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center mt-4"> {/* Added max-w-md for mobile */}
        
        {/* Game Over, Explanation, and Buttons */}
        <div className="text-2xl font-bold text-gray-800 mb-4">Game Over</div>
        <p className="text-red-500 text-lg mb-4 font-bold">
          {explanation}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 mb-4">
          <Button
            onClick={resetGame}
            className="bg-black text-white py-2 px-6 text-lg font-bold hover:bg-opacity-90 transition duration-150"
          >
            Main Menu
          </Button>
          <Button
            onClick={restartGame}
            className="bg-[#709D51] text-white py-2 px-6 text-lg font-bold hover:bg-[#50822D] transition duration-150"
          >
            Play Again
          </Button>
        </div>
  
        {/* Score and Leaderboard Section */}
        <div className="flex flex-col sm:flex-row justify-around mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col items-center">
            <div className="text-gray-500 text-lg font-bold mb-2">Your Score</div>
            <div className="flex items-center justify-center bg-[#709D51] text-white rounded-lg px-6 py-3">
              <div className="text-5xl font-bold">
                {score}
              </div>
              <div className="text-xl ml-2">Points</div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-gray-500 text-lg font-bold mb-2">Current Leader</div>
            <div className="flex items-center justify-center bg-[#709D51] text-white rounded-lg px-6 py-3">
              <div className="text-5xl font-bold">
                {Math.max(...leaderboard.map(entry => entry.score))}
              </div>
              <div className="text-xl ml-2">Points</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {renderLeaderboard()}

      </Card>
    </div>
  );
}


return (

  <div className="flex flex-col items-center justify-start" style={{ minHeight: '90vh', paddingTop: '10px' }}>
    {/* Conditionally render the loader or the game content */}

    {loading ? (
      renderLoader() // Show the loader when loading is true
    ) : (
      <>
        <div className="w-full max-w-4xl flex items-center justify-between mb-2"> {/* Increase max-w */}
          <div className="text-green-600 text-2xl font-bold">{remainingPoints} Points</div>
          <div className="flex items-center space-x-2 text-gray-500">
            <img src="timer.png" alt="Timer Icon" className="h-4 w-4 text-gray-500" />
            <span className="ml-1 text-sm">
              {mode === 'classic' ? `${classicTimer}s` : `${advancedTimer}s`}
            </span>
          </div>
        </div>

        <div className="w-full max-w-4xl mb-6">
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{
                width: `${mode === 'classic' ? (classicTimer / 30) * 100 : (advancedTimer / 20) * 100}%`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500">
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl p-6 bg-[#FCFEF2] rounded-lg shadow-lg">
          <div className="w-full text-left mb-6">
            <h1 className="text-2xl text-center font-semibold text-[#2A4728]">{question}</h1>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-6 w-full mb-8">
  {options.map((option, index) => {
    const isSelected = selectedOption === index;
    const isCorrect = index === questions[currentQuestionIndex].correctOption;
    const isIncorrect = selectedOption !== null && selectedOption === index && !isCorrect;
    const isDisabled = isAnswerSelected || (fiftyFiftyOptions.length > 0 && !fiftyFiftyOptions.includes(index));

    return (
      <Button
        key={index}
        ref={(el) => {
          buttonsRef.current[index] = el;
        }}
        onClick={() => handleAnswer(index)}
        disabled={isDisabled}
        className={`w-full py-4 px-6 text-lg rounded-full border border-gray-300 shadow-md flex items-center justify-center
          ${isSelected && isCorrect
            ? 'bg-green-500 text-white' // Green for correct answer
            : isSelected && isIncorrect
            ? 'bg-red-500 text-white'   // Red for incorrect answer
            : isDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' // Disabled state
            : 'bg-white text-gray-800 hover:bg-blue-100'    // Default state
          }`}
        style={{
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          minHeight: '60px',
        }}>
        {String.fromCharCode(65 + index)}. {option}
      </Button>
    );
  })}
</div>


          {/* Explanation Section */}
{explanation && selectedOption !== null && (
  <div className={`${answerCorrect ? 'text-black' : 'text-red-500'} text-xl mt-4 font-bold`}>
    {!TimeEnd ? explanation : "Time is up! No answer selected."}
  </div>
)}


          {/* Streak Section */}
          <div className="flex items-center justify-between w-full">
            <p className="text-lg text-gray-600">Question {currentQuestionIndex + 1}/{questions.length}</p>
            <div className="text-green-600 text-lg font-semibold">⭐ Streak: {streak}</div>
          </div>
        </div>

        {/* Lifelines */}
        <div className="flex justify-center space-x-10 mt-6">
          <button  onClick={useAudiencePoll} disabled={lifelineUsed.poll}>
            <img src={lifelineUsed.poll ? "disabled_aud.png" : "poll.png"} alt="Audience Poll"/>
          </button>
          <button className="select-none pointer-events-none" onClick={usePhoneFriend} disabled={lifelineUsed.phone}>
            <img src={lifelineUsed.phone ? "disabled_phone.png" : "phonee.png"} alt="Phone a Friend" />
          </button>
          <button onClick={useFiftyFifty} disabled={lifelineUsed.fiftyFifty}>
            <img className="select-none pointer-events-none" src={lifelineUsed.fiftyFifty ? "disabled_50.png" : "fifty.png"} alt="50:50 Lifeline" 
                  draggable="false"
                  />
          </button>
        </div>

        {/* Phone a Friend Response */}
        {phoneFriendResponse && (
          <div className="mt-6 flex flex-row justify-between items-center space-y-4">
            <div style={{ flex: 1 }}>
              <div
                style={{
                  backgroundColor: '#dcf8c6',
                  color: '#303030',
                  padding: '10px 15px',
                  maxWidth: '80%',
                  borderRadius: '10px',
                  position: 'relative',
                  marginBottom: '15px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}>
                <p>Hi Sigmund, can you help me with this question?</p>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#303030',
                  padding: '10px 15px',
                  maxWidth: '80%',
                  borderRadius: '10px',
                  position: 'relative',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}>
                <p>{phoneFriendResponse}</p>
              </div>
            </div>
            <img src="/robot-icon.png" alt="Robot" style={{ height: '150px', width: '150px', borderRadius: '50%' }} />
          </div>
        )}

        {/* Audience Poll Display */}
        {showAudiencePoll && (
          <div className="mt-6 w-full max-w-4xl">
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <div className="w-8 h-8 text-gray-800 font-semibold mr-2">{String.fromCharCode(65 + index)}</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div style={{ width: `${audiencePollResults[index]}%` }} className="h-full bg-green-500"></div>
                </div>
                <div className="ml-2 text-gray-800 font-semibold">{audiencePollResults[index]}%</div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);
  
}