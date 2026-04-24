import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, EyeOff, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ZkArchitecture() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-color flex flex-col relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-10 text-gray-300 p-4 md:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 pointer-events-none"></div>

            <div className="w-full flex-1 flex flex-col z-10">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4 md:mb-6 w-fit group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-orbitron tracking-widest text-sm">BACK TO VAULT</span>
                </button>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card flex-1 w-full p-6 md:p-12 overflow-y-auto"
                >
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                        <div className="w-16 h-16 rounded-xl bg-gray-900 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                            <EyeOff size={32} className="text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide font-orbitron neon-text-cyan">ZERO-KNOWLEDGE ARCHITECTURE</h1>
                            <p className="text-gray-400 text-sm mt-2 font-mono">How your data stays yours.</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-orbitron text-cyan-300 mb-4 flex items-center gap-2">
                                <Shield size={20} />
                                THE PRINCIPLE
                            </h2>
                            <p>
                                Zero-Knowledge (ZK) architecture is a security model where the service provider (us) knows absolutely nothing about the data you store. Your master password never leaves your device, and your vault data is encrypted locally before it is ever transmitted to our servers.
                            </p>
                        </section>

                        <section className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                            <h2 className="text-xl font-orbitron text-purple-400 mb-4 flex items-center gap-2">
                                <Lock size={20} />
                                ENCRYPTION PROCESS
                            </h2>
                            <ul className="list-disc list-inside space-y-3 marker:text-purple-500">
                                <li><strong className="text-white">Master Key Generation:</strong> Your master password is hashed using PBKDF2 with a unique salt to derive a strong cryptographic key.</li>
                                <li><strong className="text-white">Local Encryption:</strong> Every entry in your vault is encrypted using AES-256-GCM right in your browser.</li>
                                <li><strong className="text-white">Ciphertext Transmission:</strong> Only the resulting ciphertext and initialization vectors (IVs) are sent to the database.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-orbitron text-cyan-300 mb-4 flex items-center gap-2">
                                <Server size={20} />
                                WHAT WE SEE
                            </h2>
                            <p>
                                If our servers were ever compromised, attackers would only find unrecognizable ciphertext. Without your exact master password, decrypting the vault would take billions of years with current computing power. 
                            </p>
                            <div className="mt-4 p-4 bg-black/40 border border-cyan-900 rounded font-mono text-xs text-cyan-500 break-all">
                                // Example of what we store:
                                <br />
                                7b226976223a2238616238...4613222c2263697068657274657874223a22...
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
