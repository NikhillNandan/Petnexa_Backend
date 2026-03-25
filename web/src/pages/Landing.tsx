import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = localStorage.getItem('role') || user.role?.toLowerCase();
                if (role) {
                    navigate(`/dashboard/${role}`);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%',
                    width: '800px', height: '800px',
                    background: 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-10%',
                    width: '700px', height: '700px',
                    background: 'radial-gradient(circle, rgba(255,140,0,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Navigation Header */}
            <header style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '32px 64px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src="/logo.png" alt="PetNexa Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '24px', fontWeight: '950', color: 'white', letterSpacing: '-0.04em' }}>PetNexa</span>
                </div>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {/* Auth options removed as requested */}
                </div>
            </header>

            <div style={{
                maxWidth: '1400px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1.1fr',
                gap: '80px',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10,
            }}>
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 24px',
                        background: 'rgba(255,140,0,0.1)',
                        borderRadius: '100px',
                        border: '1px solid rgba(255,140,0,0.2)',
                        color: '#FF8C00',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: '32px',
                    }}>
                        <span style={{ fontSize: '16px' }}>✨</span> India's Premier Pet Hub
                    </div>
                    
                    <h1 style={{
                        fontSize: 'clamp(48px, 6vw, 84px)',
                        fontWeight: '950',
                        color: 'white',
                        lineHeight: '0.95',
                        letterSpacing: '-0.05em',
                        marginBottom: '32px',
                    }}>
                        Unify Your <br />
                        <span style={{ 
                            background: 'linear-gradient(135deg, #FF8C00, #FFA500)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent' 
                        }}>Pet World.</span>
                    </h1>
                    
                    <p style={{
                        fontSize: '20px',
                        color: 'rgba(148, 163, 184, 0.7)',
                        lineHeight: '1.6',
                        marginBottom: '48px',
                        maxWidth: '540px',
                        fontWeight: '500',
                    }}>
                        The all-in-one ecosystem for Pet Parents, Doctors, Sellers, and Spas. Manage everything from pet listings to health records in one premium dashboard.
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => navigate('/signup')}
                            style={{
                                padding: '24px 56px',
                                background: 'linear-gradient(135deg, #FF8C00, #ff5e00)',
                                border: 'none',
                                borderRadius: '24px',
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                boxShadow: '0 24px 48px -12px rgba(255,140,0,0.5)',
                                transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-6px) scale(1.02)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 32px 64px -16px rgba(255,140,0,0.6)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 24px 48px -12px rgba(255,140,0,0.5)';
                            }}
                        >
                            Get Started
                            <span style={{ fontSize: '20px' }}>→</span>
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 60 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        position: 'relative',
                        borderRadius: '48px',
                        overflow: 'hidden',
                        boxShadow: '0 100px 180px -60px rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <img 
                            src="/petnexa_hero_ultimate.png" 
                            alt="PetNexa Ecosystem Illustration" 
                            style={{ 
                                width: '100%', 
                                height: 'auto', 
                                display: 'block',
                                transform: 'scale(1.02)',
                            }} 
                        />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(2,6,23,0.3), transparent)',
                        }} />
                    </div>
                    
                </motion.div>
            </div>
        </div>
    );
};

export default Landing;
