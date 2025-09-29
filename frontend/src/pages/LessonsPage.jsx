// src/pages/LessonsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/api';
import './LessonsPage.css';

// New Media Components
import VideosSection from '../components/VideosSection';
import BooksSection from '../components/BooksSection';
import NotesSection from '../components/NotesSection';
import MediaUploadForm from '../components/MediaUploadForm';
import GamesSection from '../components/GamesSection'; 

const LessonsPage = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('lessons'); // Default tab
    const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'teacher' || role === 'admin') {
            setIsTeacherOrAdmin(true);
        }
    }, []);

    useEffect(() => {
        if (selectedTab === 'lessons') {
            fetchLessons();
        }
    }, [selectedTab]);

    const fetchLessons = async () => {
        try {
            const res = await API.get('/learn/lessons');
            setLessons(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching lessons:', err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleLessonClick = (lessonId) => {
        navigate(`/learn/lesson/${lessonId}`);
    };
    
    // Framer Motion variants for animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const tabClasses = (tab) => 
        `tab-button ${selectedTab === tab ? 'active-tab' : ''}`;

    if (loading && selectedTab === 'lessons') return <div className="loading-message">Loading Lessons...</div>;

    return (
        <motion.div 
            className="lessons-page-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="header-section">
                <div className="title-and-button">
                    <h1 className="page-title">Learn & Grow</h1>
                    <motion.button 
                        className="dashboard-button" 
                        onClick={() => navigate('/dashboard')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go to Dashboard
                    </motion.button>
                </div>
                <div className="tab-menu">
                    <button className={tabClasses('lessons')} onClick={() => setSelectedTab('lessons')}>Lessons</button>
                    <button className={tabClasses('videos')} onClick={() => setSelectedTab('videos')}>Videos</button>
                    <button className={tabClasses('books')} onClick={() => setSelectedTab('books')}>Books</button>
                    <button className={tabClasses('notes')} onClick={() => setSelectedTab('notes')}>Notes</button>
                    <button className={tabClasses('games')} onClick={() => setSelectedTab('games')}>Games</button>
                    {isTeacherOrAdmin && (
                        <button className={tabClasses('upload')} onClick={() => setSelectedTab('upload')}>Upload Content</button>
                    )}
                </div>
            </div>

            <div className="content-area">
                <AnimatePresence mode="wait">
                    {selectedTab === 'lessons' && (
                        <motion.ul 
                            className="lessons-list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                            key="lessons-content"
                        >
                            {lessons.map((lesson) => (
                                <motion.li 
                                    key={lesson._id} 
                                    className="lesson-card"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleLessonClick(lesson._id)}
                                >
                                    <h4 className="lesson-title">{lesson.title}</h4>
                                    <p className="lesson-category">Category: {lesson.category}</p>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}

                    {selectedTab === 'videos' && <VideosSection />}
                    {selectedTab === 'books' && <BooksSection />}
                    {selectedTab === 'notes' && <NotesSection />}
                    {selectedTab === 'games' && <GamesSection />}
                    {isTeacherOrAdmin && selectedTab === 'upload' && <MediaUploadForm onUploadSuccess={() => setSelectedTab('videos')} />}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LessonsPage;