import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const SellerDashboard = ({ view = 'dashboard' }: { view?: string }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Active Listings', value: '0', emoji: '📦', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
        { label: 'Total Earnings', value: '₹0', emoji: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
        { label: 'Market Rating', value: '0.0★', emoji: '⭐', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
    ]);
    const [orders, setOrders] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);

            // Stats
            api.getDashboard('seller', u.user_id).then(res => {
                if (res.success) {
                    setStats([
                        { label: 'Active Listings', value: res.active_listings.toString(), emoji: '📦', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
                        { label: 'Total Earnings', value: `₹${res.total_earnings.toLocaleString()}`, emoji: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                        { label: 'Market Rating', value: `${res.avg_rating || 0}★ (${res.review_count || 0})`, emoji: '⭐', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
                    ]);
                }
            }).catch(console.error);

            // Orders
            setLoading(true);
            api.getSellerOrders(u.user_id).then(res => {
                if (res.success) {
                    setAllOrders(res.orders || []);
                    setOrders(res.orders || []);
                    
                    // Recalculate Earnings (Completed only)
                    const completedTotal = (res.orders || []).filter((o: any) => 
                        ['CONFIRMED', 'SUCCESS', 'COMPLETED'].includes(o.payment_status.toUpperCase())
                    ).reduce((acc: number, o: any) => acc + Number(o.amount || 0), 0);
                    
                    setStats(prev => prev.map(s => 
                        s.label === 'Total Earnings' ? { ...s, value: `₹${completedTotal.toLocaleString('en-IN')}` } : s
                    ));
                }
            }).finally(() => setLoading(false));
        }
    }, []);

    useEffect(() => {
        if (filter === 'ALL') {
            setOrders(allOrders);
        } else {
            setOrders(allOrders.filter(o => o.payment_status.toUpperCase() === filter));
        }
    }, [filter, allOrders]);

    const handleOrderAction = async (transactionId: number, action: string) => {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const formData = new URLSearchParams();
            formData.append('transaction_id', transactionId.toString());
            formData.append('seller_id', u.user_id.toString());

            const res = await fetch(`${ROOT_URL}pet_order.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert(`Order ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully!`);
                // Refresh orders
                api.getSellerOrders(u.user_id).then(res => {
                    if (res.success) setAllOrders(res.orders || []);
                });
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        }
    };

    const statusColor: any = { 'CONFIRMED': '#10b981', 'SUCCESS': '#10b981', 'PENDING': '#f59e0b', 'REJECTED': '#ef4444', 'BOOKED': '#f59e0b' };
    const statusBg: any = { 'CONFIRMED': 'rgba(16,185,129,0.1)', 'SUCCESS': 'rgba(16,185,129,0.1)', 'PENDING': 'rgba(245,158,11,0.1)', 'REJECTED': 'rgba(239,68,68,0.1)', 'BOOKED': 'rgba(245,158,11,0.1)' };

    const renderOrdersList = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Purchase <span style={{ color: '#6366f1' }}>Orders.</span> 📦
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>Manage your inventory sales and shipping status.</p>
                </div>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '4px' }}>
                    {['ALL', 'BOOKED', 'CONFIRMED', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: filter === f ? '#ec4899' : 'transparent',
                                color: filter === f ? 'white' : '#64748B',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.length > 0 ? orders.map((order, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', overflow: 'hidden' }}>
                            {order.photo_url ? (
                                <img src={order.photo_url.startsWith('http') ? order.photo_url : ROOT_URL + order.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            ) : (
                                order.species === 'Dog' ? '🐕' : '🐈'
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ORDER #{order.transaction_id}</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{order.pet_name} — {order.breed}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>₹{order.amount.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>{order.payment_method}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F8FAFC' }}>
                                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                                    <div>👤 <span style={{ fontWeight: '700', color: '#0F172A' }}>{order.buyer_name}</span></div>
                                    <div style={{ marginTop: '4px' }}>📅 Ordered on {new Date(order.transaction_date).toLocaleDateString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        fontSize: '11px', fontWeight: '900', padding: '6px 14px', borderRadius: '100px',
                                        background: statusBg[order.payment_status.toUpperCase()] || 'rgba(148,163,184,0.1)',
                                        color: statusColor[order.payment_status.toUpperCase()] || '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '8px'
                                    }}>{order.payment_status}</div>

                                    {order.payment_status.toUpperCase() === 'BOOKED' && (
                                        <>
                                            <button
                                                onClick={() => handleOrderAction(order.transaction_id, 'reject')}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleOrderAction(order.transaction_id, 'confirm')}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                                            >
                                                Confirm
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #F1F5F9', color: '#94A3B8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{loading ? 'Fetching orders...' : 'No orders found matching this filter.'}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderEarningsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                    Earnings <span style={{ color: '#10b981' }}>Report.</span> 💰
                </h1>
                <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>Breakdown of your sales revenue and earnings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {stats.map(s => (
                    <div key={s.label} onClick={() => navigate('/seller/earnings')} style={{ background: 'white', padding: '24px', borderRadius: '24px', border: `1px solid ${s.border}`, cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '32px' }}>Recent Transactions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.length > 0 ? orders.map((o, idx) => (
                        <div key={idx} onClick={() => navigate('/seller/earnings')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#F8FAFC', borderRadius: '16px', cursor: 'pointer' }}>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{o.pet_name || o.breed} Sale</div>
                                <div style={{ fontSize: '12px', color: '#64748B' }}>{o.transaction_date.split(' ')[0]} • <span style={{fontWeight: '700'}}>{o.payment_method}</span></div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: o.payment_status === 'CONFIRMED' ? '#10b981' : '#f59e0b' }}>
                                {o.payment_status === 'CONFIRMED' ? '+' : ''}₹{o.amount.toLocaleString()}
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                            <p style={{ fontSize: '14px', fontWeight: '500' }}>No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Seller <span style={{ color: '#6366f1' }}>Dashboard.</span> 🏪
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>Manage your listings and track your pet sales performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/seller/add-listing')}
                        style={{ padding: '12px 24px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236,72,153,0.2)' }}
                    >
                        Add Listing +
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                            if (s.label === 'Active Listings') navigate('/seller/listings');
                            else navigate('/seller/earnings');
                        }}
                        style={{
                            background: 'white',
                            padding: '28px',
                            borderRadius: '24px',
                            border: `1px solid ${s.border}`,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                {s.emoji}
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{s.value}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Orders List Section */}
            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Recent Orders</h3>
                    <button
                        onClick={() => navigate('/seller/orders')}
                        style={{ background: 'none', border: 'none', color: '#ec4899', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                    >
                        View All Orders →
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.length > 0 ? orders.map((order, i) => (
                        <div key={i} onClick={() => navigate('/seller/orders')} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '20px', background: '#F8FAFC', gap: '20px', cursor: 'pointer' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {order.species === 'Dog' ? '🐕' : '🐈'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{order.pet_name || order.breed}</div>
                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Buyer: {order.buyer_name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>₹{order.amount.toLocaleString()}</div>
                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700' }}>{order.payment_method}</div>
                                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>{order.transaction_date.split(' ')[0]}</div>
                            </div>
                            <div style={{
                                padding: '6px 14px',
                                borderRadius: '100px',
                                fontSize: '11px',
                                fontWeight: '800',
                                background: statusBg[order.payment_status] || 'rgba(148,163,184,0.1)',
                                color: statusColor[order.payment_status] || '#64748B',
                                minWidth: '100px',
                                textAlign: 'center'
                            }}>
                                {order.payment_status}
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                            <p style={{ fontSize: '14px', fontWeight: '500' }}>No recent orders yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pet Services Section */}
            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Care & Wellness</h3>
                    <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Book professional care for your pets</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                    <motion.div 
                        whileHover={{ y: -4 }}
                        onClick={() => navigate('/seller/doctors')}
                        style={{ background: 'rgba(16,185,129,0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' }}>🩺</div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Find Vets</div>
                            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>Book Appointment</div>
                        </div>
                    </motion.div>
                    <motion.div 
                        whileHover={{ y: -4 }}
                        onClick={() => navigate('/seller/spas')}
                        style={{ background: 'rgba(245,158,11,0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(245,158,11,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' }}>✂️</div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Pet Spas</div>
                            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '700' }}>Book Grooming</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                <button onClick={() => navigate('/seller/earnings')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>View Detailed Earnings 📊</button>
                <button onClick={() => navigate('/seller/listings')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>Manage All Listings 🏪</button>
            </div>
        </div>
    );

    return (
        <Shell role="seller">
            <div style={{ paddingBottom: '60px' }}>
                {view === 'orders' ? renderOrdersList() : view === 'earnings' ? renderEarningsView() : renderDashboard()}
            </div>
        </Shell>
    );
};

export default SellerDashboard;
