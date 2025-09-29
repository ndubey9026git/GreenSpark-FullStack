// src/components/BackToLearnButton.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const BackToLearnButton = () => {
    const navigate = useNavigate();

    return (
        <motion.button 
            className="back-to-learn-button" 
            onClick={() => navigate('/learn/lessons')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            ← Back to Learn
        </motion.button>
    );
};

export default BackToLearnButton;