import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const Orders = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('purchases');
    const [orders, setOrders] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) return;
                const user = JSON.parse(userRaw);

                // Fetch Pet Purchases
                const orderRes = await fetch(`${API_ENDPOINTS.GET_PURCHASES}&buyer_id=${user.user_id}`);
                const orderData = await orderRes.json();
                if (orderData.success) {
                    setOrders(orderData.orders || []);
                }

                // Fetch Appointments (Doctor + Spa)
                const apptRes = await fetch(`${API_ENDPOINTS.GET_APPOINTMENTS}?user_id=${user.user_id}`);
                const apptData = await apptRes.json();
                if (apptData.success) {
                    const allAppts = [...(apptData.upcoming || []), ...(apptData.completed || [])];
                    setAppointments(allAppts);
                }

            } catch (err) {
                console.error("Failed to fetch order/appt data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        const s = (status || '').toUpperCase();
        if (s === 'CONFIRMED' || s === 'DELIVERED' || s === 'SUCCESS' || s === 'COMPLETED') return '#10b981';
        if (s === 'BOOKED' || s === 'PENDING' || s === 'ACCEPTED') return '#FF8C00';
        if (s === 'REJECTED' || s === 'CANCELLED' || s === 'DECLINED') return '#f43f5e';
        return '#64748b';
    };

    const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: '12px 24px',
                borderRadius: '16px',
                border: 'none',
                background: activeTab === id ? '#0f172a' : 'transparent',
                color: activeTab === id ? 'white' : '#64748b',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === id ? '0 10px 20px rgba(15,23,42,0.15)' : 'none'
            }}
        >
            <span>{icon}</span> {label}
        </button>
    );

    return (
        <Shell role={role}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                            My <span style={{ color: '#FF8C00' }}>Activity.</span> 📑
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: '500', fontSize: '16px' }}>Track your pet adoptions and service bookings.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '20px', width: 'fit-content', marginBottom: '32px' }}>
                    <TabButton id="purchases" label="Pet Purchases" icon="🛒" />
                    <TabButton id="services" label="Doctor & Spas" icon="🩺" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', fontWeight: '600' }}>
                            <div style={{ fontSize: '30px', marginBottom: '10px' }} className="loading-dots">...</div>
                            Loading your activities...
                        </div>
                    ) : activeTab === 'purchases' ? (
                        orders.length > 0 ? orders.map((order: any, i: number) => (
                            <motion.div
                                key={order.transaction_id || i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '28px',
                                    padding: '24px',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                }}
                            >
                                <img
                                    src={order.photo_url ? (order.photo_url.startsWith('http') ? order.photo_url : ROOT_URL + order.photo_url) : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + order.pet_id}
                                    style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' }}
                                    alt={order.pet_name}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order #{order.transaction_id}</div>
                                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>{order.pet_name}</h3>
                                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>{order.breed} · Seller: {order.seller_name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>₹{Number(order.amount || 0).toLocaleString('en-IN')}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', marginTop: '4px' }}>{order.payment_method}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(order.payment_status) }} />
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: getStatusColor(order.payment_status) }}>{order.payment_status}</span>
                                            <span style={{ fontSize: '14px', color: '#e2e8f0', margin: '0 8px' }}>|</span>
                                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{new Date(order.transaction_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(order.payment_status === 'DELIVERED' || order.payment_status === 'SUCCESS' || order.payment_status === 'COMPLETED') && (
                                                <button onClick={() => navigate('/reviews')} style={{ padding: '10px 20px', borderRadius: '14px', background: '#FF8C00', border: 'none', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Review ⭐</button>
                                            )}
                                            <button onClick={() => navigate(`/pet/${order.pet_id}`)} style={{ padding: '10px 20px', borderRadius: '14px', background: '#F1F5F9', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>View Details</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '40px', border: '1px dashed #e2e8f0' }}>
                                <div style={{ fontSize: '60px', marginBottom: '24px' }}>📦</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>No pet orders yet</h3>
                                <p style={{ color: '#94a3b8', maxWidth: '300px', margin: '12px auto 32px auto', fontWeight: '500' }}>Start your pet parenting journey by exploring our marketplace.</p>
                                <button onClick={() => navigate('/marketplace')} style={{ padding: '16px 32px', borderRadius: '18px', background: 'linear-gradient(135deg, #FF8C00, #ff5e00)', color: 'white', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255,140,0,0.2)' }}>Shop Now 🐾</button>
                            </div>
                        )
                    ) : (
                        appointments.length > 0 ? appointments.map((appt: any, i: number) => (
                            <motion.div
                                key={appt.id || i}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '28px',
                                    padding: '24px',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: appt.type.includes('Doctor') ? '#ecfdf5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                    {appt.type.includes('Doctor') ? '🩺' : '✂️'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: appt.type.includes('Doctor') ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{appt.type}</div>
                                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>{appt.service_name}</h3>
                                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Provider: {appt.provider_name} · Pet: {appt.pet_name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>₹{appt.fee}</div>
                                            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '800', marginTop: '4px' }}>{appt.date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(appt.status) }} />
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: getStatusColor(appt.status) }}>{appt.status}</span>
                                            <span style={{ fontSize: '14px', color: '#e2e8f0', margin: '0 8px' }}>|</span>
                                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Time: {appt.time}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(appt.status === 'COMPLETED' || appt.status === 'SUCCESS') && (
                                                <button onClick={() => navigate('/reviews')} style={{ padding: '10px 20px', borderRadius: '14px', background: '#0F172A', border: 'none', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Review ⭐</button>
                                            )}
                                            <button onClick={() => navigate('/appointments')} style={{ padding: '10px 20px', borderRadius: '14px', background: appt.type.includes('Doctor') ? '#10b981' : '#f59e0b', border: 'none', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Manage Schedule</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div style={{ padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '40px', border: '1px dashed #e2e8f0' }}>
                                <div style={{ fontSize: '60px', marginBottom: '24px' }}>📅</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>No bookings found</h3>
                                <p style={{ color: '#94a3b8', maxWidth: '300px', margin: '12px auto 32px auto', fontWeight: '500' }}>Keep your pet healthy and happy with our professional services.</p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button onClick={() => navigate('/doctors')} style={{ padding: '14px 24px', borderRadius: '16px', background: '#ecfdf5', color: '#10b981', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Find Doctor 🩺</button>
                                    <button onClick={() => navigate('/spas')} style={{ padding: '14px 24px', borderRadius: '16px', background: '#fef3c7', color: '#f59e0b', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Find Spa ✂️</button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </Shell>
    );
};

export default Orders;
