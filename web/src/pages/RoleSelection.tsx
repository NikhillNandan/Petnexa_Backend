import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const roles = [
    {
        id: 'buyer',
        title: 'Pet Lover',
        subtitle: 'Buyer / Explorer',
        description: "India's most curated pet marketplace. Find your perfect lifelong companion.",
        emoji: '🐾',
        color: '#FF8C00',
        glow: 'rgba(255,140,0,0.4)',
        bg: 'linear-gradient(135deg, #FF8C00, #FFA500)',
    },
    {
        id: 'seller',
        title: 'Pet Seller',
        subtitle: 'Trusted Merchant',
        description: 'Premium command center for pet professionals. Reach millions of buyers.',
        emoji: '🏪',
        color: '#ec4899',
        glow: 'rgba(236,72,153,0.4)',
        bg: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    },
    {
        id: 'doctor',
        title: 'Veterinarian',
        subtitle: 'Medical Expert',
        description: 'High-fidelity clinical suite. Next-generation patient telemetry & scheduling.',
        emoji: '🩺',
        color: '#10b981',
        glow: 'rgba(16,185,129,0.4)',
        bg: 'linear-gradient(135deg, #10b981, #14b8a6)',
    },
    {
        id: 'spa',
        title: 'Spa & Grooming',
        subtitle: 'Wellness Studio',
        description: 'Luxury pet wellness experiences. Deliver the finest grooming services in India.',
        emoji: '✂️',
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.4)',
        bg: 'linear-gradient(135deg, #f59e0b, #f97316)',
    }
];

