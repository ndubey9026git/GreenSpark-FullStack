import Spinner from '../components/Spinner';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";

// --- Data, Icons & Config (Defined at the top level) ---
const BADGE_RULES = [
  { name: "Eco Starter", emoji: "🥉", threshold: 50 },
  { name: "Eco Hero", emoji: "🥈", threshold: 100 },
  { name: "Eco Champion", emoji: "🥇", threshold: 200 },
];
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const LeaderboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a3.004 3.004 0 015.288 0M12 14a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const TeacherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// --- Main Dashboard Component ---
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const navigate = useNavigate();
  
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const fetchProfile = async () => {
    try {
      const profileRes = await API.get("/auth/profile");
      setUser(profileRes.data);
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const challengesRes = await API.get("/challenges");
        setChallenges(challengesRes.data);
      } catch (err) {
        console.error("Failed to fetch challenges:", err);
      }
    };
    fetchProfile();
    fetchChallenges();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleProfileSave = async (updatedUser) => {
    try {
      await API.put("/auth/profile", updatedUser);
      setUser(prev => ({...prev, ...updatedUser}));
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast("Failed to update profile.");
    } finally {
      setProfileOpen(false);
    }
  };
  
  const handleShare = async () => {
     const shareText = `I’ve earned ${user.ecoPoints} eco points on GreenSpark! 🌱 Badges: ${(user.badges || []).join(", ")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My GreenSpark Progress!", text: shareText, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareText);
      showToast("Progress copied to clipboard!");
    }
  };

  const certCanvasRef = useRef(null);
  const downloadCertificate = (badgeName) => {
    const canvas = certCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1200, H = 800;
    canvas.width = W; canvas.height = H;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e8fff1"); grad.addColorStop(1, "#cfeee0");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#2d6a4f"; ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.fillStyle = "#1b4332"; ctx.font = "bold 64px Arial";
    ctx.fillText("GreenSpark Achievement", 260, 140);
    ctx.fillStyle = "#2d6a4f"; ctx.font = "28px Arial";
    ctx.fillText("Awarded to", 100, 250);
    ctx.fillStyle = "#0b6b3a"; ctx.font = "bold 54px Arial";
    ctx.fillText(user.name, 100, 320);
    const rule = BADGE_RULES.find((b) => b.name === badgeName) || { emoji: "🌟" };
    ctx.fillStyle = "#1b4332"; ctx.font = "bold 48px Arial";
    ctx.fillText(`${rule.emoji} ${rule.name}`, 100, 420);
    ctx.font = "28px Arial";
    ctx.fillText(`Eco Points: ${user.ecoPoints}`, 100, 480);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 100, 520);
    ctx.font = "24px Arial";
    ctx.fillText("Powered by GreenSpark – Smart Eco Education", 100, 700);
    const data = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data; a.download = `${badgeName}_certificate.png`; a.click();
  };

  if (loading || !user) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Spinner />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <canvas ref={certCanvasRef} style={{ display: "none" }} />
      <Header user={user} onLogout={handleLogout} onShare={handleShare} />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={{hidden: {opacity:0}, visible: {opacity:1, transition: {staggerChildren: 0.1}}}}>
          <motion.h1 variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="text-4xl font-bold mb-2">Welcome back, {user.name}!</motion.h1>
          <motion.p variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="text-gray-500 mb-6">Here's your environmental impact dashboard.</motion.p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ProfileCard user={user} onEdit={() => setProfileOpen(true)} />
            <StatsCard ecoPoints={user.ecoPoints} />
          </div>

          <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">🏅 Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BADGE_RULES.map((badge) => (
                <BadgeCard
                  key={badge.name}
                  badge={badge}
                  owned={(user.badges || []).includes(badge.name)}
                  onDownload={() => downloadCertificate(badge.name)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}}>
            <h2 className="text-2xl font-bold mb-4">🌍 Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard 
                   key={challenge._id} 
                   challenge={challenge} 
                   isCompleted={(user.completed || []).includes(challenge._id)}
                   isCompleting={completingId === challenge._id}
                   onComplete={async () => {
                     setCompletingId(challenge._id);
                     try {
                       await API.post("/challenges/complete", { challengeId: challenge._id });
                       await fetchProfile();
                       showToast(`+${challenge.points} pts!`);
                     } catch (err) {
                       console.error("Failed to complete challenge:", err);
                       showToast(err.response?.data?.message || "Action failed.");
                     } finally {
                       setCompletingId(null);
                     }
                   }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      <AnimatePresence>
        {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSave={handleProfileSave} />}
      </AnimatePresence>
      <Chatbot onToggle={() => setChatbotOpen(prev => !prev)} isOpen={chatbotOpen}/>
      
      <AnimatePresence>
       {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components (Defined Outside of Dashboard) ---

const Header = ({ user, onLogout, onShare }) => (
  <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌿</span>
        <h1 className="text-2xl font-bold text-green-800">GreenSpark</h1>
      </div>
      <div className="flex items-center gap-2">
        {user.role === 'admin' ? (
          <Link to="/admin-panel" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
            <AdminIcon />
            <span>Admin Panel</span>
          </Link>
        ) : user.role === 'teacher' ? (
          <Link to="/teacher-panel" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">
            <TeacherIcon />
            <span>Teacher Panel</span>
          </Link>
        ) : null}
        <Link to="/learn/lessons" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            📚 Learn
        </Link>
        <Link to="/leaderboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <LeaderboardIcon />
          <span>Leaderboard</span>
        </Link>
        <button onClick={onShare} className="p-2 text-gray-600 rounded-full hover:bg-gray-100 transition" title="Share Progress"><ShareIcon /></button>
        <button onClick={onLogout} className="p-2 text-gray-600 rounded-full hover:bg-gray-100 transition" title="Logout"><LogoutIcon /></button>
      </div>
    </div>
  </header>
);

const ProfileCard = ({ user, onEdit }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
    <img src={user.avatar || `https://api.dicebear.com/8.x/micah/svg?seed=${user.name}`} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-green-200 bg-gray-100"/>
    <h2 className="text-2xl font-bold mt-3">{user.name}</h2>
    <p className="text-gray-500 text-sm">{user.email}</p>
    <span className="mt-2 inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full capitalize">{user.role}</span>
    <button onClick={onEdit} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition">Edit Profile</button>
  </div>
);

