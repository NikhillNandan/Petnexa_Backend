import React, { useState } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROOT_URL } from '../utils/constants';

interface SettingItem {
    label: string;
    desc: string;
    icon: string;
    value?: boolean;
    setter?: (v: boolean) => void;
    onClick?: () => void;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

const Settings = ({ role: propRole }: { role?: string }) => {
    const normalizeRole = (r: string) => {
        if (!r) return 'buyer';
        const lr = r.toLowerCase();
        if (lr === 'spa_owner' || lr === 'spa') return 'spa_owner';
        return lr;
    };

    const role = normalizeRole(propRole || localStorage.getItem('role') || 'buyer');
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });

    const roleColors: any = {
        buyer: { color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #ff5e00)' },
        seller: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
        doctor: { color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        spa_owner: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)' },
    };
    const rc = roleColors[role] || roleColors.buyer;

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords don't match!");
            return;
        }
        if (passwordData.new.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const res = await fetch(`${ROOT_URL}auth.php?action=change_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: u.user_id,
                    current_password: passwordData.old,
                    new_password: passwordData.new
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Password updated successfully! 🔐");
                setShowPasswordModal(false);
                setPasswordData({ old: '', new: '', confirm: '' });
                // Also update local storage hash if needed, but safer to let them relogin or just keep.
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while communicating with the server.");
        }
    };

    const sections: SettingSection[] = [
        {
            title: 'SECURITY',
            items: [
                { label: 'Change Password', desc: 'Update your login credentials', icon: '🔐', onClick: () => setShowPasswordModal(true) }
            ]
        },
        {
            title: 'NOTIFICATIONS',
            items: [
                { label: 'Push Notifications', desc: 'Receive real-time app alerts', icon: '🔔', value: notifications, setter: setNotifications },
                { label: 'Email Alerts', desc: 'Stay updated via your inbox', icon: '📧', value: emailAlerts, setter: setEmailAlerts }
            ]
        },
        {
            title: 'PREFERENCES',
            items: [
                { label: 'Privacy Policy', desc: 'How we handle your data', icon: '📄', onClick: () => navigate(`/privacy/${role}`) },
                { label: 'About The App', desc: 'Version 2.4.0', icon: 'ℹ️', onClick: () => navigate(`/about/${role}`) },
                { label: 'Terms of Service', desc: 'App usage guidelines', icon: '⚖️', onClick: () => navigate(`/terms/${role}`) }
            ]
        }
    ];

    return (
        <Shell role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
                <style>{`
                    .settings-input {
                        width: 100%; padding: 16px; border-radius: 12px; border: 1px solid #F1F5F9; background: #F8FAFC;
                        font-family: inherit; font-size: 14px; font-weight: 600; outline: none; transition: border 0.2s;
                    }
                    .settings-input:focus { border-color: ${rc.color}; background: white; }
                `}</style>

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: `${rc.color}12`, border: `1px solid ${rc.color}25`, borderRadius: '100px', marginBottom: '14px' }}>
                        <span>⚙️</span>
                        <span style={{ color: rc.color, fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase' }}>User Preferences</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                        Settings <span style={{ background: rc.bg, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Control.</span> ⚙️
                    </h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {sections.map((section, idx) => (
                        <div key={idx}>
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px', marginLeft: '12px' }}>{section.title}</h3>
                            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                {section.items.map((item, i) => (
                                    <div key={i}
                                        onClick={() => item.onClick ? item.onClick() : item.setter?.(!item.value)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: i === section.items.length - 1 ? 'none' : '1px solid #F1F5F9', transition: 'background 0.2s ease', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{item.icon}</div>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{item.label}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{item.desc}</div>
                                            </div>
                                        </div>

                                        {item.setter ? (
                                            <div style={{ pointerEvents: 'none' }}>
                                                <button style={{ width: '48px', height: '24px', borderRadius: '12px', background: item.value ? rc.color : '#E2E8F0', border: 'none', position: 'relative', transition: 'all 0.3s' }}>
                                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: item.value ? '27px' : '3px', transition: 'all 0.3s' }} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '18px', color: '#CBD5E1' }}>›</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div style={{ padding: '0 12px' }}>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            style={{ width: '100%', padding: '18px', borderRadius: '16px', border: '2px solid #EF444430', background: 'rgba(239,68,68,0.05)', color: '#EF4444', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = '#EF4444'; }}
                        >
                            🛑 Delete Account Permanently
                        </button>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Update Password</h2>
                                <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '14px' }}>Ensure your account stays secure with a strong password.</p>

                                <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Current Password</label>
                                        <input type="password" required className="settings-input" value={passwordData.old} onChange={e => setPasswordData({ ...passwordData, old: e.target.value })} placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>New Password</label>
                                        <input type="password" required className="settings-input" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                                        <input type="password" required className="settings-input" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} placeholder="••••••••" />
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" style={{ flex: 1, padding: '16px', borderRadius: '14px', background: rc.bg, color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: `0 8px 16px ${rc.color}40` }}>Update 🔐</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}

                    {showDeleteModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(239,68,68,0.1)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', padding: '40px', borderRadius: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(239,68,68,0.1)' }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Are you absolutely sure?</h2>
                                <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '14px' }}>This action cannot be undone. All your pets, reviews, and bookings will be permanently lost.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <button onClick={() => { alert("Account deleted. 🕊️"); navigate('/roles'); }} style={{ padding: '18px', borderRadius: '16px', background: '#EF4444', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>Yes, Delete Everything</button>
                                    <button onClick={() => setShowDeleteModal(false)} style={{ padding: '18px', borderRadius: '16px', background: '#F1F5F9', color: '#64748B', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Wait, Keep My Account</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};

export default Settings;
