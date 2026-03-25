import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const SpaDashboard = ({ view = 'dashboard' }: { view?: string }) => {
    const navigate = useNavigate();
    const [spaServices, setSpaServices] = useState<any[]>([]);
    const themeColor = '#F60076';
    const themeBg = 'rgba(246,0,118,0.08)';
    const themeBorder = 'rgba(246,0,118,0.15)';

    const [stats, setStats] = useState([
        { label: 'Live Bookings', value: '0', emoji: '📅', change: 'Peak Hours', color: themeColor, bg: themeBg, border: themeBorder },
        { label: 'Total Bookings', value: '0', emoji: '📈', change: 'All time', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
        { label: 'Rating', value: '0 ⭐', emoji: '⭐', change: 'Average', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
        { label: "Month's Revenue", value: '₹0', emoji: '💰', change: '+0%', color: themeColor, bg: themeBg, border: themeBorder },
    ]);

    const [sessions, setSessions] = useState<any[]>([]);
    const [allSessions, setAllSessions] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newService, setNewService] = useState({
        service_name: '',
        price: '',
        duration_minutes: '30',
        emoji: '🛁',
        description: ''
    });
    const [editService, setEditService] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);
            api.getDashboard('spa', u.user_id).then(res => {
                if (res && (res.success || !res.error || res.stats)) {
                    const s = res.stats || res;
                    setStats([
                        { label: 'Live Bookings', value: (s.today_bookings || s.live_bookings || 0).toString(), emoji: '📅', change: 'Today', color: themeColor, bg: themeBg, border: themeBorder },
                        { label: 'Total Bookings', value: (s.total_bookings || 0).toString(), emoji: '📈', change: 'All time', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                        { label: 'Rating', value: s.average_rating ? `${parseFloat(s.average_rating).toFixed(1)} ⭐` : '0 ⭐', emoji: '⭐', change: 'Average', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
                        { label: "Month's Revenue", value: `₹${(s.month_earnings || s.total_earnings || 0).toLocaleString()}`, emoji: '💰', change: 'Total', color: themeColor, bg: themeBg, border: themeBorder },
                    ]);
                }
            }).catch(console.error);

            // Fetch real bookings
            fetch(`${ROOT_URL}get_booking_requests.php?user_id=${u.user_id}`)
                .then(r => r.json())
                .then(res => {
                    if (res && (res.success || !res.error || res.bookings)) {
                        setAllSessions(res.bookings || []);
                        setSessions(res.bookings || []);
                        
                        // Recalculate Earnings (Completed only)
                        const completedTotal = (res.bookings || []).filter((b: any) => 
                            ['COMPLETED', 'CONFIRMED', 'SUCCESS'].includes(b.booking_status?.toUpperCase())
                        ).reduce((acc: number, b: any) => acc + Number(b.price || b.amount || 0), 0);
                        
                        setStats(prev => prev.map(s => 
                            (s.label === "Month's Revenue" || s.label === "Total Earnings") ? { ...s, value: `₹${completedTotal.toLocaleString('en-IN')}` } : s
                        ));
                    }
                    setLoadingBookings(false);
                }).catch(() => setLoadingBookings(false));

            // Fetch real services
            fetch(`${ROOT_URL}spa_service_management.php?action=get&user_id=${u.user_id}`)
                .then(r => r.json())
                .then(res => {
                    if (res && res.services) setSpaServices(res.services);
                }).catch(console.error);
        }
    }, []);

    useEffect(() => {
        if (filter === 'ALL') {
            setSessions(allSessions);
        } else {
            setSessions(allSessions.filter(s => {
                const status = s.booking_status.toUpperCase();
                if (filter === 'PENDING') return ['PENDING', 'BOOKED', 'REQUESTED', 'CONFIRMED', 'ACCEPTED'].includes(status);
                if (filter === 'COMPLETED') return status === 'COMPLETED';
                if (filter === 'REJECTED') return status === 'CANCELLED' || status === 'REJECTED' || status === 'DECLINED';
                return status === filter;
            }));
        }
    }, [filter, allSessions]);

    const handleBookingAction = async (bookingId: number, action: string) => {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const formData = new URLSearchParams();
            formData.append('booking_id', bookingId.toString());
            formData.append('user_id', u.user_id.toString());

            let endpoint = '';
            if (action === 'accept') endpoint = 'accept_booking.php';
            else if (action === 'decline') endpoint = 'decline_booking.php';
            else if (action === 'complete') endpoint = 'complete_booking.php';

            if (!endpoint) return;

            const res = await fetch(`${ROOT_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (!data.error) {
                alert(`Booking ${action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'completed'} successfully!`);
                // Refresh
                fetch(`${ROOT_URL}get_booking_requests.php?user_id=${u.user_id}`).then(r => r.json()).then(res => {
                    if (res && res.bookings) {
                        setAllSessions(res.bookings);
                        if (filter === 'ALL') {
                            setSessions(res.bookings);
                        } else {
                            setSessions(res.bookings.filter((s:any) => {
                                const status = s.booking_status.toUpperCase();
                                if (filter === 'PENDING') return ['PENDING', 'BOOKED', 'REQUESTED', 'CONFIRMED', 'ACCEPTED'].includes(status);
                                if (filter === 'COMPLETED') return status === 'COMPLETED';
                                if (filter === 'REJECTED') return status === 'CANCELLED' || status === 'REJECTED' || status === 'DECLINED';
                                return status === filter;
                            }));
                        }
                    }
                });
            } else {
                alert(data.message || 'Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        setIsSubmitting(true);
        try {
            const res = await fetch(`${ROOT_URL}spa_service_management.php?action=add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: u.user_id,
                    ...newService
                })
            });
            const data = await res.json();
            if (!data.error) {
                alert('Service added successfully! ✨');
                setShowAddModal(false);
                setNewService({ service_name: '', price: '', duration_minutes: '30', emoji: '🛁', description: '' });
                // Refresh list
                fetch(`${ROOT_URL}spa_service_management.php?action=get&user_id=${u.user_id}`)
                    .then(r => r.json())
                    .then(res => { if (res && res.services) setSpaServices(res.services); });
            } else {
                alert(data.message || 'Failed to add service');
            }
        } catch (err) {
            console.error(err);
            alert('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData = localStorage.getItem('user');
        if (!userData || !editService) return;
        const u = JSON.parse(userData);

        setIsSubmitting(true);
        try {
            const formData = new URLSearchParams();
            formData.append('service_id', editService.id || editService.service_id);
            formData.append('user_id', u.user_id);
            formData.append('service_name', editService.service_name);
            formData.append('price', editService.price);
            formData.append('duration_minutes', editService.duration_minutes);
            formData.append('description', editService.description || '');

            const res = await fetch(`${ROOT_URL}spa_service_management.php?action=update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (!data.error) {
                alert('Service updated successfully! ✨');
                setShowEditModal(false);
                setEditService(null);
                // Refresh list
                fetch(`${ROOT_URL}spa_service_management.php?action=get&user_id=${u.user_id}`)
                    .then(r => r.json())
                    .then(res => { if (res && res.services) setSpaServices(res.services); });
            } else {
                alert(data.message || 'Failed to update service');
            }
        } catch (err) {
            console.error(err);
            alert('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId: number) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const res = await fetch(`${ROOT_URL}spa_service_management.php?action=delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: u.user_id,
                    service_id: serviceId
                })
            });
            const data = await res.json();
            if (!data.error) {
                setSpaServices(prev => prev.filter(s => (s.service_id || s.id) !== serviceId));
                alert('Service removed.');
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const statusColor: any = { 'IN_SESSION': '#f59e0b', 'READY': '#10b981', 'UPCOMING': '#FF8C00', 'COMPLETED': '#10b981', 'PENDING': '#f59e0b', 'BOOKED': '#FF8C00', 'CONFIRMED': '#10b981', 'ACCEPTED': '#10b981', 'CANCELLED': '#ef4444' };
    const statusBg: any = { 'IN_SESSION': 'rgba(245,158,11,0.1)', 'READY': 'rgba(16,185,129,0.1)', 'UPCOMING': 'rgba(255,140,0,0.1)', 'COMPLETED': 'rgba(16,185,129,0.1)', 'PENDING': 'rgba(245,158,11,0.1)', 'BOOKED': 'rgba(255,140,0,0.1)', 'CONFIRMED': 'rgba(16,185,129,0.1)', 'ACCEPTED': 'rgba(16,185,129,0.1)', 'CANCELLED': 'rgba(239,68,68,0.1)' };

    const renderBookingsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        Active <span style={{ background: `linear-gradient(135deg, ${themeColor}, #FF4081)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Bookings.</span> 📅
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Real-time coordination for your luxury spa floor.</p>
                </div>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '4px' }}>
                    {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: filter === f ? themeColor : 'transparent',
                                color: filter === f ? 'white' : '#64748B',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {f === 'CANCELLED' ? 'REJECTED' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.length > 0 ? sessions.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                            {s.species === 'Dog' ? '🐕' : s.species === 'Cat' ? '🐈' : '🐾'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.service_name}</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{s.pet_name}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>⏰ {s.booking_time}</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>{s.booking_date}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F8FAFC', marginTop: '12px' }}>
                                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                                    <div>👤 <span style={{ fontWeight: '700', color: '#0F172A' }}>{s.owner_name}</span> • {s.owner_phone}</div>
                                    <div style={{ fontSize: '12px', color: s.payment_method === 'CASH' ? '#FF8C00' : '#FF8C00', fontWeight: '700', marginTop: '4px' }}>
                                        {s.payment_method === 'CASH' ? '💰 Pay in cash' : '💰 Pay in cash'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                                        background: statusBg[s.booking_status?.toUpperCase()] || 'rgba(148,163,184,0.1)',
                                        color: statusColor[s.booking_status?.toUpperCase()] || '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{s.booking_status}</div>

                                    {(s.booking_status?.toUpperCase() === 'BOOKED' || s.booking_status?.toUpperCase() === 'PENDING' || s.booking_status?.toUpperCase() === 'REQUESTED') && (
                                        <>
                                            <button
                                                onClick={() => handleBookingAction(s.booking_id, 'decline')}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleBookingAction(s.booking_id, 'accept')}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: '#FF8C00', color: 'white', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,140,0,0.2)' }}
                                            >
                                                Accept
                                            </button>
                                        </>
                                    )}
                                    {(s.booking_status?.toUpperCase() === 'ACCEPTED' || s.booking_status?.toUpperCase() === 'CONFIRMED') && (
                                        <button
                                            onClick={() => handleBookingAction(s.booking_id, 'complete')}
                                            style={{ padding: '10px 20px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #F1F5F9', color: '#94A3B8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛁</div>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{loadingBookings ? 'Scanning schedule...' : 'No bookings found for this filter.'}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderServicesView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        Spa <span style={{ background: `linear-gradient(135deg, ${themeColor}, #FF4081)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Services.</span> ⚙️
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Configure your service menu and pricing tiers.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    style={{ padding: '16px 32px', background: `linear-gradient(135deg, ${themeColor}, #FF4081)`, border: 'none', borderRadius: '16px', color: 'white', fontSize: '14px', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: `0 12px 24px ${themeColor}30` }}>
                    + Add New Service
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {spaServices.map((svc, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        onClick={() => navigate('/spa/services')}
                        style={{ background: 'white', borderRadius: '28px', padding: '28px', border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative', cursor: 'pointer' }}
                    >
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px' }}>{svc.emoji}</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>{svc.name || svc.service_name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Duration</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{svc.time}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>{svc.price}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F8FAFC' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setEditService(svc); setShowEditModal(true); }}
                                style={{ flex: 1, padding: '10px', background: '#F8FAFC', border: 'none', borderRadius: '10px', color: '#64748B', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Edit</button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteService(svc.service_id || svc.id); }}
                                style={{ padding: '10px', background: 'rgba(239,68,68,0.05)', border: 'none', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Spa <span style={{ color: themeColor }}>Dashboard.</span> ✨
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>Manage bookings and view your shop's performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/spa/bookings')}
                        style={{ padding: '12px 24px', background: '#f8fafc', color: '#0F172A', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        View Appointment Requests 📩
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/spa/bookings')}
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
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label === 'Live Bookings' ? "Today's Bookings" : s.label === "Month's Revenue" ? "Total Earnings" : s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Today's Schedule</h3>
                    <button
                        onClick={() => navigate('/spa/bookings')}
                        style={{ background: 'none', border: 'none', color: themeColor, fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Manage All →
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sessions.slice(0, 4).map((s) => (
                        <div key={s.booking_id} onClick={() => navigate('/spa/bookings')} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '20px', background: '#F8FAFC', gap: '20px', cursor: 'pointer' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {s.species === 'Dog' ? '🐕' : s.species === 'Cat' ? '🐈' : '🐾'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{s.pet_name} ({s.service_name})</div>
                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Owner: {s.owner_name}</div>
                                <div style={{ fontSize: '11px', color: s.payment_method === 'CASH' ? '#FF8C00' : '#FF8C00', fontWeight: '700', marginTop: '4px' }}>
                                    {s.payment_method === 'CASH' ? '💰 Pay in cash' : '💰 Pay in cash'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{s.booking_time}</div>
                                <div style={{
                                    marginTop: '4px',
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    background: statusBg[s.booking_status?.toUpperCase()] || 'rgba(148,163,184,0.1)',
                                    color: statusColor[s.booking_status?.toUpperCase()] || '#64748B',
                                    textAlign: 'center'
                                }}>
                                    {s.booking_status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                <button onClick={() => navigate('/spa/services')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>Manage Services ⚙️</button>
                <button onClick={() => navigate('/spa/reviews')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>Customer Reviews ⭐</button>
            </div>
        </div>
    );

    return (
        <Shell role="spa_owner">
            <div style={{ paddingBottom: '60px' }}>
                {view === 'bookings' ? renderBookingsView() : view === 'services' ? renderServicesView() : renderDashboard()}
            </div>

            {/* Add Service Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ width: '100%', maxWidth: '480px', background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}
                    >
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748B' }}>✕</button>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Add Service</h2>
                        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>List a new luxury experience for pets.</p>
                        
                        <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Service Name</label>
                                <input required type="text" value={newService.service_name} onChange={e => setNewService({...newService, service_name: e.target.value})} placeholder="e.g. Royal Grooming" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Price (₹)</label>
                                    <input required type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} placeholder="999" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Duration (Min)</label>
                                    <input required type="number" value={newService.duration_minutes} onChange={e => setNewService({...newService, duration_minutes: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Emoji Icon</label>
                                <input required type="text" value={newService.emoji} onChange={e => setNewService({...newService, emoji: e.target.value})} placeholder="✂️, 🚿, 🛁" style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <button disabled={isSubmitting} type="submit" style={{ width: '100%', padding: '18px', background: `linear-gradient(135deg, ${themeColor}, #FF4081)`, border: 'none', borderRadius: '16px', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', marginTop: '12px', boxShadow: `0 12px 24px ${themeColor}30` }}>
                                {isSubmitting ? 'Adding...' : 'Publish Service ✨'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Service Modal */}
            {showEditModal && editService && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ width: '100%', maxWidth: '480px', background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}
                    >
                        <button onClick={() => { setShowEditModal(false); setEditService(null); }} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748B' }}>✕</button>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Edit Service</h2>
                        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Update your luxury experience details.</p>
                        
                        <form onSubmit={handleUpdateService} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Service Name</label>
                                <input required type="text" value={editService.service_name || editService.name || ''} onChange={e => setEditService({...editService, service_name: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Price (₹)</label>
                                    <input required type="number" value={editService.price || ''} onChange={e => setEditService({...editService, price: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Duration (Min)</label>
                                    <input required type="number" value={editService.duration_minutes || ''} onChange={e => setEditService({...editService, duration_minutes: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <button disabled={isSubmitting} type="submit" style={{ width: '100%', padding: '18px', background: `linear-gradient(135deg, ${themeColor}, #FF4081)`, border: 'none', borderRadius: '16px', color: 'white', fontSize: '14px', fontWeight: '900', cursor: 'pointer', marginTop: '12px', boxShadow: `0 12px 24px ${themeColor}30` }}>
                                {isSubmitting ? 'Updating...' : 'Save Changes ✨'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </Shell>
    );
};

export default SpaDashboard;
