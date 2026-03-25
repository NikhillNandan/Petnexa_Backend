import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const BuyerAppointments = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppt, setSelectedAppt] = useState<any>(null);
    const [isPaying, setIsPaying] = useState(false);

    const handlePayExtra = async (method: string) => {
        if (!selectedAppt) return;
        setIsPaying(true);
        try {
            const formData = new FormData();
            formData.append('appointment_id', selectedAppt.id.toString());
            formData.append('payment_method', method);

            const res = await fetch(`${ROOT_URL}pay_extra_amount.php`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert(`Payment via ${method} recorded successfully!`);
                const newStatus = method === 'CASH' ? 'PAID_CASH' : 'PAID_UPI';
                setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, extra_payment_status: newStatus } : a));
                setSelectedAppt({ ...selectedAppt, extra_payment_status: newStatus });
            } else {
                alert('Payment error: ' + (data.error || 'Unknown problem.'));
            }
        } catch (e) {
            alert('Payment error. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) return;
                const user = JSON.parse(userRaw);
                const res = await fetch(`${API_ENDPOINTS.GET_APPOINTMENTS}?user_id=${user.user_id}`);
                const data = await res.json();
                if (data.success) {
                    const allAppts = [...(data.upcoming || []), ...(data.completed || [])];
                    setAppointments(allAppts);
                }
            } catch (err) {
                console.error("Failed to fetch appointments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filtered = appointments.filter((a: any) => {
        if (filter === 'All') return true;
        const s = a.status ? a.status.toLowerCase() : '';
        if (filter === 'Upcoming') return s.includes('book') || s.includes('pend') || s.includes('confirm') || s.includes('accept');
        if (filter === 'Completed') return s.includes('complet') || s.includes('done') || s.includes('cancel') || s.includes('decline');
        return true;
    });

    const getEmoji = (type: string) => type.toLowerCase().includes('doctor') ? '🩺' : '✂️';
    const getColor = (type: string) => type.toLowerCase().includes('doctor') ? '#10b981' : '#f59e0b';

    return (
        <Shell role={role}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                            My <span style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Schedules.</span> 📅
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Track and manage your upcoming vet visits and spa sessions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Upcoming', 'Completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '100px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: 'none',
                                    background: filter === f ? '#10b981' : 'white',
                                    color: filter === f ? 'white' : '#64748B',
                                    boxShadow: filter === f ? '0 8px 20px rgba(16,185,129,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? (
                            filtered.map((appt, i) => (
                                <motion.div
                                    key={appt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        background: 'white',
                                        borderRadius: '24px',
                                        padding: '24px 32px',
                                        border: '1px solid #F1F5F9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedAppt(appt)}
                                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '18px',
                                        background: `${getColor(appt.type)}12`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '28px',
                                        flexShrink: 0
                                    }}>
                                        {getEmoji(appt.type)}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{appt.type}</h3>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: appt.status && appt.status.toLowerCase().includes('book') ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                                                borderRadius: '100px',
                                                color: appt.status && appt.status.toLowerCase().includes('book') ? '#10b981' : '#64748B',
                                                fontSize: '10px',
                                                fontWeight: '800',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase'
                                            }}>
                                                {appt.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                                            <span>👤 {appt.provider_name}</span>
                                            {appt.service_name && <span>⭐ {appt.service_name}</span>}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', paddingRight: '24px', borderRight: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Schedule</div>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{appt.date}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748B' }}>at {appt.time}</div>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: getColor(appt.type), marginBottom: '4px' }}>₹{appt.fee}</div>
                                        {appt.status && (appt.status.toLowerCase().includes('complet') || appt.status.toLowerCase().includes('done')) ? (
                                            <button
                                                onClick={() => navigate('/reviews')}
                                                style={{ color: '#10b981', fontSize: '11px', fontWeight: '900', background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                            >
                                                Write Review ✍️
                                            </button>
                                        ) : (
                                            <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Confirmed Session
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px dashed #E2E8F0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>Empty</div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>No appointments found</h3>
                                <p style={{ color: '#94A3B8' }}>Try choosing another filter or book a new session.</p>
                                <button onClick={() => navigate('/doctors')} style={{ marginTop: '24px', padding: '12px 24px', background: '#10b981', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Book with Doc 🩺</button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {selectedAppt && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                            >
                                <div style={{ padding: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>Service Details</h2>
                                        <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>✕</button>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '8px' }}>Provider</div>
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{selectedAppt.provider_name}</div>
                                        <div style={{ fontSize: '14px', color: '#475569' }}>{selectedAppt.service_name} • {selectedAppt.date} at {selectedAppt.time}</div>
                                    </div>

                                    {selectedAppt.extra_payment_status === 'PENDING' && (
                                        <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '24px', padding: '24px', marginBottom: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <div style={{ fontSize: '24px' }}>💡</div>
                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>Additional Service Fee</div>
                                                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#9a3412' }}>₹{selectedAppt.extra_paid_amount}</div>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#c2410c', marginBottom: '16px', fontWeight: '600' }}>The provider has requested an additional fee for extra services or medications provided during the visit.</p>
                                            
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button onClick={() => handlePayExtra('CASH')} disabled={isPaying} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: '#ea580c', color: 'white', border: 'none', fontWeight: '800', cursor: isPaying ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                                    {isPaying ? 'Processing...' : 'Pay with Cash 💵'}
                                                </button>
                                                <button onClick={() => handlePayExtra('UPI')} disabled={isPaying} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: '#0F172A', color: 'white', border: 'none', fontWeight: '800', cursor: isPaying ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                                                    {isPaying ? 'Processing...' : 'Pay with UPI 📱'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedAppt.extra_payment_status && selectedAppt.extra_payment_status !== 'PENDING' && (
                                        <div style={{ background: '#ecfdf5', borderRadius: '24px', padding: '20px', border: '1px solid #10b98130', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#10b981' }}>✓</div>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    {selectedAppt.extra_payment_status.includes('CASH') ? 'Paid via Cash' : selectedAppt.extra_payment_status.includes('UPI') ? 'Paid via UPI' : 'Payment Confirmed'}
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '900', color: '#064e3b' }}>₹{selectedAppt.extra_paid_amount} Extra Paid</div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={() => setSelectedAppt(null)} style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: '800', cursor: 'pointer' }}>Close</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};

export default BuyerAppointments;
