import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const BuyerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [featuredPets, setFeaturedPets] = useState<any[]>([]);
    const [stats, setStats] = useState([
        { label: 'Pets Adopted', value: '0', emoji: '🏠', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
        { label: 'Wishlist', value: '0', emoji: '❤️', color: '#FF8C00', bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.15)' },
        { label: 'Transactions', value: 'History', emoji: '💳', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
    ]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);
            setUser(u);
            api.getDashboard('buyer', u.user_id).then(res => {
                if (res.success) {
                    setStats([
                        { label: 'Pets Adopted', value: (res.purchases || 0).toString(), emoji: '🏠', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                        { label: 'Wishlist', value: (res.wishlist || 0).toString(), emoji: '❤️', color: '#FF8C00', bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.15)' },
                        { label: 'Transactions', value: 'View Hist.', emoji: '💳', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
                    ]);
                }
            }).catch(console.error);

            // Fetch Featured Pets
            api.get(ROOT_URL + 'get_all_pet_listings.php').then(res => {
                if (res.success) {
                    const allPets = res.pets || res.listings || [];
                    const availableOnly = allPets.filter((p: any) => 
                        !p.availability_status || p.availability_status.toLowerCase() === 'available'
                    );
                    setFeaturedPets(availableOnly.slice(0, 6));
                }
            }).catch(console.error);
        }
    }, []);

    const services = [
        { title: 'Marketplace', desc: 'Find pets to adopt', emoji: '🛍️', path: '/marketplace', color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #ff5e00)' },
        { title: 'Veterinary', desc: 'Find certified doctors', emoji: '🩺', path: '/doctors', color: '#4B6CB7', bg: 'linear-gradient(135deg, #4B6CB7, #182848)' },
        { title: 'Pet Spa', desc: 'Professional grooming', emoji: '✂️', path: '/spas', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    ];

    return (
        <Shell role="buyer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                            Welcome back, <br />
                            <span style={{ color: '#FF8C00' }}>{user?.full_name?.split(' ')[0] || 'Buyer'}! 👋</span>
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500', marginTop: '8px' }}>
                            Your one-stop destination for pet care.
                        </p>
                    </div>
                </div>

                {/* Services Section (Matches App) */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>Our Services</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {services.map((svc, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }} onClick={() => navigate(svc.path)}
                                style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: svc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white', flexShrink: 0 }}>
                                    {svc.emoji}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{svc.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{svc.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>Your Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {stats.map((s, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }} onClick={() => {
                                if (s.label === 'Appointments') navigate('/appointments');
                                else if (s.label === 'Transactions') navigate('/transactions/buyer');
                                else if (s.label === 'Pets Adopted' || s.label === 'Wishlist') navigate('/orders');
                                else navigate('/profile');
                            }}
                                style={{ background: 'white', borderRadius: '24px', padding: '28px', border: `1px solid ${s.border}`, cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>
                                    {s.emoji}
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{s.value}</div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </Shell>
    );
};

export default BuyerDashboard;
