import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { deriveKey, decryptData, base64ToArrayBuffer } from '../utils/crypto';
import { Lock, ShieldAlert } from 'lucide-react';

export default function Unlock() {
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { vaultMeta, unlock, logout } = useContext(AuthContext);

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!vaultMeta) {
                throw new Error("Vault metadata missing. Please log in again.");
            }

            const salt = base64ToArrayBuffer(vaultMeta.vaultTokenSalt);
            const key = await deriveKey(masterPassword, salt);
            
            const decrypted = await decryptData(
                vaultMeta.encryptedVaultToken,
                vaultMeta.vaultTokenIv,
                key
            );

            if (decrypted === 'vault-check') {
                unlock(key);
            } else {
                setError('Invalid Master Password. Decryption failed.');
            }
        } catch (err) {
            setError(err.message || 'Failed to unlock vault');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-[#0b0f1a]">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#8a2eff]/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00f0ff]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card w-full max-w-md p-8 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan shadow-[0_0_10px_#00f3ff]"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                        <Lock size={40} className="text-cyan-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 neon-text-cyan">ENCRYPTED VAULT</h2>
                <p className="text-gray-400 text-sm mb-8">Enter your master password to decrypt your data locally.</p>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 mb-6 rounded bg-red-900/50 border border-red-500 text-red-300 text-sm text-left">
                        <ShieldAlert size={18} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleUnlock} className="space-y-6">
                    <input 
                        type="password" 
                        placeholder="Master Password" 
                        className="input-cyber text-center text-lg tracking-widest"
                        value={masterPassword}
                        onChange={e => setMasterPassword(e.target.value)}
                        required
                        autoFocus
                    />

                    <button 
                        type="submit" 
                        className="btn-cyber w-full"
                        disabled={loading}
                    >
                        {loading ? 'DECRYPTING...' : 'UNLOCK VAULT'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800">
                    <button 
                        onClick={logout}
                        className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                    >
                        Terminate Session (Logout)
                    </button>
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-white/30 font-orbitron text-[10px] tracking-widest z-10">
                BY TRIPSSEC
            </div>
        </div>
    );
}
