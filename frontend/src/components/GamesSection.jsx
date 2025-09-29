import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const GamesSection = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await API.get('/games');
        setGames(res.data);
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) return <p className="loading-message">Loading games...</p>;

  const handleGameClick = (game) => {
    // ✅ FIX: This now uses the unique ID from the database to navigate
    navigate(`/learn/games/${game._id}`);
  };

  return (
    <motion.div 
      className="media-section-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3>Interactive Games 🕹️</h3>
      <AnimatePresence>
        {games.length === 0 ? (
          <p className="no-content-message">No games available yet. Check back soon!</p>
        ) : (
          <motion.div className="media-grid">
            {games.map((game) => (
              <motion.div 
                key={game._id} 
                className="media-card game-card"
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleGameClick(game)}
              >
                <h4>{game.title}</h4>
                <p>{game.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GamesSection;