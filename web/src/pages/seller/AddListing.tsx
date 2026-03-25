import React, { useState } from 'react';
import { Shell } from '../../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const AddListing = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [petType, setPetType] = useState('Dog');
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ 
        name: '', breed: '', age: '', gender: 'Male', price: '', city: '', color: '',
        description: '', vaccination: false, health: false, license: false 
    });
    const [certs, setCerts] = useState({
        vaccination: { file: null as string | null, name: '' },
        health: { file: null as string | null, name: '' },
        license: { file: null as string | null, name: '' }
    });

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = ev => { if (ev.target?.result) setPhotos(p => [...p, ev.target!.result as string].slice(0, 5)); };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCertFile = (key: 'vaccination' | 'health' | 'license', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setCerts(prev => ({
                        ...prev,
                        [key]: { file: ev.target!.result as string, name: file.name }
                    }));
                    setForm(prev => ({ ...prev, [key]: true }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert('Please log in again.');
            return;
        }
        const u = JSON.parse(userData);

        setLoading(true);
        try {
            const data = {
                seller_id: u.user_id,
                pet_type: petType,
                pet_name: form.name,
                breed: form.breed,
                age: form.age,
                gender: form.gender,
                price: form.price,
                description: form.description,
                color: form.color,
                photos: photos,
                vaccination_cert: certs.vaccination.file,
                vaccination_cert_name: certs.vaccination.name,
                health_cert: certs.health.file,
                health_cert_name: certs.health.name,
                license_cert: certs.license.file,
                license_cert_name: certs.license.name
            };

            const res = await api.addPetListing(data);
            if (res.success) {
                setStep(4);
            } else {
                alert(res.error || 'Failed to create listing');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while publishing your listing.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Pet Type', 'Details & Photos', 'Certify & Price', 'Published!'];

    const inputStyle = (filled?: boolean): React.CSSProperties => ({
        width: '100%', padding: '16px 18px',
        background: filled ? 'rgba(255,140,0,0.04)' : '#F8FAFC',
        border: `1px solid ${filled ? 'rgba(255,140,0,0.2)' : '#E2E8F0'}`,
        borderRadius: '14px', outline: 'none', color: '#0F172A',
        fontSize: '15px', fontWeight: '500', fontFamily: "'Outfit', system-ui",
        transition: 'all 0.2s ease', boxSizing: 'border-box' as any,
    });

    const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.25em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' };

    const PET_TYPES = [
        { id: 'Dog', label: 'Dog', emoji: '🐕', desc: 'Puppies & adult breeds' },
        { id: 'Cat', label: 'Cat', emoji: '🐈', desc: 'Kittens & adult cats' },
    ];

    return (
        <Shell role="seller">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
            <div style={{ maxWidth: '900px', paddingBottom: '60px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <button onClick={() => navigate(-1)} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexShrink: 0 }}>←</button>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '100px', marginBottom: '10px' }}>
                            <span style={{ color: '#FF8C00', fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase' }}>🏪 New Pet Listing</span>
                        </div>
                        <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {step < 4 ? 'List a' : 'Successfully'} <span style={{ background: 'linear-gradient(135deg, #FF8C00, #ff5e00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                {step < 4 ? 'New Pet.' : 'Published! 🎉'}
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Step Progress */}
                {step < 4 && (
                    <div style={{ display: 'flex', gap: '0', marginBottom: '40px', background: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        {steps.slice(0, 3).map((s, i) => (
                            <div key={i} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: step === i + 1 ? 'linear-gradient(135deg, #FF8C00, #ff5e00)' : 'transparent', transition: 'all 0.3s ease', cursor: 'pointer', textAlign: 'center' }} onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: step === i + 1 ? 'white' : step > i + 1 ? '#10b981' : '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {step > i + 1 ? '✓ ' : `0${i + 1} — `}{s}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Card */}
                <div style={{ background: 'white', borderRadius: '28px', border: '1px solid #F1F5F9', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Pet Type */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '48px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>What type of pet?</h2>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Choose the category for your pet listing.</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                                    {PET_TYPES.map(pt => (
                                        <div key={pt.id} onClick={() => setPetType(pt.id)}
                                            style={{ padding: '24px', borderRadius: '18px', cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'center', background: petType === pt.id ? 'rgba(255,140,0,0.06)' : '#F8FAFC', border: `2px solid ${petType === pt.id ? '#FF8C00' : '#F1F5F9'}`, boxShadow: petType === pt.id ? '0 8px 24px rgba(255,140,0,0.15)' : 'none' }}
                                            onMouseEnter={e => { if (petType !== pt.id) e.currentTarget.style.borderColor = 'rgba(255,140,0,0.3)'; }}
                                            onMouseLeave={e => { if (petType !== pt.id) e.currentTarget.style.borderColor = '#F1F5F9'; }}
                                        >
                                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{pt.emoji}</div>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: petType === pt.id ? '#FF8C00' : '#0F172A', marginBottom: '4px' }}>{pt.label}</div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{pt.desc}</div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setStep(2)} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #FF8C00, #ff5e00)', border: 'none', borderRadius: '16px', color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui", boxShadow: '0 12px 28px rgba(255,140,0,0.35)' }}>
                                    Continue to Details →
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: Details & Photos */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ padding: '48px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>Pet Details</h2>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Fill in details to maximize buyer trust and conversion.</p>

                                {/* Photos */}
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={labelStyle}>Photos (min 3, max 5)</label>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {photos.map((p, i) => (
                                            <div key={i} style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '2px solid rgba(255,140,0,0.3)', flexShrink: 0 }}>
                                                <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                <button onClick={() => setPhotos(ph => ph.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                            </div>
                                        ))}
                                        {photos.length < 5 && (
                                            <label style={{ width: '100px', height: '100px', borderRadius: '16px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F8FAFC', transition: 'all 0.2s', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF8C00'; e.currentTarget.style.background = 'rgba(255,140,0,0.04)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}>
                                                <span style={{ fontSize: '24px', marginBottom: '4px' }}>📸</span>
                                                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.1em', textAlign: 'center' }}>ADD<br />PHOTO</span>
                                                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                                            </label>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '10px', color: (photos.length < 3 && photos.length > 0) ? '#ef4444' : '#94A3B8', marginTop: '8px', fontWeight: '600' }}>
                                        {photos.length < 3 ? 'At least 3 photos required by backend.' : 'Photo requirement met.'}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Pet Name</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Bruno, Luna, Coco..." style={inputStyle(!!form.name)} onFocus={e => { e.target.style.borderColor = '#FF8C00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,140,0,0.1)'; }} onBlur={e => { e.target.style.borderColor = form.name ? 'rgba(255,140,0,0.2)' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Breed</label>
                                        <input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Siberian Husky" style={inputStyle(!!form.breed)} onFocus={e => { e.target.style.borderColor = '#FF8C00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,140,0,0.1)'; }} onBlur={e => { e.target.style.borderColor = form.breed ? 'rgba(255,140,0,0.2)' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Age (Years)</label>
                                        <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 2" style={inputStyle(!!form.age)} onFocus={e => { e.target.style.borderColor = '#FF8C00'; }} onBlur={e => { e.target.style.borderColor = form.age ? 'rgba(255,140,0,0.2)' : '#E2E8F0'; }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Gender</label>
                                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ ...inputStyle(true), cursor: 'pointer', appearance: 'none' }}>
                                            <option>Male</option><option>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Color</label>
                                        <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="e.g. White & Black" style={inputStyle(!!form.color)} onFocus={e => { e.target.style.borderColor = '#FF8C00'; }} onBlur={e => { e.target.style.borderColor = form.color ? 'rgba(255,140,0,0.2)' : '#E2E8F0'; }} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Description</label>
                                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your pet's temperament, health history, and what makes them special..." style={{ ...inputStyle(!!form.description), resize: 'vertical', height: 'auto', lineHeight: '1.6' }} onFocus={e => { e.target.style.borderColor = '#FF8C00'; }} onBlur={e => { e.target.style.borderColor = form.description ? 'rgba(255,140,0,0.2)' : '#E2E8F0'; }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>← Back</button>
                                    <button onClick={() => setStep(3)} disabled={!form.breed || !form.name || photos.length < 3} style={{ flex: 2, padding: '16px', background: (!form.breed || !form.name || photos.length < 3) ? '#E2E8F0' : 'linear-gradient(135deg, #FF8C00, #ff5e00)', border: 'none', borderRadius: '14px', color: (!form.breed || !form.name || photos.length < 3) ? '#94A3B8' : 'white', fontSize: '12px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: (!form.breed || !form.name || photos.length < 3) ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', system-ui", boxShadow: (!form.breed || !form.name || photos.length < 3) ? 'none' : '0 12px 24px rgba(255,140,0,0.3)' }}>
                                        Price & Certify →
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Certify & Price */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ padding: '48px' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>Price & Certifications</h2>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>Set your price and upload health certificates to gain maximum buyer trust.</p>

                                {/* Price */}
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={labelStyle}>Selling Price (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: '900', color: '#10b981' }}>₹</span>
                                        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45,000" style={{ ...inputStyle(!!form.price), paddingLeft: '44px', fontSize: '22px', fontWeight: '900', color: '#10b981' }} onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }} onBlur={e => { e.target.style.borderColor = form.price ? 'rgba(16,185,129,0.2)' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                                    {[
                                        { key: 'vaccination' as const, label: 'Vaccination Certificate', desc: 'PDF or image, max 5MB — Optional', emoji: '💉' },
                                        { key: 'health' as const, label: 'Health Certificate', desc: 'Upload health check-up report (PDF/image, max 5MB) — Optional', emoji: '🏥' },
                                        { key: 'license' as const, label: 'Pet License', desc: 'Upload pet license or registration (PDF/image, max 5MB) — Optional', emoji: '📄' },
                                    ].map(cert => {
                                        const checked = form[cert.key];
                                        const fileName = certs[cert.key].name;
                                        return (
                                            <div key={cert.key} onClick={() => document.getElementById(`cert-${cert.key}`)?.click()}
                                                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: checked ? 'rgba(16,185,129,0.06)' : '#F8FAFC', border: `1px solid ${checked ? 'rgba(16,185,129,0.25)' : '#E2E8F0'}`, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <input type="file" id={`cert-${cert.key}`} style={{ display: 'none' }} accept=".pdf,image/*" onChange={(e) => handleCertFile(cert.key, e)} />
                                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: checked ? 'rgba(16,185,129,0.15)' : 'white', border: `1px solid ${checked ? 'rgba(16,185,129,0.3)' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, transition: 'all 0.2s' }}>
                                                    {cert.emoji}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>{cert.label}</div>
                                                    <div style={{ fontSize: '12px', color: checked ? '#10b981' : '#64748B', fontWeight: checked ? '700' : '400' }}>
                                                        {checked ? `✓ ${fileName}` : cert.desc}
                                                    </div>
                                                </div>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: checked ? '#10b981' : 'white', border: `2px solid ${checked ? '#10b981' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', flexShrink: 0, transition: 'all 0.2s' }}>
                                                    {checked && '✓'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>← Back</button>
                                    <button onClick={handleSubmit} disabled={!form.price || loading} style={{ flex: 2, padding: '16px', background: !form.price || loading ? '#E2E8F0' : 'linear-gradient(135deg, #FF8C00, #ff5e00)', border: 'none', borderRadius: '14px', color: !form.price || loading ? '#94A3B8' : 'white', fontSize: '12px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: !form.price ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', system-ui", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: !form.price ? 'none' : '0 12px 24px rgba(255,140,0,0.3)' }}>
                                        {loading ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Publishing...</> : '🚀 Publish Listing'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Success */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '80px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'bounce 1s ease infinite' }}>🎉</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', marginBottom: '20px' }}>
                                    <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase' }}>✅ Listing Live on PetNexa</span>
                                </div>
                                <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '16px' }}>Your Pet is Listed!</h2>
                                <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '480px', lineHeight: 1.6, marginBottom: '40px' }}>
                                    <strong style={{ color: '#0F172A' }}>{form.name || 'Your pet'}</strong> is now visible to thousands of buyers on PetNexa India. You'll be notified the moment someone shows interest.
                                </p>
                                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button onClick={() => navigate('/seller/listings')} style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #FF8C00, #ff5e00)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '13px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Outfit', system-ui", boxShadow: '0 12px 28px rgba(255,140,0,0.3)' }}>
                                        View My Listings
                                    </button>
                                    <button onClick={() => { setStep(1); setPhotos([]); setForm({ name: '', breed: '', age: '', gender: 'Male', price: '', city: '', color: '', description: '', vaccination: false, health: false, license: false }); }} style={{ padding: '16px 32px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px', color: '#0F172A', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Outfit', system-ui" }}>
                                        + Add Another
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Shell>
    );
};

export default AddListing;
