import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ROOT_URL } from '../utils/constants';

const sidebarItems: any = {
    buyer: [
        { name: 'Dashboard', emoji: '🏠', path: '/dashboard/buyer' },
        { name: 'Marketplace', emoji: '🛍️', path: '/marketplace' },
        { name: 'Saved Pets', emoji: '❤️', path: '/saved-pets' },
        { name: 'Doctors', emoji: '🩺', path: '/doctors' },
        { name: 'Spas', emoji: '🛁', path: '/spas' },
        { name: 'Appointments', emoji: '📅', path: '/appointments' },
        { name: 'My Orders', emoji: '📦', path: '/orders' },
        { name: 'My Pets', emoji: '🐾', path: '/my-pets' },
        { name: 'My Reviews', emoji: '⭐', path: '/reviews' },
        { name: 'Transactions', emoji: '💳', path: '/transactions/buyer' },
        { name: 'AI Breed Detection', emoji: '✨', path: '/breed-detection' },
        { name: 'Messages', emoji: '💬', path: '/messages' },
    ],
    seller: [
        { name: 'Dashboard', emoji: '📊', path: '/dashboard/seller' },
        { name: 'My Listings', emoji: '🏷️', path: '/seller/listings' },
        { name: 'Add Pet', emoji: '➕', path: '/seller/add-listing' },
        { name: 'Private Pets', emoji: '🏠', path: '/seller/my-pets' },
        { name: 'Orders', emoji: '📦', path: '/seller/orders' },
        { name: 'Doctors', emoji: '🩺', path: '/seller/doctors' },
        { name: 'Spas', emoji: '✂️', path: '/seller/spas' },
        { name: 'Appointments', emoji: '📅', path: '/seller/appointments' },
        { name: 'Reviews Received', emoji: '📥', path: '/reviews?tab=received' },
        { name: 'Reviews Given', emoji: '📤', path: '/reviews?tab=given' },
        { name: 'Transactions', emoji: '💳', path: '/transactions/seller' },
        { name: 'Earnings', emoji: '💰', path: '/seller/earnings' },
        { name: 'AI Breed Detection', emoji: '✨', path: '/seller/breed-detection' },
        { name: 'Messages', emoji: '💬', path: '/messages' },
    ],
    doctor: [
        { name: 'Dashboard', emoji: '🏥', path: '/dashboard/doctor' },
        { name: 'Appointments', emoji: '📅', path: '/doctor/appointments' },
        { name: 'My Reviews', emoji: '⭐', path: '/doctor/reviews' },
        { name: 'Transactions', emoji: '💳', path: '/transactions/doctor' },
        { name: 'Messages', emoji: '💬', path: '/messages' },
    ],
    spa_owner: [
        { name: 'Dashboard', emoji: '🏠', path: '/dashboard/spa_owner' },
        { name: 'Bookings', emoji: '📅', path: '/spa/bookings' },
        { name: 'Services', emoji: '⚙️', path: '/spa/services' },
        { name: 'My Reviews', emoji: '⭐', path: '/spa/reviews' },
        { name: 'Transactions', emoji: '💳', path: '/transactions/spa_owner' },
        { name: 'Messages', emoji: '💬', path: '/messages' },
    ],
};

const normalizeRole = (r: string | null): string => {
    if (!r) return 'buyer';
    const lr = r.toLowerCase();
    if (lr === 'spa' || lr === 'spa_owner') return 'spa_owner';
    return lr;
};

const accountItems = [
    { name: 'Settings', emoji: '⚙️', path: '/settings' },
];

const roleColors: any = {
    buyer: { color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #FFA500)', glow: 'rgba(255,140,0,0.15)' },
    seller: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)', glow: 'rgba(236,72,153,0.15)' },
    doctor: { color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #14b8a6)', glow: 'rgba(16,185,129,0.15)' },
    spa: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)', glow: 'rgba(246,0,118,0.15)' },
    spa_owner: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)', glow: 'rgba(246,0,118,0.15)' },
};

const roleEmoji: any = { 
    buyer: '🐾', 
    seller: '🏪', 
    doctor: '🩺', 
    spa_owner: '✂️' 
};

