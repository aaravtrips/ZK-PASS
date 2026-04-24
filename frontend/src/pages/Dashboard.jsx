import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { encryptData, decryptData } from '../utils/crypto';
import api from '../api';
import { LogOut, Plus, Trash2, Copy, Eye, EyeOff, Search, Shield, Server, Globe, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const { masterKey, logout } = useContext(AuthContext);
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [site, setSite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchCredentials();

        // Auto logout after 15 mins of inactivity
        let timeout = setTimeout(logout, 15 * 60 * 1000);
        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(logout, 15 * 60 * 1000);
        };
        window.addEventListener('mousemove', resetTimeout);
        window.addEventListener('keypress', resetTimeout);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', resetTimeout);
            window.removeEventListener('keypress', resetTimeout);
        };
    }, []);

    const fetchCredentials = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vault');

            // Decrypt all data
            const decryptedCreds = await Promise.all(res.data.map(async (cred) => {
                try {
                    const decSite = await decryptData(cred.encryptedSite, cred.siteIv, masterKey);
                    const decUsername = await decryptData(cred.encryptedUsername, cred.usernameIv, masterKey);
                    const decPassword = await decryptData(cred.encryptedPassword, cred.passwordIv, masterKey);

                    return {
                        _id: cred._id,
                        site: decSite,
                        username: decUsername,
                        password: decPassword,
                        createdAt: cred.createdAt
                    };
                } catch (e) {
                    console.error("Failed to decrypt a credential");
                    return null;
                }
            }));

            setCredentials(decryptedCreds.filter(c => c !== null));
        } catch (err) {
            console.error("Error fetching credentials", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const encSite = await encryptData(site, masterKey);
            const encUsername = await encryptData(username, masterKey);
            const encPassword = await encryptData(password, masterKey);

            await api.post('/vault', {
                encryptedSite: encSite.encryptedText,
                siteIv: encSite.iv,
                encryptedUsername: encUsername.encryptedText,
                usernameIv: encUsername.iv,
                encryptedPassword: encPassword.encryptedText,
                passwordIv: encPassword.iv
            });

            setSite('');
            setUsername('');
            setPassword('');
            setIsAdding(false);
            fetchCredentials();
        } catch (err) {
            console.error("Error adding credential", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this credential?")) return;
        try {
            await api.delete(`/vault/${id}`);
            if (selectedId === id) setSelectedId(null);
            setCredentials(credentials.filter(c => c._id !== id));
        } catch (err) {
            console.error("Error deleting credential", err);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    const selectedCredential = credentials.find(c => c._id === selectedId);

    return (
        <div className="flex h-screen bg-bg-color overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-800 bg-[#0d1321] flex flex-col z-10">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 neon-text-cyan font-bold text-xl tracking-wider">
                        <Shield size={24} />
                        ZK-PASS
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-800">
                    <button
                        onClick={() => { setIsAdding(true); setSelectedId(null); }}
                        className="btn-cyber w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm"
                    >
                        <Plus size={18} />
                        NEW ENTRY
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="text-center p-4 text-cyan-500 animate-pulse">Decrypting vault...</div>
                    ) : credentials.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 text-sm">No entries found</div>
                    ) : (
                        credentials.map(cred => (
                            <div
                                key={cred._id}
                                onClick={() => { setSelectedId(cred._id); setIsAdding(false); setShowPassword(false); }}
                                className={`p-3 rounded cursor-pointer transition-all flex items-center gap-3 ${selectedId === cred._id ? 'bg-cyan-900/40 border border-cyan-500/50' : 'hover:bg-gray-800 border border-transparent'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700">
                                    <Globe size={18} className={selectedId === cred._id ? 'text-cyan-400' : 'text-gray-400'} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className={`font-semibold truncate ${selectedId === cred._id ? 'text-cyan-300' : 'text-gray-200'}`}>{cred.site}</div>
                                    <div className="text-xs text-gray-500 truncate">{cred.username}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-auto border-t border-gray-800 flex flex-col">
                    <button 
                        onClick={() => navigate('/architecture')}
                        className="p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all font-orbitron tracking-widest text-[11px] border-b border-gray-800/50"
                    >
                        <BookOpen size={14} />
                        ABOUT ZK ARCHITECTURE
                    </button>
                    <div className="p-3 text-center text-white/20 text-[10px] font-orbitron tracking-widest bg-black/20">
                        BY TRIPSSEC
                    </div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10 pointer-events-none"></div>

                <div className="flex-1 p-8 overflow-y-auto z-10 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div
                                key="add"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="glass-card w-full max-w-2xl p-8"
                            >
                                <h2 className="text-2xl font-orbitron mb-6 text-cyan-400 border-b border-cyan-900 pb-4">ADD NEW CREDENTIAL</h2>
                                <form onSubmit={handleAdd} className="space-y-5">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1 font-orbitron tracking-wider">WEBSITE / SERVICE</label>
                                        <input type="text" className="input-cyber" value={site} onChange={e => setSite(e.target.value)} required placeholder="e.g. GitHub" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1 font-orbitron tracking-wider">USERNAME / EMAIL</label>
                                        <input type="text" className="input-cyber" value={username} onChange={e => setUsername(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1 font-orbitron tracking-wider">PASSWORD</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} className="input-cyber pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button type="submit" className="btn-cyber flex-1">SAVE ENCRYPTED ENTRY</button>
                                        <button type="button" onClick={() => setIsAdding(false)} className="btn-cyber flex-1 !border-gray-500 !text-gray-400 hover:!bg-gray-800 hover:!text-white hover:!shadow-none">CANCEL</button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : selectedCredential ? (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="glass-card w-full max-w-2xl p-8 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button onClick={() => handleDelete(selectedCredential._id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 bg-gray-900 rounded-full border border-gray-800">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                                    <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                                        <Server size={32} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-wide">{selectedCredential.site}</h2>
                                        <p className="text-gray-500 text-sm">Added on {new Date(selectedCredential.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 relative group">
                                        <label className="block text-xs text-gray-500 mb-2 font-orbitron">USERNAME</label>
                                        <div className="text-lg text-gray-200 font-mono">{selectedCredential.username}</div>
                                        <button onClick={() => handleCopy(selectedCredential.username)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy size={20} />
                                        </button>
                                    </div>

                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 relative group">
                                        <label className="block text-xs text-gray-500 mb-2 font-orbitron">PASSWORD</label>
                                        <div className="text-lg text-cyan-300 font-mono tracking-wider">
                                            {showPassword ? selectedCredential.password : '••••••••••••••••'}
                                        </div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
                                            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                            <button onClick={() => handleCopy(selectedCredential.password)} className="text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-center">
                                        <div className="text-xs text-green-400/70 flex items-center gap-2 bg-green-900/20 px-4 py-2 rounded-full border border-green-500/20">
                                            <Shield size={14} /> Locally decrypted with AES-256-GCM
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center text-gray-500 flex flex-col items-center"
                            >
                                <div className="w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center mb-4">
                                    <Shield size={40} className="text-gray-700" />
                                </div>
                                <h3 className="text-xl font-orbitron mb-2">VAULT SECURE</h3>
                                <p className="max-w-xs text-sm">Select an entry from the sidebar or add a new one.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
