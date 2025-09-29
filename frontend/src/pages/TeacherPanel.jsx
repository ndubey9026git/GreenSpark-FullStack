// src/pages/TeacherPanel.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherPanel() {
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, challengesRes, assignedRes] = await Promise.all([
            API.get("/teacher/students"),
            API.get("/challenges"),
            API.get("/teacher/assigned-students")
        ]);
        setStudents(studentsRes.data);
        setChallenges(challengesRes.data);
        setAssignedStudents(assignedRes.data);
      } catch (err) {
        setError("You do not have permission to view this page or an error occurred.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };
  
  const handleOpenAssignModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  }

  const handleAssignChallenge = async (assignmentData) => {
    try {
        await API.post('/teacher/assignments', {
            studentId: selectedStudent._id,
            challengeId: assignmentData.challengeId,
            dueDate: assignmentData.dueDate,
        });
        showToast(`Challenge assigned to ${selectedStudent.name}!`);
        const assignedRes = await API.get("/teacher/assigned-students");
        setAssignedStudents(assignedRes.data);
    } catch (err) {
        console.error("Assignment failed:", err);
        showToast(err.response?.data?.message || 'Failed to assign challenge.');
    } finally {
        handleCloseModal();
    }
  };


  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">Loading Student Data...</div>;
  }
  
  if (error) {
    return (
       <div className="text-center p-10">
         <p className="text-red-500 font-semibold">{error}</p>
         <Link to="/dashboard" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
            Go to Dashboard
          </Link>
       </div>
    );
  }
  
  const studentsToShow = view === 'all' ? students : assignedStudents;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">👩‍🏫 Teacher Panel</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
            <button 
                onClick={() => setView('all')}
                className={`px-4 py-2 font-semibold rounded-lg transition ${view === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
                All Students ({students.length})
            </button>
            <button 
                onClick={() => setView('assigned')}
                className={`px-4 py-2 font-semibold rounded-lg transition ${view === 'assigned' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
                Assigned Students ({assignedStudents.length})
            </button>
            
            {/* ✅ ADDED: New link for managing lessons */}
            <Link to="/manage-lessons" className="ml-auto px-4 py-2 font-semibold rounded-lg transition bg-green-600 text-white hover:bg-green-700">
                Manage Lessons 📚
            </Link>
        </div>


        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Eco Points</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges Earned</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentsToShow.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-green-700">{student.ecoPoints}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(student.badges || []).length > 0 ? student.badges.join(', ') : 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button 
                      onClick={() => handleOpenAssignModal(student)}
                      className="px-3 py-1 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition text-xs"
                    >
                      Assign Challenge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isModalOpen && (
          <AssignmentModal 
            student={selectedStudent} 
            challenges={challenges}
            onClose={handleCloseModal}
            onAssign={handleAssignChallenge}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}


function AssignmentModal({ student, challenges, onClose, onAssign }) {
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!selectedChallengeId) {
      alert('Please select a challenge to assign.');
      return;
    }
    onAssign({
      challengeId: selectedChallengeId,
      dueDate: dueDate || null,
    });
  };

  return (
     <motion.div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
      onClick={onClose}
    >
        <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
            initial={{scale: 0.8, y: 50}} animate={{scale: 1, y: 0}} exit={{scale: 0.8, y: 50}}
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-2xl font-bold mb-2">Assign Challenge</h2>
            <p className="mb-6 text-gray-600">Assign a new task to <span className="font-semibold">{student.name}</span>.</p>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenge</label>
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="" disabled>Select a challenge...</option>
                    {challenges.map(challenge => (
                        <option key={challenge._id} value={challenge._id}>
                            {challenge.title} (+{challenge.points} pts)
                        </option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
               </div>
            </div>
            
             <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Confirm Assignment</button>
            </div>
        </motion.div>
    </motion.div>
  )
}

const Toast = ({ message }) => (
  <motion.div
    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    initial={{opacity: 0, y: 20}}
    animate={{opacity: 1, y: 0}}
    exit={{opacity: 0, y: -20}}
  >
    {message}
  </motion.div>
);