// src/components/RecycleRush.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './RecycleRush.css';

const WASTE_ITEMS = [
  { name: 'Plastic Bottle', category: 'Recycle' },
  { name: 'Banana Peel', category: 'Compost' },
  { name: 'Glass Jar', category: 'Recycle' },
  { name: 'Paper Towel', category: 'Compost' },
  { name: 'Old Newspaper', category: 'Recycle' },
  { name: 'Apple Core', category: 'Compost' },
  { name: 'Broken Plate', category: 'Trash' },
  { name: 'Plastic Bag', category: 'Trash' },
  { name: 'Aluminum Can', category: 'Recycle' },
  { name: 'Egg Shells', category: 'Compost' },
];

const BINS = ['Recycle', 'Compost', 'Trash'];

const RecycleRush = ({ gameId }) => { 
  const [gameStatus, setGameStatus] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWaste, setCurrentWaste] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      setGameStatus('finished');
    }
    return () => clearTimeout(timer);
  }, [gameStatus, timeLeft]);

  // ✅ FIX: Spawn a new item immediately after one is sorted
  useEffect(() => {
    if (gameStatus === 'playing') {
      const spawner = setInterval(() => {
        const randomItem = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
        setCurrentWaste(randomItem);
      }, 1000); // Spawns a new item every 1 second
      return () => clearInterval(spawner);
    }
  }, [gameStatus]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStatus('playing');
    setCurrentWaste(null);
  };

  const handleDrop = (binCategory) => {
    if (gameStatus !== 'playing' || !currentWaste) return;

    if (binCategory === currentWaste.category) {
      setScore(score + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    
    setCurrentWaste(null);
    setTimeout(() => setFeedback(null), 800);
  };

  const handleSubmitScore = async () => {
    try {
      const res = await API.post(`/games/${gameId}/submit-score`, { score });
      alert(res.data.msg);
      navigate('/learn/lessons');
    } catch (err) {
      console.error("Error submitting score:", err);
      alert('Failed to submit score. Please try again.');
    }
  };

  const gameVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div className="game-container" initial="hidden" animate="visible" variants={gameVariants}>
      <AnimatePresence>
        {gameStatus === 'ready' && (
          <motion.div key="ready-overlay" className="game-overlay" exit={{ opacity: 0 }}>
            <h2 className="game-title">Recycle Rush</h2>
            <p>Sort the waste into the correct bins before time runs out!</p>
            <motion.button className="game-button primary" onClick={startGame} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              Start Game
            </motion.button>
          </motion.div>
        )}

        {gameStatus === 'finished' && (
          <motion.div key="finished-overlay" className="game-overlay" exit={{ opacity: 0 }}>
            <h2 className="game-title">Game Over!</h2>
            <p className="final-score">Your final score: {score}</p>
            <motion.button className="game-button primary" onClick={handleSubmitScore} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              Submit Score
            </motion.button>
            <motion.button className="game-button secondary" onClick={startGame} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game-header">
        <div className="score-board">Score: {score}</div>
        <div className="timer">Time Left: {timeLeft}s</div>
      </div>
      
      <div className="game-area">
        <AnimatePresence>
          {currentWaste && (
            <motion.div
              key={currentWaste.name}
              className={`waste-item ${feedback}`}
              initial={{ y: -100, x: '-50%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentWaste.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bins-container">
        {BINS.map(bin => (
          <motion.div
            key={bin}
            className={`bin ${bin.toLowerCase()}`}
            onClick={() => handleDrop(bin)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {bin}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecycleRush;