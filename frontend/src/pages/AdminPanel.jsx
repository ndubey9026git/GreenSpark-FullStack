// src/pages/AdminPanel.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null); // To hold challenge data for editing

  const fetchData = async () => {
    try {
      const [usersRes, challengesRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/challenges"),
      ]);
      setUsers(usersRes.data);
      setChallenges(challengesRes.data);
    } catch (err) {
      setError("You do not have permission to view this page or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${userId}`);
        fetchData(); 
      } catch (err) {
        alert("Failed to delete user.");
      }
    }
  };
  
  const handleDeleteChallenge = async (challengeId) => {
     if (window.confirm("Are you sure you want to delete this challenge?")) {
      try {
        await API.delete(`/admin/challenges/${challengeId}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete challenge.");
      }
    }
  };
  
  const handleSaveUser = async (newUserData) => {
    try {
        // Corrected API path
        await API.post('/admin/users', newUserData);
        setIsUserModalOpen(false);
        fetchData();
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to create user.');
    }
  };
  
  // ✅ UPDATED: Handler for both creating and updating challenges
  const handleSaveChallenge = async (challengeData) => {
    try {
        if (editingChallenge) {
            // This is an update
            await API.put(`/admin/challenges/${editingChallenge._id}`, challengeData);
        } else {
            // This is a creation
            await API.post('/admin/challenges', challengeData);
        }
        setIsChallengeModalOpen(false);
        setEditingChallenge(null);
        fetchData();
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to save challenge.');
    }
  };

  const openChallengeModal = (challenge = null) => {
      setEditingChallenge(challenge); // If null, it's 'create' mode. If has data, it's 'edit' mode.
      setIsChallengeModalOpen(true);
  }

  if (loading) return <div className="p-10 text-center">Loading Admin Data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-gray-800">🛠️ Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition text-sm">
              View Student Dashboard
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Users Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">User Management</h2>
            <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-sm">
              Create New User
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ✅ UPDATED: Challenges Section now has Create and Edit buttons */}
        <section>
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Challenge Management</h2>
            <button onClick={() => openChallengeModal()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition text-sm">
              Create New Challenge
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challenges.map((challenge) => (
                   <tr key={challenge._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{challenge.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">{challenge.points}</td>
                    <td className="px-6 py-4 text-center text-sm space-x-4">
                       <button onClick={() => openChallengeModal(challenge)} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                       <button onClick={() => handleDeleteChallenge(challenge._id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </motion.div>

      <AnimatePresence>
          {isUserModalOpen && (
              <UserModal 
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
              />
          )}
          {isChallengeModalOpen && (
              <ChallengeModal
                challenge={editingChallenge}
                onClose={() => {setIsChallengeModalOpen(false); setEditingChallenge(null);}}
                onSave={handleSaveChallenge}
              />
          )}
      </AnimatePresence>
    </div>
  );
}


function UserModal({ onClose, onSave }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('teacher');

    const handleSubmit = () => {
        if (!name || !email || !password) {
            alert('Please fill out all fields.');
            return;
        }
        onSave({ name, email, password, role });
    };

    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose}>
            <motion.div className="bg-white rounded-2xl p-6 w-full max-w-md" initial={{scale: 0.8}} animate={{scale: 1}} exit={{scale: 0.8}} onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Create New User</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Role</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 mt-1 border rounded-lg bg-white"><option value="teacher">Teacher</option><option value="student">Student</option><option value="admin">Admin</option></select></div>
                </div>
                <div className="flex justify-end gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button><button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Save User</button></div>
            </motion.div>
        </motion.div>
    );
}

function ChallengeModal({ challenge, onClose, onSave }) {
    const [title, setTitle] = useState(challenge?.title || '');
    const [description, setDescription] = useState(challenge?.description || '');
    const [points, setPoints] = useState(challenge?.points || 10);
    const [icon, setIcon] = useState(challenge?.icon || '⭐');

    const handleSubmit = () => {
        if (!title || !points || !icon) {
            alert('Please fill out Title, Points, and Icon fields.');
            return;
        }
        onSave({ title, description, points: Number(points), icon });
    };
    
    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose}>
            <motion.div className="bg-white rounded-2xl p-6 w-full max-w-md" initial={{scale: 0.8}} animate={{scale: 1}} exit={{scale: 0.8}} onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{challenge ? 'Edit Challenge' : 'Create New Challenge'}</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Icon (Emoji)</label><input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Points</label><input type="number" value={points} onChange={e => setPoints(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/></div>
                    <div><label className="block text-sm font-medium text-gray-700">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 mt-1 border rounded-lg" rows="3"></textarea></div>
                </div>
                <div className="flex justify-end gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button><button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Save Challenge</button></div>
            </motion.div>
        </motion.div>
    );
}