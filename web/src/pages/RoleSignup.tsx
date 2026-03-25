import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { ValidationUtils } from '../utils/ValidationUtils';

/* ─────────── helpers ─────────── */
const getStrength = (pwd: string) => {
    if (!pwd) return { label: 'Enter password', color: '#94A3B8', width: '0%' };
    if (pwd.length < 5) return { label: 'Too Weak', color: '#ef4444', width: '20%' };
    if (pwd.length < 8) return { label: 'Moderate', color: '#f59e0b', width: '55%' };
    if (pwd.length < 12) return { label: 'Strong', color: '#10b981', width: '80%' };
    return { label: 'Very Strong ✓', color: '#06b6d4', width: '100%' };
};

/* ─────────── role metadata (matches app UI/workflows) ─────────── */
const ROLE_META: Record<string, { title: string; subtitle: string; color: string; glow: string; bg: string; emoji: string }> = {
    buyer: { title: 'Pet Buyer', subtitle: 'Join the PetNexa community', color: '#FF8C00', glow: 'rgba(255,140,0,0.3)', bg: 'linear-gradient(135deg,#FF8C00,#ff5e00)', emoji: '🐾' },
    seller: { title: 'Pet Seller', subtitle: 'List your pets for sale', color: '#ec4899', glow: 'rgba(236,72,153,0.3)', bg: 'linear-gradient(135deg,#ec4899,#f43f5e)', emoji: '🏪' },
    doctor: { title: 'Doctor', subtitle: 'Professional Vet Expert', color: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: 'linear-gradient(135deg,#10b981,#14b8a6)', emoji: '🩺' },
    spa: { title: 'Spa Owner', subtitle: 'Pet Wellness Expert', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'linear-gradient(135deg,#f59e0b,#f97316)', emoji: '🛁' },
};

