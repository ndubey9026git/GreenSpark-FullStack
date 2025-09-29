// src/components/VideosSection.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // ✅ ADDED: Import Link
import API from '../api/api';
import BackToLearnButton from './BackToLearnButton';

const VideosSection = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await API.get('/media/videos');
                setVideos(res.data);
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (loading) return <p className="loading-message">Loading videos...</p>;

    return (
        <motion.div 
            className="media-section-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="section-header-with-button">
                <h3>Video Lectures 🎬</h3>
                <BackToLearnButton />
            </div>
            <AnimatePresence>
                {videos.length === 0 ? (
                    <p className="no-content-message">No videos available yet.</p>
                ) : (
                    <motion.div className="media-grid">
                        {videos.map((video) => (
                            // ✅ MODIFIED: Use Link to navigate to the new video player page
                            <motion.li 
                                key={video._id} 
                                className="media-card video-card"
                                variants={itemVariants}
                                whileHover={{ scale: 1.03 }}
                            >
                                <Link to={`/learn/video/${video._id}`} className="media-link-card">
                                  <h4>{video.title}</h4>
                                  <p>{video.description}</p>
                                </Link>
                            </motion.li>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VideosSection;