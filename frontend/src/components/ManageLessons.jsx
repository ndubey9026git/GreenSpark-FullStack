// src/components/ManageLessons.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from "../api/api";
import './ManageLessons.css';

const ManageLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await API.get('/learn/admin/lessons');
      setLessons(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching lessons:", err.response?.data?.message || err.message);
      setLoading(false);
      if (err.response && err.response.status === 403) {
        navigate('/dashboard');
      }
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, e) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][e.target.name] = e.target.value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = e.target.value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: '' }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/learn/admin/lessons/${formData._id}`, formData);
        alert('Lesson updated successfully!');
      } else {
        const dataToSend = { ...formData, quiz: {} };
        await API.post('/learn/admin/lessons', dataToSend);
        alert('Lesson created successfully!');
      }
      setFormData({
        title: '',
        category: '',
        content: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
      });
      setIsEditing(false);
      fetchLessons();
    } catch (err) {
      console.error("Error submitting lesson:", err.response?.data?.message || err.message);
      alert('Error submitting lesson. Check the console.');
    }
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await API.delete(`/learn/admin/lessons/${lessonId}`);
        alert('Lesson deleted successfully!');
        fetchLessons();
      } catch (err) {
        console.error("Error deleting lesson:", err.response?.data?.message || err.message);
        alert('Error deleting lesson.');
      }
    }
  };

  const handleEdit = (lesson) => {
    setFormData({
      ...lesson,
      questions: lesson.quiz ? lesson.quiz.questions : [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
    setIsEditing(true);
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="manage-lessons-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="header-section">
        <h2 className="main-heading">Manage Lessons</h2>
        <motion.button
          className="dashboard-button"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go to Dashboard
        </motion.button>
      </div>
      
      <motion.form
        onSubmit={handleSubmit}
        className="lesson-form"
        variants={itemVariants}
      >
        <h3 className="form-heading">{isEditing ? 'Edit Lesson' : 'Create New Lesson'}</h3>
        <input type="text" name="title" value={formData.title} onChange={handleFormChange} placeholder="Lesson Title" required className="form-input" />
        <select name="category" value={formData.category} onChange={handleFormChange} required className="form-input">
          <option value="" disabled>Select a Category</option>
          <option value="Waste Management">Waste Management</option>
          <option value="Energy Conservation">Energy Conservation</option>
          <option value="Water Conservation">Water Conservation</option>
          <option value="Biodiversity">Biodiversity</option>
        </select>
        <textarea name="content" value={formData.content} onChange={handleFormChange} placeholder="Lesson Content" required className="form-textarea"></textarea>
        
        {formData.questions.map((q, qIndex) => (
          <motion.div key={qIndex} className="question-block" variants={itemVariants}>
            <input type="text" name="question" value={q.question} onChange={(e) => handleQuestionChange(qIndex, e)} placeholder={`Question ${qIndex + 1}`} required className="question-input" />
            <p className="options-label">Options:</p>
            {q.options.map((o, oIndex) => (
              <input key={oIndex} type="text" value={o} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} placeholder={`Option ${oIndex + 1}`} required className={`option-input option-${oIndex}`} />
            ))}
            <input type="text" name="correctAnswer" value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, e)} placeholder="Correct Answer" required className="correct-answer-input" />
          </motion.div>
        ))}
        <motion.button type="button" onClick={addQuestion} className="add-question-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Add Another Question
        </motion.button>
        
        <motion.button type="submit" className="submit-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {isEditing ? 'Update Lesson' : 'Create Lesson'}
        </motion.button>
        {isEditing && (
          <motion.button
            type="button"
            onClick={() => { setIsEditing(false); setFormData({ title: '', category: '', content: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] }); }}
            className="cancel-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        )}
      </motion.form>
      
      <h3 className="section-heading">Existing Lessons</h3>
      <motion.ul className="lesson-list" variants={containerVariants}>
        <AnimatePresence>
          {lessons.map((lesson) => (
            <motion.li
              key={lesson._id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -100 }}
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <h4>{lesson.title}</h4>
                <p>Category: {lesson.category}</p>
                <p>Quiz Questions: {lesson.quiz?.questions?.length || 0}</p>
              </div>
              <div className="button-group">
                <button onClick={() => handleEdit(lesson)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(lesson._id)} className="delete-button">Delete</button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
};

export default ManageLessons;