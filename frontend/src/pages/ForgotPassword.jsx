// src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/api";

// Reusable SVG Leaf Icon
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 00-7.072 0" />
    </svg>
);

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await API.post("/auth/forgot-password", { email });
            setMessage(res.data.message || "✅ Password reset instructions sent!");
        } catch (err) {
            setMessage(err.response?.data?.message || "❌ Failed to send reset email");
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-green-50">
            <div className="relative flex h-auto w-full max-w-4xl flex-row overflow-hidden rounded-2xl bg-white shadow-2xl">
                
                {/* Left Panel */}
                <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-lime-200 to-green-300 p-12 text-center text-white lg:flex">
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col items-center">
                        <LeafIcon />
                        <h1 className="mt-4 text-4xl font-bold text-green-800">Forgot Password?</h1>
                        <p className="mt-2 text-green-700">No worries, we'll help you get back on track.</p>
                    </motion.div>
                </div>

                {/* Right Panel: Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12">
                    <motion.form onSubmit={handleSubmit} className="flex flex-col gap-4" variants={containerVariants} initial="hidden" animate="visible">
                        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-800">Reset Your Password</motion.h2>
                        
                        <motion.p variants={itemVariants} className="text-gray-500">
                            Enter your registered email address below, and we'll send you a link to reset your password.
                        </motion.p>
                        
                        <motion.div variants={itemVariants} className="mt-4">
                            <label className="block text-sm font-medium text-gray-600">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50" />
                        </motion.div>

                        {message && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`mt-2 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}
                            >
                                {message}
                            </motion.p>
                        )}

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="mt-4 w-full rounded-lg bg-green-600 p-3 text-lg font-semibold text-white shadow-md transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Send Reset Link
                        </motion.button>
                        
                        <motion.div variants={itemVariants} className="mt-4 text-center text-sm text-gray-600">
                            <Link to="/" className="font-medium text-green-600 hover:underline">
                                ← Back to Login
                            </Link>
                        </motion.div>
                    </motion.form>
                </div>
            </div>
        </div>
    );
}