const RoleSignup = () => {
    const { role: initialRole = 'buyer' } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState(initialRole);
    const meta = ROLE_META[activeRole] ?? ROLE_META.buyer;

    /* ── shared state (all roles) ── */
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [address, setAddress] = useState('');
    const [upiId, setUpiId] = useState('');
    const [coords, setCoords] = useState({ lat: 0, lng: 0 });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    /* ── flags & loading ── */
    const [fetchingLoc, setFetchingLoc] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');

    /* ── role-specific fields (matches app EditText fields) ── */
    const [doctorQual, setDoctorQual] = useState('');
    const [doctorSpec, setDoctorSpec] = useState('');
    const [doctorExp, setDoctorExp] = useState('');
    const [doctorHospital, setDoctorHospital] = useState('');
    const [doctorLanguages, setDoctorLanguages] = useState('');
    const [sellerType, setSellerType] = useState<'INDIVIDUAL' | 'SHOP'>('INDIVIDUAL');
    const [spaName, setSpaName] = useState('');
    const [spaServices, setSpaServices] = useState('');

    const handleFallbackLocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data.city && data.country_code !== 'KR') {
                setAddress(`${data.city}, ${data.region}, ${data.country_name}`);
                setCoords({ lat: data.latitude, lng: data.longitude });
            } else {
                const res2 = await fetch('http://ip-api.com/json');
                const data2 = await res2.json();
                if (data2.city && data2.countryCode !== 'KR') {
                    setAddress(`${data2.city}, ${data2.regionName}, ${data2.country}`);
                    setCoords({ lat: data2.lat, lng: data2.lon });
                }
            }
        } catch (err) {
            console.error("All location fallbacks failed");
        } finally {
            setFetchingLoc(false);
        }
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
             handleFallbackLocation();
             return;
        }

        setFetchingLoc(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                console.log(`[Signup Location] GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Acc: ${accuracy}m)`);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&accept-language=en`);
                    const data = await res.json();
                    
                    if (data.address?.country_code === 'kr' || data.address?.country === 'South Korea') {
                        console.warn("[Signup] Suspect Korea GPS anomaly. Falling back.");
                        handleFallbackLocation();
                        return;
                    }

                    // For signup, display_name is the best 'Full Address'
                    setAddress(data.display_name || 'India');
                    setCoords({ lat: latitude, lng: longitude });
                    setFetchingLoc(false);
                } catch (e) {
                    handleFallbackLocation();
                }
            },
            (err) => {
                console.warn("[Signup] GPS Error:", err.message);
                handleFallbackLocation();
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (pwd !== confirmPwd) { setError("Passwords do not match"); return; }
        if (pwd.length < 8) { setError("Password too short (min 8 chars)"); return; }
        if (!ValidationUtils.isValidPhone(phone)) {
            setError("Mobile number must be 10 digits and start with 6, 7, 8, or 9.");
            return;
        }

        setLoading(true);
        try {
            let base64Image = '';
            if (profileImage) {
                const reader = new FileReader();
                base64Image = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(profileImage);
                });
            }

            const payload: any = {
                full_name: fullName,
                email: email,
                phone: phone,
                password: pwd,
                address: address,
                upi_id: upiId,
                profile_image: base64Image,
                latitude: coords.lat,
                longitude: coords.lng
            };

            if (activeRole === 'seller') {
                payload.seller_type = sellerType;
                payload.shop_name = sellerType === 'SHOP' ? fullName : '';
            } else if (activeRole === 'doctor') {
                payload.qualification = doctorQual;
                payload.specialization = doctorSpec;
                payload.experience = doctorExp;
                payload.hospital = doctorHospital;
                payload.languages = doctorLanguages;
            } else if (activeRole === 'spa') {
                payload.spa_name = spaName;
                payload.services_offered = spaServices;
            }

            const res = await api.signup(activeRole === 'spa' ? 'SPA_OWNER' : activeRole, payload);
            if (res.success) {
                if (res.verification_required) {
                    setOtpStep(true);
                } else {
                    localStorage.setItem('user', JSON.stringify(res.user));
                    localStorage.setItem('role', activeRole);
                    navigate(`/dashboard/${activeRole}`);
                }
            } else {
                setError(res.message || "Registration failed.");
            }
        } catch (err) {
            setError("Connection error. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.verifySignup(email, otp);
            if (res.success) {
                localStorage.setItem('user', JSON.stringify(res.user));
                localStorage.setItem('role', activeRole);
                navigate(`/dashboard/${activeRole}`);
            } else {
                setError(res.message || "Invalid OTP");
            }
        } catch (err) {
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (fieldName: string) => ({
        width: '100%',
        padding: '14px 18px',
        background: focused === fieldName ? '#fff' : '#F8FAFC',
        border: `1.5px solid ${focused === fieldName ? meta.color : '#E2E8F0'}`,
        borderRadius: '14px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#0F172A',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxShadow: focused === fieldName ? `0 0 0 4px ${meta.color}10` : 'none'
    });

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        marginBottom: '6px',
        display: 'block'
    };

    if (otpStep) {
        return (
            <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '400px', width: '100%', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📩</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Verify Account</h2>
                    <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Enter the code sent to <b>{email}</b></p>
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <input type="text" maxLength={6} required placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', padding: '16px', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: '16px', fontSize: '28px', fontWeight: '900', textAlign: 'center', letterSpacing: '0.3em' }} />
                        {error && <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>{error}</div>}
                        <button disabled={loading} style={{ width: '100%', padding: '16px', background: meta.bg, color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }}>{loading ? 'Verifying...' : 'Complete Signup'}</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 10px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', background: meta.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: `0 8px 16px ${meta.glow}` }}>{meta.emoji}</div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{meta.title} Signup</h1>
                            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{meta.subtitle}</p>
                        </div>
                   </div>
                   <Link to="/login" style={{ fontSize: '13px', fontWeight: '800', color: meta.color, textDecoration: 'none' }}>Already have account? Login</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }}>
                    <div style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                            {Object.entries(ROLE_META).map(([id, r]) => (
                                <button key={id} onClick={() => { setActiveRole(id); setError(null); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeRole === id ? '#f8f9ff' : 'transparent', borderRadius: '18px', cursor: 'pointer', transition: '0.3s' }}>
                                    <span style={{ fontSize: '18px', filter: activeRole === id ? 'none' : 'grayscale(100%)' }}>{r.emoji}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: activeRole === id ? '#0F172A' : '#94A3B8' }}>{r.title}</span>
                                    {activeRole === id && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: r.color }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div key={activeRole} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: '#F8FAFC', border: '2px dashed #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('pic')?.click()}>
                                    {previewUrl ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>📷</span>}
                                </div>
                                <input type="file" id="pic" hidden onChange={(e) => { const f = e.target.files?.[0]; if(f){ setProfileImage(f); setPreviewUrl(URL.createObjectURL(f)); } }} />
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Profile Picture</p>
                                    <p style={{ fontSize: '10px', color: '#94A3B8' }}>Helps users recognize you</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>{activeRole === 'doctor' ? 'Doctor Name' : activeRole === 'spa' ? 'Owner Name' : 'Full Name'} *</label>
                                    <input required placeholder="Name" value={fullName} onChange={e => setFullName(ValidationUtils.filterName(e.target.value))} onFocus={() => setFocused('fn')} onBlur={() => setFocused(null)} style={inputStyle('fn')} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Number *</label>
                                    <input type="tel" maxLength={10} required placeholder="9876543210" value={phone} onChange={e => {
                                        const filtered = ValidationUtils.filterPhone(e.target.value);
                                        if (filtered.length > 0 && !/^[6-9]/.test(filtered)) {
                                            // Optional: Show error or toast here? For now, we just skip updating
                                            return;
                                        }
                                        setPhone(filtered);
                                    }} onFocus={() => setFocused('ph')} onBlur={() => setFocused(null)} style={inputStyle('ph')} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Email Address *</label>
                                <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('em')} onBlur={() => setFocused(null)} style={inputStyle('em')} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Password *</label>
                                    <input type="password" required placeholder="••••" value={pwd} onChange={e => setPwd(e.target.value)} onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)} style={inputStyle('pw')} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm Password *</label>
                                    <input type="password" required placeholder="••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} onFocus={() => setFocused('cpw')} onBlur={() => setFocused(null)} style={inputStyle('cpw')} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={labelStyle}>Residence/Clinic Address *</label>
                                    <button type="button" onClick={handleUseLocation} style={{ border: 'none', background: 'none', color: meta.color, fontSize: '11px', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' }}>
                                        {fetchingLoc ? '⏳ Detecting...' : '📍 Use Current Location'}
                                    </button>
                                </div>
                                <textarea required placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} onFocus={() => setFocused('addr')} onBlur={() => setFocused(null)} style={{ ...inputStyle('addr'), height: '80px', resize: 'none' }} />
                            </div>

                            {activeRole !== 'buyer' && (
                                <div>
                                    <label style={labelStyle}>UPI ID (For Payments) *</label>
                                    <input required placeholder="upi@id" value={upiId} onChange={e => setUpiId(e.target.value)} onFocus={() => setFocused('upi')} onBlur={() => setFocused(null)} style={inputStyle('upi')} />
                                </div>
                            )}
                            
                            {activeRole === 'doctor' && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>Qualification *</label>
                                            <input required placeholder="BVSc" value={doctorQual} onChange={e => setDoctorQual(e.target.value)} onFocus={() => setFocused('qual')} onBlur={() => setFocused(null)} style={inputStyle('qual')} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Specialization *</label>
                                            <input required placeholder="Surgery" value={doctorSpec} onChange={e => setDoctorSpec(e.target.value)} onFocus={() => setFocused('spec')} onBlur={() => setFocused(null)} style={inputStyle('spec')} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>Experience (Years) *</label>
                                            <input required type="number" placeholder="5" value={doctorExp} onChange={e => setDoctorExp(e.target.value)} onFocus={() => setFocused('exp')} onBlur={() => setFocused(null)} style={inputStyle('exp')} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Hospital Name *</label>
                                            <input required placeholder="Hospital" value={doctorHospital} onChange={e => setDoctorHospital(e.target.value)} onFocus={() => setFocused('hosp')} onBlur={() => setFocused(null)} style={inputStyle('hosp')} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Languages *</label>
                                        <input required placeholder="English, Hindi" value={doctorLanguages} onChange={e => setDoctorLanguages(e.target.value)} onFocus={() => setFocused('lang')} onBlur={() => setFocused(null)} style={inputStyle('lang')} />
                                    </div>
                                </>
                            )}

                            {activeRole === 'seller' && (
                                <div>
                                    <label style={labelStyle}>Seller Type *</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {['INDIVIDUAL', 'SHOP'].map(t => (
                                            <button key={t} type="button" onClick={() => setSellerType(t as any)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: sellerType === t ? meta.color : '#F8FAFC', color: sellerType === t ? 'white' : '#94A3B8', border: 'none', fontWeight: '800', transition: '0.2s', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeRole === 'spa' && (
                                <>
                                    <div>
                                        <label style={labelStyle}>Spa Name *</label>
                                        <input required placeholder="Spa Name" value={spaName} onChange={e => setSpaName(ValidationUtils.filterName(e.target.value))} onFocus={() => setFocused('sn')} onBlur={() => setFocused(null)} style={inputStyle('sn')} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Services Offered *</label>
                                        <input required placeholder="Grooming" value={spaServices} onChange={e => setSpaServices(e.target.value)} onFocus={() => setFocused('svc')} onBlur={() => setFocused(null)} style={inputStyle('svc')} />
                                    </div>
                                </>
                            )}

                            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '700', background: '#FEF2F2', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>{error}</div>}

                            <button disabled={loading} style={{ width: '100%', padding: '18px', background: meta.bg, border: 'none', borderRadius: '18px', color: 'white', fontSize: '16px', fontWeight: '900', cursor: loading ? 'wait' : 'pointer', boxShadow: `0 15px 30px ${meta.glow}` }}>{loading ? 'Registering...' : 'Register Now →'}</button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RoleSignup;