const RoleSelection = () => {
    const { mode } = useParams<{ mode?: string }>();
    const navigate = useNavigate();
    const [hoveredRole, setHoveredRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const isSignup = mode === 'signup';

    useEffect(() => {
        setTimeout(() => setMounted(true), 100);
    }, []);

    const handleRoleClick = (roleId: string) => {
        if (isSignup) {
            navigate(`/signup/${roleId}`);
        } else {
            navigate(`/login/${roleId}`);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
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
                    position: 'absolute', top: '-20%', right: '-10%',
                    width: '800px', height: '800px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 6s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', left: '-10%',
                    width: '700px', height: '700px',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 8s ease-in-out infinite 2s',
                }} />
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .role-card { transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); cursor: pointer; }
                .role-card:hover { transform: translateY(-20px) scale(1.04) !important; }
            `}</style>

            {/* Header */}
            <div style={{
                textAlign: 'center', marginBottom: '80px',
                animation: 'fadeInUp 0.8s ease forwards',
                position: 'relative', zIndex: 10,
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '8px 24px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    color: '#FF8C00',
                    fontSize: '11px', fontWeight: '800',
                    letterSpacing: '0.3em', textTransform: 'uppercase',
                    marginBottom: '32px',
                    backdropFilter: 'blur(10px)',
                }}>
                    <span style={{ width: '6px', height: '6px', background: '#FF8C00', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    PetNexa India — Experience Excellence
                </div>

                <h1 style={{
                    fontSize: 'clamp(52px, 8vw, 100px)',
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: '-0.05em',
                    lineHeight: '0.9',
                    marginBottom: '24px',
                }}>
                    India's Most<br />
                    <span style={{
                        background: 'linear-gradient(90deg, #FF8C00, #ff5e00, #f59e0b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Elite Pet
                    </span>{' '}
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>Ecosystem.</span>
                </h1>

                <p style={{
                    color: 'rgba(148,163,184,0.8)',
                    fontSize: '20px',
                    fontWeight: '400',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6',
                }}>
                    Select your role to {isSignup ? 'register for' : 'enter'} your personalized portal. Each experience is crafted for your specific needs.
                </p>
            </div>

            {/* Role Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
                width: '100%',
                maxWidth: '1200px',
                position: 'relative', zIndex: 10,
            }}>
                {roles.map((role, index) => (
                    <div
                        key={role.id}
                        className="role-card"
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        onClick={() => handleRoleClick(role.id)}
                        style={{
                            background: hoveredRole === role.id
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${hoveredRole === role.id ? role.color + '60' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '32px',
                            padding: '40px 32px',
                            animation: `fadeInUp 0.8s ease forwards ${index * 0.1 + 0.3}s`,
                            opacity: 0,
                            backdropFilter: 'blur(20px)',
                            boxShadow: hoveredRole === role.id
                                ? `0 40px 80px -20px ${role.glow}, 0 0 0 1px ${role.color}30`
                                : '0 20px 40px -10px rgba(0,0,0,0.3)',
                            position: 'relative', overflow: 'hidden',
                        }}
                    >
                        {/* Shimmer effect on hover */}
                        {hoveredRole === role.id && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: `linear-gradient(90deg, transparent, ${role.color}10, transparent)`,
                                animation: 'shimmer 1.5s infinite',
                                pointerEvents: 'none',
                            }} />
                        )}

                        {/* Icon */}
                        <div style={{
                            width: '72px', height: '72px',
                            borderRadius: '22px',
                            background: role.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px',
                            marginBottom: '28px',
                            boxShadow: `0 20px 40px -10px ${role.glow}`,
                            transition: 'transform 0.5s ease',
                            transform: hoveredRole === role.id ? 'rotate(10deg) scale(1.1)' : 'none',
                        }}>
                            {role.emoji}
                        </div>

                        {/* Label */}
                        <div style={{
                            fontSize: '10px', fontWeight: '800',
                            letterSpacing: '0.3em', textTransform: 'uppercase',
                            color: role.color, marginBottom: '8px',
                        }}>
                            {role.subtitle}
                        </div>

                        {/* Title */}
                        <h3 style={{
                            fontSize: '28px', fontWeight: '900',
                            color: 'white', letterSpacing: '-0.02em',
                            marginBottom: '12px',
                            lineHeight: '1.1',
                        }}>
                            {role.title}
                        </h3>

                        {/* Description */}
                        <p style={{
                            color: 'rgba(148,163,184,0.7)',
                            fontSize: '14px', lineHeight: '1.6',
                            marginBottom: '32px',
                            fontWeight: '400',
                        }}>
                            {role.description}
                        </p>

                        {/* CTA */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: hoveredRole === role.id ? role.color : 'rgba(255,255,255,0.3)',
                            fontSize: '11px', fontWeight: '800',
                            letterSpacing: '0.2em', textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                        }}>
                            {isSignup ? 'Register Now' : 'Enter Portal'}
                            <span style={{
                                transition: 'transform 0.3s ease',
                                transform: hoveredRole === role.id ? 'translateX(6px)' : 'none',
                                display: 'inline-block',
                            }}>→</span>
                        </div>

                        {/* Bottom accent bar */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '3px',
                            background: role.bg,
                            opacity: hoveredRole === role.id ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            borderRadius: '0 0 32px 32px',
                        }} />
                    </div>
                ))}
            </div>

            {/* Footer Trust Badges */}
            <div style={{
                marginTop: '80px', position: 'relative', zIndex: 10,
                display: 'flex', flexWrap: 'wrap', gap: '40px',
                justifyContent: 'center', alignItems: 'center',
                animation: 'fadeInUp 1s ease forwards 1s', opacity: 0,
            }}>
                {[
                    { icon: '🔐', label: 'AES-256 Encrypted', sub: 'Bank-level Security' },
                    { icon: '🇮🇳', label: 'Made in India', sub: 'Powered by Indian Innovation' },
                    { icon: '✅', label: 'Trusted Sellers', sub: 'Breeder Certified' },
                ].map((badge) => (
                    <div key={badge.label} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>
                                {badge.label}
                            </p>
                            <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px', fontWeight: '600', letterSpacing: '0.05em' }}>
                                {badge.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{
                marginTop: '40px', color: 'rgba(71,85,105,0.6)',
                fontSize: '11px', fontWeight: '700',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                position: 'relative', zIndex: 10,
                animation: 'fadeInUp 1s ease forwards 1.2s', opacity: 0,
            }}>
                PetNexa © 2026 — India's No.1 Pet Platform
            </p>
        </div>
    );
};

export default RoleSelection;
