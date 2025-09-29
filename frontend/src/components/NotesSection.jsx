// src/components/NotesSection.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/api';
import BackToLearnButton from './BackToLearnButton'; // ✅ UPDATED

const NotesSection = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await API.get('/media/notes');
                setNotes(res.data);
            } catch (err) {
                console.error('Error fetching notes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    if (loading) return <p className="loading-message">Loading notes...</p>;

    return (
        <motion.div 
            className="media-section-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="section-header-with-button">
                <h3>Notes 📝</h3>
                <BackToLearnButton /> {/* ✅ UPDATED */}
            </div>
            <AnimatePresence>
                {notes.length === 0 ? (
                    <p className="no-content-message">No notes available yet.</p>
                ) : (
                    <motion.div className="media-grid">
                        {notes.map((note) => (
                            <motion.div 
                                key={note._id} 
                                className="media-card note-card"
                                variants={itemVariants}
                                whileHover={{ scale: 1.03 }}
                            >
                                <h4>{note.title}</h4>
                                <p>{note.content}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default NotesSection;