import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROOT_URL } from '../utils/constants';
import { api } from '../utils/api';
import { Camera, Pencil, CheckCircle2, X, Phone, MapPin, CreditCard, User } from 'lucide-react';

const Profile = ({ role: propRole }: { role?: string }) => {
    const navigate = useNavigate();

    const normalizeRole = (r: string) => {
        if (!r) return 'buyer';
        const lr = r.toLowerCase();
        if (lr === 'spa_owner' || lr === 'spa') return 'spa_owner';
        return lr;
    };

    const [role, setRole] = useState(() => normalizeRole(propRole || localStorage.getItem('role') || 'buyer'));
    const [user, setUser] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    useEffect(() => {
        if (propRole) setRole(normalizeRole(propRole));
    }, [propRole]);
    const [editData, setEditData] = useState({ full_name: '', phone: '', address: '', upi_id: '', profile_image: '', specialization: '', shop_name: '', spa_name: '', experience: '', latitude: 0, longitude: 0 });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [fetchingLoc, setFetchingLoc] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
            const u = JSON.parse(userRaw);
            setUser(u);
            setEditData({
                full_name: u.full_name || '',
                phone: u.phone || '',
                address: u.address || '',
                upi_id: u.upi_id || '',
                profile_image: u.profile_image || '',
                specialization: u.specialization || '',
                shop_name: u.shop_name || '',
                spa_name: u.spa_name || '',
                experience: u.experience || '',
                latitude: u.latitude || 0,
                longitude: u.longitude || 0
            });

            // Fetch Live Stats for Profile
            let dashRole = role.toLowerCase();
            if (dashRole === 'spa' || dashRole === 'spa_owner' || dashRole === 'SPA_OWNER') dashRole = 'spa';
            
            api.getDashboard(dashRole, u.user_id).then(res => {
                if (res.success || !res.error) {
                    const stats = res.stats || res;
                    setUser((prev: any) => ({
                        ...prev,
                        total_bookings: stats.total_bookings || stats.live_bookings || 0,
                        active_listings: stats.active_listings || 0,
                        total_appointments: stats.total_appointments || stats.appointments_today || 0,
                        avg_rating: parseFloat(stats.average_rating || stats.avg_rating || prev.avg_rating || '0') > 0 ? parseFloat(stats.average_rating || stats.avg_rating || prev.avg_rating || '0').toFixed(1) : '0'
                    }));
                }
            }).catch(console.error);
        }
    }, [role]);

    const roleColors: any = {
        buyer: { color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #ff5e00)', iconBg: '#FF8C00' },
        seller: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)', iconBg: '#ec4899' },
        doctor: { color: '#00C950', bg: 'linear-gradient(135deg, #00C950, #00E676)', iconBg: '#00C950' },
        spa: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)', iconBg: '#F60076' },
        spa_owner: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)', iconBg: '#F60076' },
        SPA_OWNER: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)', iconBg: '#F60076' },
    };
    const rc = roleColors[role] || roleColors.buyer;

    const stats: any[] = role === 'seller' ? [
        { label: 'Listings', value: user?.active_listings || '0', emoji: '📦', path: '/seller/listings' },
        { label: 'Reviews', value: user?.avg_rating || '0', emoji: '⭐', path: '/reviews' },
    ] : role === 'doctor' ? [
        { label: 'Consults', value: user?.total_appointments || '0', emoji: '🩺', path: '/doctor/appointments' },
        { label: 'Reviews', value: user?.avg_rating || '0', emoji: '⭐', path: '/reviews' },
    ] : (role === 'spa' || role === 'spa_owner' || role === 'SPA_OWNER') ? [
        { label: 'Bookings', value: user?.total_bookings || '0', emoji: '📅', path: '/spa/bookings' },
        { label: 'Reviews', value: user?.avg_rating || '0', emoji: '⭐', path: '/reviews' },
    ] : [
        { label: 'Purchases', value: user?.purchases || '0', emoji: '🛒', path: '/orders' },
        { label: 'Wishlist', value: user?.wishlist || '0', emoji: '❤️', path: '/marketplace' },
    ];

    const quickActions: any[] = role === 'seller' ? [
        { label: 'My Listings', icon: '🏪', path: '/seller/listings' },
        { label: 'Orders Received', icon: '📦', path: '/seller/orders' },
        { label: 'Add Pet Listing', icon: '➕', path: '/seller/add-listing' },
        { label: 'My Earnings', icon: '💰', path: '/transactions/seller' },
        { label: 'My Reviews', icon: '⭐', path: '/reviews' },
        { label: 'Settings', icon: '⚙️', path: '/settings/seller' },
    ] : role === 'doctor' ? [
        { label: 'My Appointments', icon: '📅', path: '/doctor/appointments' },
        { label: 'Set Availability', icon: '🕒', path: '/doctor/availability' },
        { label: 'Practice Earnings', icon: '💰', path: '/transactions/doctor' },
        { label: 'Reviews', icon: '⭐', path: '/reviews' },
        { label: 'Settings', icon: '⚙️', path: '/settings/doctor' },
    ] : (role === 'spa' || role === 'spa_owner' || role === 'SPA_OWNER') ? [
        { label: 'Spa Bookings', icon: '🛁', path: '/spa/bookings' },
        { label: 'Set Spa Availability', icon: '🕒', path: '/spa/availability' },
        { label: 'Services Menu', icon: '✂️', path: '/spa/services' },
        { label: 'Business Earnings', icon: '💰', path: '/transactions/spa_owner' },
        { label: 'Reviews', icon: '⭐', path: '/reviews' },
        { label: 'Settings', icon: '⚙️', path: '/settings/spa_owner' },
    ] : [
        { label: 'My Purchases', icon: '🛍️', path: '/orders' },
        { label: 'Saved Pets', icon: '❤️', path: '/saved-pets' },
        { label: 'Appointments', icon: '📅', path: '/appointments' },
        { label: 'My Reviews', icon: '⭐', path: '/reviews' },
        { label: 'Transactions', icon: '💳', path: '/transactions/buyer' },
        { label: 'Settings', icon: '⚙️', path: '/settings' },
    ];

    const handleDetectLocation = () => {
        setFetchingLoc(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        const { latitude, longitude, accuracy } = pos.coords;
                        console.log(`Profile: GPS Detected at ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);
                        
                        // First attempt with GPS
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en&addressdetails=1`);
                        const data = await res.json();
                        
                        let finalAddr = "";

                        if (data && data.address) {
                            const a = data.address;
                            
                            // Check if the result is South Korea but the user is likely not there
                            if (a.country === 'South Korea' || a.country_code === 'kr') {
                                console.warn("GPS returned South Korea. Trying IP fallback...");
                                throw new Error("Suspicious GPS result");
                            }

                            const parts = [];
                            if (a.house_number) parts.push(a.house_number);
                            if (a.road) parts.push(a.road);
                            if (a.suburb || a.neighbourhood) parts.push(a.suburb || a.neighbourhood);
                            if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
                            if (a.state_district) parts.push(a.state_district);
                            if (a.state) parts.push(a.state);
                            
                            finalAddr = parts.join(', ');
                        }

                        if (!finalAddr) throw new Error("Could not parse address");

                        setEditData(prev => ({ ...prev, latitude, longitude, address: finalAddr }));
                        alert(`📍 Precise location detected: ${finalAddr}`);

                    } catch (err) { 
                        console.log("GPS/Geocoding failed or suspicious. Swapping to IP Geolocation...");
                        try {
                            const ipRes = await fetch('https://ipapi.co/json/');
                            const ipData = await ipRes.json();
                            if (ipData.city) {
                                const ipAddr = `${ipData.city}, ${ipData.region}, ${ipData.country_name}`;
                                setEditData(prev => ({ 
                                    ...prev, 
                                    latitude: ipData.latitude, 
                                    longitude: ipData.longitude, 
                                    address: ipAddr 
                                }));
                                alert(`📍 Location detected via network: ${ipAddr}`);
                            } else {
                                alert("Could not auto-detect. Please enter your address manually.");
                            }
                        } catch (ipErr) {
                            alert("Location detection failed. Please enter address manually.");
                        }
                    }
                    setFetchingLoc(false);
                },
                async (err) => { 
                    console.log("GPS Denied. Trying IP fallback...");
                    try {
                        const ipRes = await fetch('https://ipapi.co/json/');
                        const ipData = await ipRes.json();
                        if (ipData.city) {
                            const ipAddr = `${ipData.city}, ${ipData.region}, ${ipData.country_name}`;
                            setEditData(prev => ({ 
                                ...prev, 
                                latitude: ipData.latitude, 
                                longitude: ipData.longitude, 
                                address: ipAddr 
                            }));
                            alert(`📍 Location detected: ${ipAddr}`);
                        } else {
                            alert(`Detection failed: ${err.message}`);
                        }
                    } catch (ipErr) {
                        alert(`Detection failed: ${err.message}`);
                    }
                    setFetchingLoc(false); 
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation not supported.");
            setFetchingLoc(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const apiRole = (role === 'spa' || role === 'spa_owner') ? 'SPA_OWNER' : role.toUpperCase();
            
            // 1. Update Profile image if changed
            if (editData.profile_image && editData.profile_image.startsWith('data:image')) {
                const imgRes = await fetch(`${ROOT_URL}upload_profile_image.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        role: role.toLowerCase(),
                        profile_image: editData.profile_image
                    })
                });
                const imgData = await imgRes.json();
                if (imgData.image_url) {
                    editData.profile_image = imgData.image_url;
                }
            }

            if (editData.phone.length !== 10 || !/^[0-9]{10}$/.test(editData.phone)) {
                alert("Phone number must be exactly 10 digits.");
                setIsUpdating(false);
                return;
            }

            // 2. Update other details
            const res = await fetch(`${ROOT_URL}user_profile.php?action=update&role=${apiRole}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    ...editData
                })
            });
            const data = await res.json();
            
            if (data.success) {
                const updatedUser = { ...user, ...editData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setShowEditModal(false);
                alert("Profile updated successfully! ✨");
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
            alert("Something went wrong.");
        } finally {
            setIsUpdating(false);
        }
    };

    const profileImg = user?.profile_image
        ? (user.profile_image.startsWith('http') ? user.profile_image : `${ROOT_URL}${user.profile_image}`)
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || role}`;

    return (
        <Shell role={role}>
            <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>

                {/* Profile Header Card */}
                <div style={{ position: 'relative', marginBottom: '40px' }}>
                    <div style={{ height: '220px', background: rc.bg, borderRadius: '32px', marginBottom: '-80px' }} />

                    <div style={{ padding: '0 40px' }}>
                        <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', textAlign: 'center', position: 'relative' }}>
                            <button 
                                onClick={() => setShowEditModal(true)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', color: rc.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Pencil size={14} /> Edit Profile
                            </button>

                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '-100px auto 24px', borderRadius: '50%', border: '6px solid white', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <img src={profileImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                                <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '20px', height: '20px', background: '#10b981', border: '3px solid white', borderRadius: '50%' }} />
                            </div>

                            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>
                                {user?.full_name || 'Pet Lover'}
                            </h2>
                            <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '32px', textTransform: 'capitalize' }}>
                                {role === 'spa_owner' ? 'Spa Owner' : role} account • PetNexa Member
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '24px 0', borderTop: '1px solid #f1f5f9' }}>
                                {stats.map((s: any, i: number) => (
                                    <div key={i} onClick={() => navigate(s.path)} style={{ cursor: 'pointer' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `${rc.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>{s.emoji}</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{s.value}</div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '32px', padding: '0 40px' }}>
                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Contact Details</h3>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: 'Email Address', value: user?.email || 'N/A', icon: '✉️' },
                                { label: 'Phone Number', value: user?.phone || 'N/A', icon: '📱' },
                                ...(role !== 'buyer' ? [{ label: 'UPI ID', value: user?.upi_id || 'Not set', icon: '💳' }] : []),
                                ...(role === 'seller' ? [{ label: 'Seller Type', value: user?.seller_type || 'Individual', icon: '🏪' }] : []),
                                ...(role === 'doctor' ? [{ label: 'Specialization', value: user?.specialization || 'General', icon: '🩺' }] : []),
                                { label: 'Office/Home Address', value: user?.address || 'N/A', icon: '📍' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${rc.color}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: rc.color }}>{item.icon}</div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                        <div style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {quickActions.map((action, i) => (
                                <motion.div key={i} whileHover={{ x: 8 }} onClick={() => navigate(action.path)}
                                    style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                                >
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>{action.icon}</div>
                                        <span style={{ fontWeight: '800', color: '#0f172a' }}>{action.label}</span>
                                    </div>
                                    <span style={{ fontSize: '20px', color: '#cbd5e1' }}>›</span>
                                </motion.div>
                            ))}

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLogoutConfirm(true)}
                                style={{ marginTop: '20px', width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                🚪 Logout from Session
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '32px', overflow: 'hidden', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <button onClick={() => setShowEditModal(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748B' }}>
                                <X size={18} />
                            </button>

                            <div style={{ padding: '40px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Edit Profile</h2>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Update your identity and contact information.</p>

                                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Profile Image Preview */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${rc.color}20`, overflow: 'hidden' }}>
                                                <img src={editData.profile_image?.startsWith('data:image') ? editData.profile_image : (editData.profile_image?.startsWith('http') ? editData.profile_image : `${ROOT_URL}${editData.profile_image || 'uploads/profiles/default.jpg'}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="edit preview" />
                                            </div>
                                            <label style={{ position: 'absolute', bottom: '0', right: '0', background: rc.color, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                                <Camera size={16} />
                                                <input type="file" accept="image/*" style={{ display: 'none' }}onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setEditData({ ...editData, profile_image: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <User size={14} /> Full Name
                                        </label>
                                        <input type="text" required value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} 
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <Phone size={14} /> Phone Number
                                        </label>
                                        <input type="tel" required pattern="[0-9]{10}" maxLength={10} value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '') })} 
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <MapPin size={14} /> Address
                                        </label>
                                        <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} 
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600', minHeight: '80px', fontFamily: 'inherit' }} />
                                        <button 
                                            type="button"
                                            onClick={handleDetectLocation}
                                            style={{ background: 'none', border: 'none', color: rc.color, fontSize: '12px', fontWeight: '800', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {fetchingLoc ? '🛰️ Locating...' : '📍 Auto-detect My Location'}
                                        </button>
                                    </div>

                                    {role !== 'buyer' && (
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                <CreditCard size={14} /> UPI ID (for payments)
                                            </label>
                                            <input type="text" value={editData.upi_id} onChange={e => setEditData({ ...editData, upi_id: e.target.value })} 
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                        </div>
                                    )}

                                    {role === 'doctor' && (
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                🩺 Specialization
                                            </label>
                                            <input type="text" value={editData.specialization} onChange={e => setEditData({ ...editData, specialization: e.target.value })} 
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                        </div>
                                    )}

                                    {role === 'seller' && (
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                🏪 Shop Name
                                            </label>
                                            <input type="text" value={editData.shop_name} onChange={e => setEditData({ ...editData, shop_name: e.target.value })} 
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                        </div>
                                    )}

                                    {(role === 'spa' || role === 'SPA_OWNER') && (
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                🛁 Spa Name
                                            </label>
                                            <input type="text" value={editData.spa_name} onChange={e => setEditData({ ...editData, spa_name: e.target.value })} 
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                        </div>
                                    )}

                                    {(role !== 'buyer') && (
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                🏆 Years of Experience
                                            </label>
                                            <input type="text" value={editData.experience} onChange={e => setEditData({ ...editData, experience: e.target.value })} 
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: '600' }} />
                                        </div>
                                    )}

                                    <button type="submit" disabled={isUpdating}
                                        style={{ width: '100%', padding: '18px', borderRadius: '18px', background: rc.bg, color: 'white', border: 'none', fontWeight: '900', fontSize: '14px', cursor: isUpdating ? 'not-allowed' : 'pointer', marginTop: '12px', boxShadow: `0 12px 24px ${rc.color}30`, opacity: isUpdating ? 0.7 : 1 }}>
                                        {isUpdating ? 'Saving Changes...' : 'Save Profile Details'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </Shell>
    );
};

export default Profile;