const StatsCard = ({ ecoPoints }) => {
  const maxPoints = Math.max(...BADGE_RULES.map(rule => rule.threshold));
  const finalBadge = BADGE_RULES.find(rule => rule.threshold === maxPoints) || {name: 'Champion', emoji: '🏆'};
  const progress = useMemo(() => clamp((ecoPoints / maxPoints) * 100, 0, 100), [ecoPoints, maxPoints]);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg lg:col-span-2 flex flex-col justify-center">
      <h3 className="text-xl font-bold">Your Progress</h3>
      <div className="flex items-baseline justify-between mt-2">
        <p className="text-gray-500">Eco Points</p>
        <p className="text-5xl font-bold text-green-600">{ecoPoints}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
        <motion.div className="bg-gradient-to-r from-lime-400 to-green-500 h-4 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeInOut" }}/>
      </div>
      <p className="text-right text-xs text-gray-500 mt-1">{Math.round(progress)}% to {finalBadge.name} {finalBadge.emoji}</p>
    </div>
  );
};

const BadgeCard = ({ badge, owned, onDownload }) => (
  <motion.div className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${owned ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-200 bg-gray-50'}`} whileHover={{scale: 1.03}}>
    <span className="text-4xl">{badge.emoji}</span>
    <div className="flex-1">
      <p className={`font-bold ${owned ? 'text-yellow-900' : 'text-gray-700'}`}>{badge.name}</p>
      <p className="text-xs text-gray-500">{owned ? 'Unlocked!' : `Unlock at ${badge.threshold} pts`}</p>
    </div>
    <button onClick={onDownload} disabled={!owned} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition" title={owned ? "Download Certificate" : "Earn more points to unlock"}>
      <DownloadIcon />
    </button>
  </motion.div>
);

const ChallengeCard = ({ challenge, isCompleted, isCompleting, onComplete }) => {
   return (
    <motion.div 
      className={`p-5 rounded-2xl shadow-lg flex flex-col items-center text-center transition ${isCompleted ? 'bg-gray-200 opacity-70' : 'bg-white'}`} 
      whileHover={isCompleted || isCompleting ? {} : { scale: 1.05, y: -5 }}
    >
      <span className="text-5xl mb-3">{challenge.icon}</span>
      <p className="font-bold mb-1 flex-grow">{challenge.title}</p>
      <p className="text-sm text-green-600 font-semibold mb-4">+{challenge.points} pts</p>
      <button 
        onClick={onComplete} 
        disabled={isCompleted || isCompleting}
        className="w-full px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isCompleted ? 'Completed ✅' : isCompleting ? 'Completing...' : 'Complete'}
      </button>
    </motion.div>
   )
};

const ProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileRef = useRef(null);
  const handleSave = () => { onSave({ name, email, avatar }); };
  const onFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };
  const PRESET_AVATARS = [`https://api.dicebear.com/8.x/micah/svg?seed=Garfield`,`https://api.dicebear.com/8.x/micah/svg?seed=Sheba`,`https://api.dicebear.com/8.x/micah/svg?seed=Mimi`,`https://api.dicebear.com/8.x/micah/svg?seed=Abby`,`https://api.dicebear.com/8.x/micah/svg?seed=Sammy`,`https://api.dicebear.com/8.x/micah/svg?seed=Max`];
  return (
    <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl p-6 w-full max-w-lg" initial={{scale: 0.8, y: 50}} animate={{scale: 1, y: 0}} exit={{scale: 0.8, y: 50}} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-lg"/>
          </div>
          <div>
            <label className="text-sm font-medium">Avatar</label>
            <div className="flex items-center gap-4 mt-2">
              <img src={avatar || `https://api.dicebear.com/8.x/micah/svg?seed=${user.name}`} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-green-200 bg-gray-100"/>
              <button onClick={() => fileRef.current.click()} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Upload Image</button>
              <input type="file" ref={fileRef} onChange={onFileChange} className="hidden" accept="image/*"/>
            </div>
          </div>
           <div>
            <label className="text-sm font-medium">Or pick a preset</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {PRESET_AVATARS.map(src => <img key={src} src={src} onClick={() => setAvatar(src)} className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 ring-green-500 bg-gray-100"/>)}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  )
};

const Chatbot = ({ isOpen, onToggle }) => {
  const [history, setHistory] = useState([{from:'bot', text: "Hi! I'm your GreenSpark helper. Ask me anything about points or badges!"}])
  const [draft, setDraft] = useState('');
  const onSend = (msg) => {
    setHistory(h => [...h, {from: 'me', text: msg}]);
    const lower = msg.toLowerCase();
    let reply = "Sorry, I can only answer questions about points, badges, and certificates.";
    if (lower.includes("points")) reply = "You earn points by completing challenges on the dashboard.";
    if (lower.includes("badge")) reply = "Badges unlock automatically when you reach 50, 100, and 200 points!";
    if (lower.includes("certificate")) reply = "The download button appears on a badge once you've unlocked it.";
    setTimeout(() => setHistory(h => [...h, {from: 'bot', text: reply}]), 600);
  }
  return (
    <>
      <motion.button onClick={onToggle} className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 rounded-full text-white text-3xl flex items-center justify-center shadow-lg z-50" whileHover={{scale: 1.1}} whileTap={{scale: 0.9}}>
        {isOpen ? '✕' : '💬'}
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 20}}>
            <div className="p-4 bg-green-100 text-green-800 font-bold">GreenSpark Helper</div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto h-64">
              {history.map((m, i) => (<div key={i} className={`p-2 rounded-lg max-w-[80%] text-sm ${m.from === 'bot' ? 'bg-gray-200 self-start' : 'bg-green-200 self-end'}`}>{m.text}</div>))}
            </div>
            <div className="p-2 border-t flex gap-2">
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => {if (e.key === 'Enter' && draft.trim()){onSend(draft); setDraft('');}}} className="flex-1 p-2 border rounded-lg" placeholder="Ask a question..."/>
              <button onClick={() => {if(draft.trim()){onSend(draft); setDraft('');}}} className="px-4 py-2 bg-green-600 text-white rounded-lg">Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const Toast = ({ message }) => (
  <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}}>
    {message}
  </motion.div>
);