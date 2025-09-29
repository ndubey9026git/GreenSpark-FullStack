import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

// --- Configuration and Constants ---
const INITIAL_HEALTH = 75;
const GAME_DURATION = 60; // seconds
const ACTION_POINTS = {
  PlantTrees: 1,
  PurifyWater: 2,
  ReducePollution: 5,
};

const EcosystemSimulator = ({ gameId }) => {
  const [gameStatus, setGameStatus] = useState('ready'); // ready, playing, finished
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(GAME_DURATION);
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [pollution, setPollution] = useState(10);
  const navigate = useNavigate();

  // --- Game Loop (Runs every second) ---
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const gameInterval = setInterval(() => {
      // 1. Decrease Time
      setTime(prevTime => prevTime - 1);

      // 2. Apply Pollution/Consumption Effects
      const pollutionEffect = pollution * 0.1;
      setHealth(prevHealth => Math.max(0, prevHealth - pollutionEffect));

      // 3. Auto-Increase Pollution (Slower if health is high)
      const pollutionIncrease = 1 + (100 - health) * 0.05;
      setPollution(prevPollution => Math.min(100, prevPollution + pollutionIncrease));

      // 4. Update Score (based on sustained health)
      setScore(prevScore => prevScore + Math.floor(health / 10));
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [gameStatus, pollution, health]);

  // --- Game State Handlers ---
  useEffect(() => {
    if (time <= 0 || health <= 0) {
      if (gameStatus === 'playing') {
        setGameStatus('finished');
      }
    }
  }, [time, health, gameStatus]);

  const startGame = () => {
    setScore(0);
    setTime(GAME_DURATION);
    setHealth(INITIAL_HEALTH);
    setPollution(10);
    setGameStatus('playing');
  };

  const handleAction = useCallback((action) => {
    if (gameStatus !== 'playing') return;

    switch (action) {
      case 'PlantTrees':
        // Reduces pollution and boosts health temporarily
        setPollution(prev => Math.max(0, prev - ACTION_POINTS.PlantTrees));
        setHealth(prev => Math.min(100, prev + 2)); // Minor health boost
        break;
      case 'PurifyWater':
        // Significant reduction in pollution
        setPollution(prev => Math.max(0, prev - ACTION_POINTS.PurifyWater * 2));
        break;
      case 'Educate':
        // Trades health for long-term consumption control (slower pollution increase)
        setPollution(prev => Math.min(100, prev + 1)); // Small immediate penalty
        setHealth(prev => Math.max(0, prev - 5)); // Higher health cost
        break;
      default:
        break;
    }
    setScore(prevScore => prevScore + 5); // Reward action taken
  }, [gameStatus]);

  const handleSubmitScore = async () => {
    try {
      // Final score calculation: base score + bonus for time left * 10
      const finalScore = score + (time * 10);
      const res = await API.post(`/games/${gameId}/submit-score`, { score: finalScore });
      alert(res.data.msg);
      navigate('/learn/lessons');
    } catch (err) {
      console.error("Error submitting score:", err);
      alert('Failed to submit score. Please try again.');
    }
  };

  const statusColor = health > 75 ? 'bg-green-500' : health > 50 ? 'bg-yellow-500' : health > 25 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-full flex flex-col items-center w-full">
      <motion.div 
        className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Ecosystem Balance Simulator</h1>
          <motion.button 
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md"
            onClick={() => navigate('/learn/lessons')}
            whileHover={{ scale: 1.05 }}
          >
            Back to Learn
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <p className="text-sm font-medium text-indigo-700">Time</p>
            <p className="text-2xl font-extrabold text-indigo-900">{time}s</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-sm font-medium text-green-700">Score</p>
            <p className="text-2xl font-extrabold text-green-900">{score}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-sm font-medium text-red-700">Pollution</p>
            <p className="text-2xl font-extrabold text-red-900">{Math.round(pollution)}%</p>
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-8">
          <p className="text-lg font-semibold mb-2">Ecosystem Health: {Math.round(health)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${statusColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Game Area and Actions */}
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold mb-4">Choose an Action:</p>
          
          <div className="grid grid-cols-3 gap-6 w-full max-w-xl">
            {['PlantTrees', 'PurifyWater', 'Educate'].map((action) => (
              <motion.button
                key={action}
                onClick={() => handleAction(action)}
                className={`flex flex-col items-center p-4 rounded-xl shadow-lg transition duration-200 ${
                    gameStatus === 'playing' ? 'bg-white hover:bg-gray-100' : 'bg-gray-200 cursor-not-allowed opacity-70'
                }`}
                disabled={gameStatus !== 'playing'}
                whileHover={gameStatus === 'playing' ? { scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } : {}}
              >
                <span className="text-4xl mb-2">
                  {action === 'PlantTrees' ? '🌳' : action === 'PurifyWater' ? '💧' : '🧑‍🏫'}
                </span>
                <span className="text-sm font-semibold">{action}</span>
                <span className="text-xs text-green-600 mt-1">+{ACTION_POINTS[action]} Action Points</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {(gameStatus === 'ready' || gameStatus === 'finished') && (
            <motion.div 
              className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                {gameStatus === 'ready' ? 'Ready to Start?' : health <= 0 ? 'ECOSYSTEM COLLAPSE' : 'SUCCESS!'}
              </h2>
              <p className="text-xl text-white mb-6">
                Final Score: <span className="font-extrabold">{score + (time * 10)}</span>
              </p>
              
              <motion.button 
                className="px-6 py-3 font-bold text-white rounded-full mb-3"
                onClick={gameStatus === 'ready' ? startGame : handleSubmitScore}
                style={{ backgroundColor: gameStatus === 'ready' ? '#3498db' : '#2ecc71' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {gameStatus === 'ready' ? 'START SIMULATION' : 'SUBMIT SCORE & CONTINUE'}
              </motion.button>
              
              {gameStatus === 'finished' && (
                <motion.button 
                  className="px-6 py-3 font-bold text-white rounded-full bg-red-500"
                  onClick={startGame}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Play Again
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EcosystemSimulator;
