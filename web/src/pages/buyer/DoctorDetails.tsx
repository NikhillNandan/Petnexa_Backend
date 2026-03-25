import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shell } from '../../components/Shell';

import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const DoctorDetails = ({ role = 'buyer' }: { role?: string }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('about');
    const [scrolled, setScrolled] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                // Fetch Doctor Info
                const r = await fetch(`${ROOT_URL}get_doctors.php`);
                const res = await r.json();
                if (res.status === 'success') {
                    const found = res.doctors.find((d: any) => d.user_id === Number(id));
                    if (found) {
                        const doctorData = {
                            ...found,
                            name: found.full_name,
                            specialty: found.specialization,
                            exp: `${found.experience} Years`,
                            rating: found.avg_rating || 0.0,
                            reviews: found.review_count || 0,
                            location: found.city,
                            fee: found.fee || 500,
                            img: found.profile_image ? (found.profile_image.startsWith('http') ? found.profile_image : ROOT_URL + found.profile_image) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${found.full_name}`,
                            lang: found.languages ? found.languages.split(',') : ['English'],
                            description: found.about || `Dr. ${found.full_name} is a dedicated veterinary professional with ${found.experience} years of experience in ${found.specialization}.`,
                            clinicAddress: found.address,
                            phone: found.phone || '+91 98765 43210',
                            workingHours: 'Mon - Sat: 10:00 AM - 07:00 PM',
                            reviewsList: []
                        };

                        // Fetch Reviews for this doctor
                        const revRes = await fetch(`${ROOT_URL}review.php?action=get&target_id=${id}&type=doctor`);
                        const revData = await revRes.json();
                        if (revData.success) {
                            doctorData.reviewsList = revData.reviews.map((rev: any) => ({
                                id: rev.review_id,
                                user: rev.reviewer_name,
                                rating: rev.rating,
                                comment: rev.review_text,
                                date: new Date(rev.created_at).toLocaleDateString()
                            }));
                        }
                        setDoctor(doctorData);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoctor();

        const handleScroll = () => setScrolled(window.scrollY > 200);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    if (!doctor) return null;

    return (
        <Shell role={role}>
            <style>{`
                .header-gradient {
                    background: linear-gradient(135deg, #10b981, #059669);
                    height: 320px;
                    border-radius: 0 0 40px 40px;
                    padding: 40px;
                    color: white;
                    position: relative;
                    margin: -24px -24px 0 -24px;
                }
                .doctor-card-overlay {
                    background: white;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                    margin-top: -80px;
                    position: relative;
                    z-index: 10;
                    border: 1px solid #f1f5f9;
                }
                .tab-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-family: 'Outfit', sans-serif;
                }
                .tab-btn.active {
                    background: #f0fdf4;
                    color: #10b981;
                }
                .sticky-bottom {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
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
                {/* Header Section */}
                <div className="header-gradient">
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', cursor: 'pointer', marginBottom: '20px' }}>← Back</button>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '32px', border: '4px solid rgba(255,255,255,0.3)', overflow: 'hidden', background: 'white' }}>
                            <img src={doctor.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                Trusted Professional
                            </div>
                            <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0 }}>{doctor.name}</h1>
                            <p style={{ fontSize: '18px', opacity: 0.9 }}>{doctor.specialty} · {doctor.location}</p>
                        </div>
                    </div>
                </div>

                {/* Info Card Overlay */}
                <div className="doctor-card-overlay">
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <div onClick={() => navigate(`/reviews?targetId=${id}&type=doctor&name=${doctor.name}`)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{doctor.rating} ⭐</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: '4px', textDecoration: 'underline' }}>{doctor.reviews} Reviews</div>
                        </div>
                        <div style={{ width: '1px', background: '#f1f5f9' }} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{doctor.exp}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>Experience</div>
                        </div>
                        <div style={{ width: '1px', background: '#f1f5f9' }} />
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>₹{doctor.fee}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>Per Consultation</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button onClick={() => navigate('/messages')} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#e0f2fe', border: 'none', fontWeight: '700', cursor: 'pointer', color: '#0369a1' }}>💬 Chat Now</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '32px', marginBottom: '24px' }}>
                    <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About Doctor</button>
                    <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>User Reviews</button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'about' ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="about">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Biographical Sketch</h3>
                                    <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>{doctor.description}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Education</h3>
                                        <div style={{ color: '#64748b', fontSize: '15px' }}>{doctor.qualification}</div>
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Languages</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {doctor.lang.map((l: string) => (
                                                <span key={l} style={{ padding: '4px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Clinic Information</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏥</div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{doctor.hospital}</div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>{doctor.clinicAddress}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⏰</div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Working Hours</div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>{doctor.workingHours}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="reviews">
                            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                                {doctor.reviewsList.map((rev: any) => (
                                    <div key={rev.id} style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '800', color: '#0f172a' }}>{rev.user}</span>
                                            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{rev.date}</span>
                                        </div>
                                        <div style={{ color: '#f59e0b', marginBottom: '8px' }}>{'⭐'.repeat(rev.rating)}</div>
                                        <p style={{ color: '#64748b', margin: 0 }}>{rev.comment}</p>
                                    </div>
                                ))}
                                {doctor.reviewsList.length > 0 && (
                                    <button onClick={() => navigate(`/reviews?targetId=${id}&type=doctor&name=${doctor.name}`)} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#10b981', fontWeight: '800', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>View All Reviews →</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sticky Bottom Bar */}
                <div className="sticky-bottom">
                    <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Starting from</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>₹{doctor.fee}</div>
                    </div>
                    <button onClick={() => navigate(role === 'buyer' ? `/book/doctor/${id}` : `/seller/book/doctor/${id}`)} style={{ padding: '16px 40px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16,185,129,0.3)' }}>
                        Book Appointment Now →
                    </button>
                </div>
            </div>
        </Shell>
    );
};

export default DoctorDetails;
