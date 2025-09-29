// src/pages/LessonViewer.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

export default function LessonViewer() {
    const { id } = useParams();
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Quiz game state
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/learn/lessons/${id}`);
                setLesson(res.data.lesson);
                setQuiz(res.data.quiz);
            } catch (err) {
                setError('Failed to load lesson content.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessonData();
    }, [id]);

    const handleNextQuestion = () => {
        setUserAnswers([...userAnswers, selectedAnswer]);
        setSelectedAnswer(null);
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // End of quiz, prepare for submission
            handleSubmitQuiz([...userAnswers, selectedAnswer]);
        }
    };

    const handleSubmitQuiz = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const res = await API.post(`/learn/quizzes/${quiz._id}/submit`, { answers: finalAnswers });
            setQuizResult(res.data);
        } catch (err) {
            console.error("Quiz submission failed:", err);
            setQuizResult({ message: "An error occurred while submitting.", pointsAwarded: 0 });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500 bg-gray-50 h-screen">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{lesson?.title}</h1>
                    <Link to="/learn/lessons" className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm flex-shrink-0">
                        ← All Lessons
                    </Link>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {!quizStarted ? (
                        <motion.div
                            key="lesson"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="prose max-w-none bg-white p-6 rounded-2xl shadow-lg mb-6" dangerouslySetInnerHTML={{ __html: lesson?.content.replace(/\n/g, '<br />') }} />
                            {quiz && (
                                <button
                                    onClick={() => setQuizStarted(true)}
                                    className="w-full mt-4 px-6 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-7-700 transition-transform transform hover:scale-105"
                                >
                                    Start the Quiz!
                                </button>
                            )}
                        </motion.div>
                    ) : !quizResult ? (
                        <motion.div
                            key="quiz"
                            className="bg-white p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Quiz Time!</h2>
                                <span className="font-mono text-lg bg-gray-200 px-3 py-1 rounded-md">{currentQuestionIndex + 1} / {quiz.questions.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                                <motion.div 
                                    className="bg-green-500 h-2.5 rounded-full" 
                                    initial={{ width: `${(currentQuestionIndex / quiz.questions.length) * 100}%`}}
                                    animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`}}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="font-semibold text-xl mb-4">{quiz.questions[currentQuestionIndex].questionText}</p>
                                    <div className="space-y-3">
                                        {quiz.questions[currentQuestionIndex].options.map(opt => (
                                            <motion.button
                                                key={opt._id}
                                                onClick={() => setSelectedAnswer(opt.optionText)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors text-gray-800 ${selectedAnswer === opt.optionText ? 'bg-green-200 border-green-500' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {opt.optionText}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <button
                                onClick={handleNextQuestion}
                                disabled={!selectedAnswer}
                                className="w-full mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </motion.div>
                    ) : (
                         <motion.div
                            key="result"
                            className={`text-center p-8 rounded-2xl shadow-lg ${quizResult.pointsAwarded > 0 ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white' : 'bg-gradient-to-br from-red-400 to-orange-500 text-white'}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 120 }}
                        >
                            <h3 className="text-4xl font-bold">{quizResult.pointsAwarded > 0 ? '🎉 Well Done! 🎉' : 'Keep Trying!'}</h3>
                            <p className="mt-3 text-lg">{quizResult.message}</p>
                            {quizResult.pointsAwarded > 0 && (
                                <p className="font-bold text-2xl mt-2">+ {quizResult.pointsAwarded} Eco Points!</p>
                            )}
                            <Link to="/learn/lessons" className="mt-6 inline-block px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
                                Back to Lessons
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}