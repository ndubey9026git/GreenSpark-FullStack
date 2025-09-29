// src/pages/Leaderboard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { motion } from "framer-motion";

// Simple Trophy Icon that changes color based on rank
const TrophyIcon = ({ rank }) => {
  const color =
    rank === 1 ? "text-yellow-400" :
    rank === 2 ? "text-gray-400" :
    rank === 3 ? "text-yellow-600" : "text-gray-300";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-3-5v5m-3-2v2m-2 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await API.get("/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        setError("Could not fetch leaderboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Animation variants for the list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 sm:p-8">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-green-800">🏆 Leaderboard</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-white text-green-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {leaders.map((leader, index) => (
              <motion.li
                key={leader._id || index}
                variants={itemVariants}
                className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-lime-50 transition"
              >
                <div className="w-12 text-2xl font-bold text-gray-400 text-center">{index + 1}</div>
                <div className="w-16 flex justify-center">
                   <TrophyIcon rank={index + 1} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800">{leader.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{leader.role}</p>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {leader.ecoPoints} <span className="text-sm font-normal">pts</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </div>
  );
}