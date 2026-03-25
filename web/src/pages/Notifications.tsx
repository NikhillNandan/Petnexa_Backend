import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOT_URL } from '../utils/constants';

const Notifications = () => {
    const [role, setRole] = useState(() => localStorage.getItem('role') || 'buyer');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const roleColors: any = {
        buyer: { color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #ff5e00)' },
        seller: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
        doctor: { color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        spa: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #f97316)' },
        spa_owner: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    };
    const rc = roleColors[role] || roleColors.buyer;

    const typeColors: any = {
        success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981', dot: '#10b981', emoji: '🎉' },
        info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', color: '#6366f1', dot: '#6366f1', emoji: 'ℹ️' },
        warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', dot: '#f59e0b', emoji: '⚠️' },
        error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#ef4444', dot: '#ef4444', emoji: '🚫' },
        Order: { bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.2)', color: '#FF8C00', dot: '#FF8C00', emoji: '🛍️' },
        Booking: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', color: '#10b981', dot: '#10b981', emoji: '🩺' },
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.user_id) return;

            const res = await fetch(`${ROOT_URL}notification_management.php?action=get_notifications&user_id=${user.user_id}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error('Fetch notifications error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setRole(localStorage.getItem('role') || 'buyer');
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            const res = await fetch(`${ROOT_URL}notification_management.php?action=mark_all_read&user_id=${user.user_id}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const dismiss = async (id: number) => {
        try {
            const res = await fetch(`${ROOT_URL}notification_management.php?action=delete_notification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: id })
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.filter(n => n.notification_id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markSingleRead = async (id: number) => {
        try {
            await fetch(`${ROOT_URL}notification_management.php?action=mark_read&notification_id=${id}`);
            setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const filtered = notifications.filter(n => {
        const unreadMatch = filter === 'all' || n.is_read === 0;
        return unreadMatch;
    });

    const unreadCountTotal = notifications.filter(n => n.is_read === 0).length;

    const getTimeAgo = (ts: string) => {
        const now = new Date();
        const past = new Date(ts);
        const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return past.toLocaleDateString();
    };

    return (
        <Shell role={role}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>

                {/* Header: Simplified for All Notifications */}
                <div style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em' }}>Notifications Hub</h2>
                            {unreadCountTotal > 0 && (
                                <div style={{ padding: '4px 12px', background: rc.color, borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '800' }}>
                                    {unreadCountTotal} NEW
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: '600' }}>Showing {filtered.length} messages in total</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                            <button onClick={() => setFilter('all')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', border: 'none', background: filter === 'all' ? rc.color : 'transparent', color: filter === 'all' ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                                ALL
                            </button>
                            <button onClick={() => setFilter('unread')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', border: 'none', background: filter === 'unread' ? rc.color : 'transparent', color: filter === 'unread' ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                                UNREAD
                            </button>
                        </div>
                        <button onClick={markAllRead} style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                            ✓ Mark All Read
                        </button>
                        <button onClick={fetchNotifications} style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #F1F5F9', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔄</button>
                    </div>
                </div>

                {/* Content: Single column feed */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#FAFBFF' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#94A3B8', fontWeight: '600' }}>Loading your notifications...</div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((notif) => {
                                    const tc = typeColors[notif.type] || typeColors.info;
                                    return (
                                        <motion.div key={notif.notification_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', background: 'white', borderRadius: '24px', border: `1px solid ${notif.is_read === 0 ? tc.border : '#F1F5F9'}`, position: 'relative', boxShadow: notif.is_read === 0 ? '0 4px 20px rgba(0,0,0,0.04)' : 'none', transition: 'all 0.2s ease' }}
                                        >
                                            {notif.is_read === 0 && <div style={{ position: 'absolute', top: '28px', right: '28px', width: '10px', height: '10px', background: tc.dot, borderRadius: '50%', boxShadow: `0 0 10px ${tc.dot}80` }} />}

                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                                                {tc.emoji}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>{notif.title}</h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '10px', fontWeight: '800', color: tc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{notif.type}</span>
                                                            <span style={{ width: '3px', height: '3px', background: '#CBD5E1', borderRadius: '50%' }} />
                                                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>{getTimeAgo(notif.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>{notif.message}</p>
                                                
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {notif.is_read === 0 && (
                                                        <button 
                                                            onClick={() => markSingleRead(notif.notification_id)}
                                                            style={{ padding: '8px 18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '100px', color: '#10b981', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                                                        >
                                                            ✓ Mark as Read
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => dismiss(notif.notification_id)} 
                                                        style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '100px', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '120px 40px' }}>
                                <div style={{ fontSize: '80px', marginBottom: '24px' }}>✨</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>All caught up!</h3>
                                <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '500' }}>No notifications found {filter === 'unread' ? 'in your unread folder' : 'at the moment'}.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default Notifications;
