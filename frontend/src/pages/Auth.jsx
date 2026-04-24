import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { deriveKey, encryptData, generateSalt, arrayBufferToBase64 } from '../utils/crypto';
import api from '../api';
import { Lock, Mail, Key, ShieldAlert } from 'lucide-react';

const InputField = ({ icon: Icon, type, placeholder, value, onChange, isPink, hint }) => {
    return (
        <div className="w-full flex flex-col gap-2">
            <div className={`flex w-full bg-black/30 border border-white/10 rounded-xl transition-all duration-300 focus-within:bg-black/50 
                ${isPink ? 'focus-within:border-[#ff2e88] focus-within:shadow-[0_0_12px_#ff2e88]' : 'focus-within:border-[#00f0ff] focus-within:shadow-[0_0_12px_#00f0ff]'}`}>
                <div className={`flex items-center justify-center px-4 border-r border-white/10 bg-black/40 rounded-l-xl
                    ${isPink ? 'text-[#ff2e88]' : 'text-gray-400'}`}>
                    <Icon size={20} />
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required
                    className={`w-full bg-transparent text-white/90 placeholder:text-white/60 
                    rounded-r-xl py-3 pr-4 pl-[10px] h-12 outline-none 
                    font-inter text-base leading-relaxed`}
                />
            </div>
            {hint && <p className="text-xs text-[#ff2e88]/80 font-inter pl-1 tracking-wide">{hint}</p>}
        </div>
    );
};

const NeonButton = ({ children, isPink, loading }) => {
    return (
        <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 mt-6 rounded-xl font-orbitron font-semibold tracking-widest uppercase transition-all duration-300
            hover:scale-105 active:scale-95 flex items-center justify-center
            ${isPink
                    ? 'bg-gradient-to-r from-[#ff2e88] to-[#8a2eff] hover:shadow-[0_0_20px_#ff2e88] text-white'
                    : 'bg-gradient-to-r from-[#00f0ff] to-[#8a2eff] hover:shadow-[0_0_20px_#00f0ff] text-white'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

const AuthTabs = ({ isLogin, setIsLogin, setError }) => {
    return (
        <div className="flex gap-6 mb-8 border-b border-white/10">
            <button
                type="button"
                className={`pb-3 flex-1 text-center font-orbitron tracking-wider transition-all duration-300 relative
                ${isLogin ? 'text-[#00f0ff]' : 'text-white/40 hover:text-white/70'}`}
                onClick={() => { setIsLogin(true); setError(''); }}
            >
                LOGIN
                {isLogin && (
                    <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
                )}
            </button>
            <button
                type="button"
                className={`pb-3 flex-1 text-center font-orbitron tracking-wider transition-all duration-300 relative
                ${!isLogin ? 'text-[#ff2e88]' : 'text-white/40 hover:text-white/70'}`}
                onClick={() => { setIsLogin(false); setError(''); }}
            >
                REGISTER
                {!isLogin && (
                    <motion.div layoutId="authTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff2e88] shadow-[0_0_10px_#ff2e88]" />
                )}
            </button>
        </div>
    );
};

const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-white/10' };

    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

    const entropy = pwd.length * (poolSize > 0 ? Math.log2(poolSize) : 0);

    if (entropy < 40) return { score: 1, label: 'WEAK', color: 'bg-[#ff2e88] shadow-[0_0_10px_#ff2e88]', textClass: 'text-[#ff2e88]' };
    if (entropy < 60) return { score: 2, label: 'MEDIUM', color: 'bg-yellow-400 shadow-[0_0_10px_#facc15]', textClass: 'text-yellow-400' };
    return { score: 3, label: 'STRONG', color: 'bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]', textClass: 'text-[#00f0ff]' };
};

const PasswordStrengthMeter = ({ password }) => {
    const strength = calculateStrength(password);

    return (
        <div className="mt-2 flex flex-col gap-2 w-full px-1">
            <div className="flex gap-2 w-full h-1.5">
                {[1, 2, 3].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-500 ${password && strength.score >= level ? strength.color : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-orbitron font-semibold tracking-widest mt-1">
                <span className="text-white/40">ENTROPY LEVEL</span>
                <span className={`${strength.textClass || 'text-white/40'}`}>
                    {strength.label || 'AWAITING INPUT'}
                </span>
            </div>
        </div>
    );
};

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await api.post('/auth/login', { email, loginPassword });
                login(res.data.token, res.data.vaultMeta);
            } else {
                if (!masterPassword) {
                    setError('Master Password is required for registration');
                    setLoading(false);
                    return;
                }

                const salt = generateSalt();
                const key = await deriveKey(masterPassword, salt);
                const { encryptedText, iv } = await encryptData('vault-check', key);

                await api.post('/auth/register', {
                    email,
                    loginPassword,
                    encryptedVaultToken: encryptedText,
                    vaultTokenIv: iv,
                    vaultTokenSalt: arrayBufferToBase64(salt)
                });

                setIsLogin(true);
                setError('Registration successful! Please log in.');
                setMasterPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden bg-[#0b0f1a]">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#8a2eff]/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00f0ff]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-[0_0_40px_rgba(138,46,255,0.2)] relative z-10"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" size={32} />
                        <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                            ZK-PASS
                        </h1>
                    </div>
                    <p className="text-white/50 text-sm font-inter tracking-wide">Zero-Knowledge Security Protocol</p>
                </div>

                <AuthTabs isLogin={isLogin} setIsLogin={setIsLogin} setError={setError} />

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-3 p-4 mb-6 rounded-xl border font-inter leading-relaxed text-sm
                        ${error.includes('successful')
                                ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]'
                                : 'bg-[#ff2e88]/10 border-[#ff2e88]/30 text-[#ff2e88]'}`}
                    >
                        {!error.includes('successful') && <ShieldAlert size={18} className="mt-0.5 shrink-0" />}
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <InputField
                        icon={Mail}
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <InputField
                        icon={Key}
                        type="password"
                        placeholder="Login Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                    />

                    {!isLogin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                            <InputField
                                icon={Lock}
                                type="password"
                                placeholder="Master Password"
                                value={masterPassword}
                                onChange={e => setMasterPassword(e.target.value)}
                                isPink={true}
                                hint="We cannot recover your master password if lost."
                            />
                            <PasswordStrengthMeter password={masterPassword} />
                        </motion.div>
                    )}

                    <NeonButton isPink={!isLogin} loading={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'ENTER MATRIX' : 'INITIALIZE VAULT')}
                    </NeonButton>
                </form>
            </motion.div>

            <div className="absolute bottom-6 text-white/30 font-orbitron text-[10px] tracking-widest z-10">
                BY TRIPSSEC
            </div>
        </div>
    );
}
