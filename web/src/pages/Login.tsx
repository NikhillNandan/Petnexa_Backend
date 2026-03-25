import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const themeColor = '#FF8C00';
    const themeGlow = 'rgba(255,140,0,0.3)';
    const themeBg = 'linear-gradient(135deg, #FF8C00, #FFA500)';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({ email, password });
            if (res.success) {
                // Save user info
                localStorage.setItem('user', JSON.stringify(res.user));
                const userRole = res.user.role.toLowerCase();
                localStorage.setItem('role', userRole);
                navigate(`/dashboard/${userRole}`);
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Please check your network.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field: string): React.CSSProperties => ({
        width: '100%',
        padding: '18px 20px 18px 56px',
        background: focusedField === field ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focusedField === field ? themeColor + '60' : 'rgba(255,255,255,0.10)'}`,
        borderRadius: '16px',
        color: 'white',
        fontSize: '15px',
        fontWeight: '500',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: "'Outfit', system-ui, sans-serif",
        boxShadow: focusedField === field ? `0 0 0 4px ${themeColor}15` : 'none',
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #020617 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #1e293b inset !important; -webkit-text-fill-color: white !important; }
                .login-btn:hover { transform: scale(1.02); }
                .login-btn:active { transform: scale(0.98); }
            `}</style>

            {/* Ambient Glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-30%', left: '-20%',
                    width: '700px', height: '700px',
                    background: `radial-gradient(circle, ${themeGlow} 0%, transparent 70%)`,
                    borderRadius: '50%', animation: 'pulse 5s ease infinite',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                style={{
                    width: '100%', maxWidth: '480px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '32px',
                    backdropFilter: 'blur(40px)',
                    overflow: 'hidden',
                    position: 'relative', zIndex: 10,
                    boxShadow: '0 60px 120px -30px rgba(0,0,0,0.5)',
                }}
            >
                <div style={{ height: '3px', background: themeBg }} />

                <div style={{ padding: '48px 44px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '14px',
                            marginBottom: '24px',
                        }}>
                            <img src="/logo.png" alt="PetNexa Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                            <div>
                                <p style={{ color: themeColor, fontSize: '11px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    PetNexa Hub
                                </p>
                                <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em' }}>
                                    Secure Authentication
                                </p>
                            </div>
                        </div>
                        <h1 style={{
                            fontSize: '44px', fontWeight: '900',
                            color: 'white', letterSpacing: '-0.04em',
                            lineHeight: '1', marginBottom: '12px',
                        }}>
                            Welcome<br />Back.
                        </h1>
                        <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '15px', fontWeight: '400', lineHeight: '1.5' }}>
                            Sign in to access your dashboard.
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '16px',
                            color: '#fca5a5',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ fontSize: '18px' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>✉️</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="your@email.com"
                                    style={inputStyle('email')}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ color: 'rgba(148,163,184,0.6)', fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔐</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="••••••••"
                                    style={{ ...inputStyle('password'), paddingRight: '56px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '16px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'rgba(148,163,184,0.5)', fontSize: '18px',
                                        lineHeight: 1,
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: themeColor }} />
                                <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '13px', fontWeight: '500' }}>Remember me</span>
                            </label>
                            <Link to="/forgot-password" style={{ color: themeColor, fontSize: '12px', fontWeight: '700', textDecoration: 'none', letterSpacing: '0.05em' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn"
                            style={{
                                width: '100%',
                                padding: '20px',
                                background: loading ? 'rgba(255,255,255,0.1)' : themeBg,
                                border: 'none',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '13px', fontWeight: '800',
                                letterSpacing: '0.2em', textTransform: 'uppercase',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                marginTop: '8px',
                                fontFamily: "'Outfit', system-ui",
                                boxShadow: loading ? 'none' : `0 20px 40px -10px ${themeGlow}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In to PetNexa Hub →'
                            )}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em' }}>NEW TO PETNEXA?</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    </div>

                    <Link
                        to="/signup"
                        style={{
                            display: 'block', textAlign: 'center',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            color: 'white',
                            fontSize: '13px', fontWeight: '700',
                            textDecoration: 'none',
                            letterSpacing: '0.1em',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Create Your Free Account ✨
                    </Link>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(148,163,184,0.4)', marginTop: '24px', fontWeight: '500' }}>
                        By continuing, you agree to our <Link to="/terms" style={{ color: themeColor, textDecoration: 'none', fontWeight: '700' }}>Terms</Link> & <Link to="/privacy" style={{ color: themeColor, textDecoration: 'none', fontWeight: '700' }}>Privacy Policy</Link>
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '28px' }}>
                        {['🔐 AES-256', '✅ Trusted', '🇮🇳 India Secure'].map(badge => (
                            <span key={badge} style={{ color: 'rgba(71,85,105,0.6)', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
