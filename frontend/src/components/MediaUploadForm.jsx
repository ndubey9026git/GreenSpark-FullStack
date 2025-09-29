import React, { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api/api';
import './MediaUploadForm.css';

const MediaUploadForm = ({ onUploadSuccess }) => {
  const [mediaType, setMediaType] = useState('video');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    fileUrl: '',
    content: '',
    points: '',
    gameUrl: ''
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    let endpoint = '';
    let dataToSend = {};
    let headers = {};

    switch (mediaType) {
      case 'video':
        endpoint = '/media/videos';
        dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        if (uploadMethod === 'url') {
          dataToSend.append('url', formData.url);
        } else if (file) {
          dataToSend.append('file', file);
        }
        headers = { 'Content-Type': 'multipart/form-data' };
        break;
      case 'book':
        endpoint = '/media/books';
        dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        if (uploadMethod === 'url') {
          dataToSend.append('fileUrl', formData.fileUrl);
        } else if (file) {
          dataToSend.append('file', file);
        }
        headers = { 'Content-Type': 'multipart/form-data' };
        break;
      case 'note':
        endpoint = '/media/notes';
        dataToSend = { title: formData.title, content: formData.content };
        break;
      case 'game':
        endpoint = '/games';
        dataToSend = {
          title: formData.title,
          description: formData.description,
          points: formData.points,
          gameUrl: formData.gameUrl
        };
        break;
      default:
        setLoading(false);
        setMessage('Invalid media type selected.');
        return;
    }

    try {
      await API.post(endpoint, dataToSend, { headers });
      setMessage(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully!`);
      setFormData({ title: '', description: '', url: '', fileUrl: '', content: '', points: '', gameUrl: '' });
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setMessage(`Error uploading ${mediaType}. Check the console.`);
      console.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="upload-form-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3>Upload New Content</h3>
      <form onSubmit={handleSubmit} className="upload-form">
        <select 
          value={mediaType} 
          onChange={(e) => setMediaType(e.target.value)} 
          className="media-type-select"
        >
          <option value="video">Video</option>
          <option value="book">Book</option>
          <option value="note">Note</option>
          <option value="game">Game</option>
        </select>
        
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleFormChange} 
          placeholder="Title" 
          required 
          className="form-input"
        />

        {mediaType === 'game' && (
          <>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Game Description"
              required
              className="form-input"
            />
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleFormChange}
              placeholder="Points to Award"
              required
              className="form-input"
            />
            <input
              type="text"
              name="gameUrl"
              value={formData.gameUrl}
              onChange={handleFormChange}
              placeholder="Game URL"
              required
              className="form-input"
            />
          </>
        )}

        {(mediaType === 'video' || mediaType === 'book') && (
          <div className="upload-options">
            <label>
              <input 
                type="radio" 
                value="url" 
                checked={uploadMethod === 'url'} 
                onChange={() => setUploadMethod('url')}
              /> URL
            </label>
            <label>
              <input 
                type="radio" 
                value="file" 
                checked={uploadMethod === 'file'} 
                onChange={() => setUploadMethod('file')}
              /> Upload from device
            </label>
          </div>
        )}

        {uploadMethod === 'url' && (mediaType === 'video' || mediaType === 'book') && (
          <input 
            type="text" 
            name={mediaType === 'video' ? 'url' : 'fileUrl'}
            value={mediaType === 'video' ? formData.url : formData.fileUrl}
            onChange={handleFormChange}
            placeholder={mediaType === 'video' ? 'Video URL' : 'File URL'}
            required
            className="form-input"
          />
        )}

        {uploadMethod === 'file' && (mediaType === 'video' || mediaType === 'book') && (
          <input 
            type="file" 
            onChange={handleFileChange}
            required={uploadMethod === 'file'}
            className="form-input"
          />
        )}

        {(mediaType === 'video' || mediaType === 'book') && (
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Description"
            required
            className="form-textarea"
          ></textarea>
        )}

        {mediaType === 'note' && (
          <textarea
            name="content"
            value={formData.content}
            onChange={handleFormChange}
            placeholder="Note Content (Markdown supported)"
            required
            className="form-textarea"
          ></textarea>
        )}
        
        <motion.button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Uploading...' : `Upload ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}`}
        </motion.button>
        {message && <p className="status-message">{message}</p>}
      </form>
    </motion.div>
  );
};

export default MediaUploadForm;