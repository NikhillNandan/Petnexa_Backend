import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const themeColor = '#FF8C00';
    const themeGlow = 'rgba(255,140,0,0.3)';
    const themeBg = 'linear-gradient(135deg, #FF8C00, #FFA500)';

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.forgotPassword.sendOtp(email);
            if (res.success) {
                setSuccessMsg('OTP sent! Check your inbox.');
                setTimeout(() => {
                    setSuccessMsg(null);
                    setStep(2);
                }, 1500);
            } else {
                setError(res.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.forgotPassword.verifyOtp(email, otp);
            if (res.success) {
                setSuccessMsg('OTP Confirmed Successfully!');
                setTimeout(() => {
                    setSuccessMsg(null);
                    setStep(3);
                }, 1500);
            } else {
                setError(res.message || 'Invalid OTP.');
            }
        } catch (err) {
            setError('Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.forgotPassword.resetPassword(email, otp, newPassword);
            if (res.success) {
                setSuccessMsg('Password Reset Successfully! Redirecting...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError('Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #020617 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient Glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-30%', left: '-20%',
                    width: '700px', height: '700px',
                    background: `radial-gradient(circle, ${themeGlow} 0%, transparent 70%)`,
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%', maxWidth: '460px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '32px',
                    backdropFilter: 'blur(40px)',
                    overflow: 'hidden',
                    boxShadow: '0 60px 120px -30px rgba(0,0,0,0.5)',
                    position: 'relative', zIndex: 10,
                }}
            >
                <div style={{ height: '3px', background: themeBg }} />

                <div style={{ padding: '48px 44px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <button
                            onClick={() => step === 1 ? navigate('/login') : setStep(prev => (prev - 1) as any)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                color: 'rgba(148,163,184,0.6)', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase',
                                padding: 0
                            }}>
                            ← {step === 1 ? 'Back to Login' : 'Prev Step'}
                        </button>
                        <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '38px', fontWeight: '900', color: 'white', letterSpacing: '-0.04em', lineHeight: '1.2', marginBottom: '12px' }}>
                            Recover <br /> Account
                        </h1>
                        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '15px', lineHeight: '1.6' }}>
                            {step === 1 && "Enter your email to receive a secure OTP code."}
                            {step === 2 && "A 6-digit code has been sent to your inbox."}
                            {step === 3 && "Create a new strong password for your account."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', color: '#fca5a5', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>⚠️</span> {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', color: '#6ee7b7', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>✅</span> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                <input
                                    type="email" required placeholder="name@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none', transition: '0.3s' }}
                                />
                            </div>
                            <button disabled={loading} style={{ padding: '20px', background: loading ? 'rgba(255,255,255,0.1)' : themeBg, border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '0.1em', cursor: loading ? 'wait' : 'pointer', boxShadow: loading ? 'none' : `0 20px 40px -10px ${themeGlow}` }}>
                                {loading ? 'SENDING...' : 'SEND OTP CODE →'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Verification Code</label>
                                <input
                                    type="text" required placeholder="000000"
                                    value={otp} onChange={e => setOtp(e.target.value)}
                                    style={{ width: '100%', padding: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', letterSpacing: '0.4em', textAlign: 'center', fontSize: '24px', fontWeight: '800', outline: 'none' }}
                                />
                            </div>
                            <button disabled={loading} style={{ padding: '20px', background: loading ? 'rgba(255,255,255,0.1)' : themeBg, border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '0.1em', cursor: loading ? 'wait' : 'pointer', boxShadow: loading ? 'none' : `0 20px 40px -10px ${themeGlow}` }}>
                                {loading ? 'CONFIRMING...' : 'CONFIRM OTP NOW →'}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>New Password</label>
                                <input
                                    type="password" required placeholder="••••••••" minLength={8}
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <button disabled={loading} style={{ padding: '20px', background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #14b8a6)', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '0.1em', cursor: loading ? 'wait' : 'pointer', boxShadow: loading ? 'none' : '0 20px 40px -10px rgba(16, 185, 129, 0.4)' }}>
                                {loading ? 'UPDATING...' : 'UPDATE PASSWORD →'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