export const Shell = ({ children, role: propRole }: { children: React.ReactNode; role?: string }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Resolve authenticated role from credentials
    const [role, setRole] = useState(() => normalizeRole(localStorage.getItem('role')));

    useEffect(() => {
        const actualRole = normalizeRole(localStorage.getItem('role'));
        
        // Security check: If we have an intended page role and it doesn't match our actual role, redirect.
        if (propRole) {
            const normalizedPropRole = normalizeRole(propRole);
            if (actualRole !== normalizedPropRole) {
                console.warn(`[Shell] Access Denied. Redirecting ${actualRole} to their dashboard.`);
                navigate(`/dashboard/${actualRole}`);
            }
        }
        
        if (role !== actualRole) setRole(actualRole);
    }, [propRole, navigate]);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const rc = roleColors[role.toLowerCase()] || roleColors.buyer;

    useEffect(() => {
        const fetchUnread = async () => {
            const userRaw = localStorage.getItem('user');
            if (!userRaw) return;
            const user = JSON.parse(userRaw);
            try {
                const res = await fetch(`${ROOT_URL}notification_management.php?action=get_unread_count&user_id=${user.user_id}`);
                const data = await res.json();
                if (data.success) {
                    setUnreadNotifications(data.count || 0);
                }
            } catch (e) {}
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);



    const updateUserLocation = async (lat: number, lng: number, city: string, fullAddr: string) => {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) return;
        
        const user = JSON.parse(userRaw);
        
        // Only update if significant change or initial detection
        if (user.city === city && Math.abs((user.latitude || 0) - lat) < 0.0001) {
            return; 
        }

        const updated = { 
            ...user, 
            latitude: lat, 
            longitude: lng, 
            city: city, 
            address: user.address || fullAddr,
            // Ensure no loss of role specific data
            upi_id: user.upi_id || ''
        };
        localStorage.setItem('user', JSON.stringify(updated));
        
        // Sync to Backend for App Parity
        setSyncStatus('syncing');
        try {
            const apiRole = role === 'spa' || role === 'spa_owner' ? 'SPA_OWNER' : role.toUpperCase();
            const res = await fetch(`${ROOT_URL}user_profile.php?action=update&role=${apiRole}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    latitude: lat,
                    longitude: lng,
                    address: updated.address,
                    full_name: user.full_name,
                    phone: user.phone,
                    upi_id: updated.upi_id
                })
            });
            const syncResult = await res.json();
            if (syncResult.success) {
                console.log("[Backend] Profile & Location Sync Successful.");
                setSyncStatus('synced');
                setLastSync(new Date().toLocaleTimeString());
                setTimeout(() => setSyncStatus('idle'), 3000);
            } else {
                console.warn("[Backend] Sync Warning:", syncResult.message);
                setSyncStatus('error');
            }
        } catch (err) {
            console.error("[Backend] Sync Failed (Connection Issue):", err);
            setSyncStatus('error');
        }

        window.dispatchEvent(new CustomEvent('locationUpdated', { detail: updated }));
    };

    const SidebarLink = ({ item }: { item: any }) => {
        const active = location.pathname === item.path || (location.pathname + location.search) === item.path;
        const [hovered, setHovered] = useState(false);
        return (
            <Link
                to={item.path}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '13px 16px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    background: active ? rc.bg : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                    color: active ? 'white' : hovered ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.7)',
                    fontSize: '14px', fontWeight: '700',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    boxShadow: active ? `0 8px 24px -6px ${rc.color}60` : 'none',
                    border: active ? 'none' : '1px solid transparent',
                    marginBottom: '2px',
                }}
            >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.emoji}</span>
                <span style={{ letterSpacing: '0.01em' }}>{item.name}</span>
                {active && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />}
            </Link>
        );
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            background: 'linear-gradient(135deg, #F8FAFF 0%, #FAFBFF 100%)',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input::placeholder { color: rgba(148,163,184,0.5) !important; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.4); }
            `}</style>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                        style={{
                            width: '280px',
                            minHeight: '100vh',
                            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            flexShrink: 0,
                            position: 'sticky',
                            top: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 100,
                            boxShadow: '8px 0 32px rgba(0,0,0,0.2)',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-30%', right: '-50%', width: '300px', height: '300px', background: `radial-gradient(circle, ${rc.glow} 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none', animation: 'pulse 6s ease infinite' }} />

                        {/* Logo */}
                        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: `0 12px 24px -6px ${rc.color}60`, flexShrink: 0 }}>
                                    {roleEmoji[role] || '🐾'}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>PetNexa</div>
                                <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.4)', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(100,116,139,0.6)', letterSpacing: '0.3em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '12px' }}>Operations</div>
                             {sidebarItems[role]?.map((item: any) => (
                                <SidebarLink key={item.path} item={item} />
                            ))}

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '24px 0 16px' }} />
                            <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(100,116,139,0.6)', letterSpacing: '0.3em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '12px' }}>Workspace</div>
                            {accountItems.map((item) => {
                                const path = `${item.path}/${role}`;
                                return <SidebarLink key={path} item={{ ...item, path }} />;
                            })}
                        </div>

                        {/* Logout at bottom */}
                        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                             <button
                                onClick={() => setShowLogoutConfirm(true)}
                                style={{ width: '100%', padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', color: '#f87171', fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'Outfit', system-ui", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                {/* Header */}
                <header style={{
                    height: '80px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky', top: 0, zIndex: 50,
                    background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(241,245,249,0.8)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 4px 24px -8px rgba(0,0,0,0.06)' : 'none',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                style={{ padding: '10px', background: 'white', border: '1px solid rgba(226,232,240,0.8)', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', lineHeight: 1 }}
                            >
                                ☰
                            </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid rgba(226,232,240,0.8)', borderRadius: '16px', padding: '12px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minWidth: '300px' }}>
                            <span style={{ fontSize: '16px' }}>🔍</span>
                            <input type="text" placeholder="Search marketplace, vets, or orders..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: '#475569', width: '100%', fontFamily: "'Outfit', system-ui" }} />
                        </div>
                        

                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link to="/notifications" style={{ position: 'relative', padding: '10px 12px', background: 'white', border: '1px solid rgba(226,232,240,0.8)', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', lineHeight: 1, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            🔔
                            {unreadNotifications > 0 && (
                                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white', fontSize: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
                                </span>
                            )}
                        </Link>

                        {/* Top Right Profile */}
                        <div
                            onClick={() => navigate(`/profile/${role}`)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '6px 6px 6px 14px', 
                                background: 'white', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(226,232,240,0.8)', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = rc.color; e.currentTarget.style.background = '#F8FAFF'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.background = 'white'; }}
                        >
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                                    {(() => {
                                        const userData = localStorage.getItem('user');
                                        return userData ? JSON.parse(userData).full_name?.split(' ')[0] || 'User' : 'Sign In';
                                    })()}
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: rc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>                                    {role.toLowerCase() === 'spa' || role.toLowerCase() === 'spa_owner' ? 'Spa Owner' : role}
</div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                {(() => {
                                    const userData = localStorage.getItem('user');
                                    const u = userData ? JSON.parse(userData) : null;
                                    const profileImg = u?.profile_image
                                        ? (u.profile_image.startsWith('http') ? u.profile_image : `${ROOT_URL}${u.profile_image}`)
                                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`;

                                    return (
                                        <>
                                            <img src={profileImg} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '12px', objectFit: 'cover', border: `2px solid ${rc.color}20` }} />
                                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, padding: '32px', maxWidth: '1600px', width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirm(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            style={{ 
                                position: 'relative', width: '100%', maxWidth: '400px', 
                                background: '#1e293b', borderRadius: '32px', padding: '40px',
                                border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👋</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Leaving Already?</h3>
                            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500', marginBottom: '32px', lineHeight: 1.6 }}>Are you sure you want to log out? <br/>Any unsaved changes might be lost.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        navigate('/login');
                                    }}
                                    style={{ padding: '16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '14px', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    LOGOUT NOW
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    KEEP ME SIGNED IN
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
