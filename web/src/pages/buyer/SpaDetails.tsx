import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shell } from '../../components/Shell';

import { ROOT_URL } from '../../utils/constants';
import { api } from '../../utils/api';

const SpaDetails = ({ role = 'buyer' }: { role?: string }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [spa, setSpa] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('about');
    const [activeImg, setActiveImg] = useState(0);
    const [scrolled, setScrolled] = useState(false); // Added for the scroll effect
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        fetch(`${ROOT_URL}get_spa_details.php?user_id=${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    const s = res.spa;
                    setSpa({
                        ...s,
                        name: s.spa_name,
                        location: s.city,
                        img: s.profile_image ? (s.profile_image.startsWith('http') ? s.profile_image : ROOT_URL + s.profile_image) : 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
                        rating: s.avg_rating || 0.0,
                        reviews: s.review_count,
                        phone: s.phone || '+91 96543 21098',
                        servicesList: res.services.map((svc: any) => ({
                            id: svc.service_id,
                            name: svc.service_name,
                            price: svc.price,
                            duration: svc.duration || `${svc.duration_minutes} min`,
                            desc: svc.description
                        })),
                        reviewsList: res.reviews.map((rev: any) => ({
                            id: rev.review_id,
                            user: rev.reviewer_name,
                            rating: rev.rating,
                            comment: rev.review_text,
                            date: new Date(rev.created_at).toLocaleDateString()
                        }))
                    });
                }
            })
            .catch(console.error);

        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    if (!spa) return null;

    return (
        <Shell role={role}>
            <style>{`
                .hero-section {
                    height: 400px;
                    border-radius: 32px;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 32px;
                }
                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(15,23,42,0.9), transparent 70%);
                }
                .stats-overlay {
                    background: white;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    margin-top: -60px;
                    position: relative;
                    z-index: 10;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    border: 1px solid #f1f5f9;
                }
                .stat-item {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .sticky-bottom {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 16px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
                    z-index: 100;
                    border-top: 1px solid #f1f5f9;
                }
            `}</style>

            <div style={{ paddingBottom: '100px' }}>
                {/* Hero Section */}
                <div className="hero-section">
                    <img src={spa.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="hero-overlay" />

                    <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>← Back</button>

                    <div style={{ position: 'absolute', bottom: '80px', left: '32px', right: '32px', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '20px', border: '3px solid white', overflow: 'hidden', background: 'white' }}>
                                <img src={spa.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>{spa.name}</h1>
                                <p style={{ fontSize: '16px', opacity: 0.9 }}>{spa.subtitle}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="stats-overlay" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-item" onClick={() => navigate(`/reviews?targetId=${id}&type=spa&name=${spa.name}`)} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon" style={{ background: '#fef3c7' }}>⭐</div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{spa.rating}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textDecoration: 'underline' }}>{spa.reviews} Reviews</span>
                    </div>
                    <div style={{ width: '1px', background: '#f1f5f9' }} />
                    <div className="stat-item">
                        <div className="stat-icon" style={{ background: '#fef2f2' }}>🏆</div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{spa.experience}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Experience</span>
                    </div>
                    <div style={{ width: '1px', background: '#f1f5f9' }} />
                    <div className="stat-item">
                        <div className="stat-icon" style={{ background: '#f0f9ff' }}>📍</div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{spa.location}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Location</span>
                    </div>
                    <div style={{ width: '1px', background: '#f1f5f9' }} />
                    <div className="stat-item">
                        <div className="stat-icon" style={{ background: '#ecfdf5' }}>🕐</div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{spa.openHours}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Open Hours</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>💬 Chat</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', marginTop: '32px', marginBottom: '24px' }}>
                    {['about', 'reviews'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: 'transparent',
                                fontWeight: '800',
                                cursor: 'pointer',
                                color: activeTab === tab ? '#f59e0b' : '#94a3b8',
                                borderBottom: activeTab === tab ? '3px solid #f59e0b' : 'none',
                                textTransform: 'uppercase',
                                fontSize: '13px',
                                letterSpacing: '0.1em'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'about' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="about">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {/* About Us */}
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>About Us</h3>
                                    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>{spa.description}</p>
                                </div>

                                {/* Services */}
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Services & Pricing</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {spa.servicesList.map((service: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{service.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{service.duration}</div>
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b' }}>₹{service.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Location & Hours</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</div>
                                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{spa.address}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '100px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🕐</div>
                                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{spa.openHours}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="reviews">
                            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                {spa.reviewsList.map((rev: any) => (
                                    <div key={rev.id} style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '800', color: '#0f172a' }}>{rev.user}</span>
                                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{rev.date}</span>
                                        </div>
                                        <div style={{ color: '#f59e0b', marginBottom: '8px' }}>{'⭐'.repeat(rev.rating)}</div>
                                        <p style={{ color: '#64748b', margin: 0 }}>{rev.comment}</p>
                                    </div>
                                ))}
                                {spa.reviewsList.length > 0 && (
                                    <button onClick={() => navigate(`/reviews?targetId=${id}&type=spa&name=${spa.name}`)} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#fef3c7', border: 'none', color: '#f59e0b', fontWeight: '800', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>View All Reviews →</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Bar */}
                <div className="sticky-bottom">
                    <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Starting from</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>₹{spa.price}</div>
                    </div>
                    <button onClick={() => navigate(role === 'buyer' ? `/book/spa/${id}` : `/seller/book/spa/${id}`)} style={{ padding: '16px 48px', borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(245,158,11,0.3)' }}>
                        Book Now →
                    </button>
                </div>
            </div>
        </Shell>
    );
};

export default SpaDetails;
