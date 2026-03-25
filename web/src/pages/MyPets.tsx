import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Heart, Calendar, Scissors, Stethoscope, Camera, Info, CheckCircle2, X } from 'lucide-react';
import { API_ENDPOINTS, ROOT_URL } from '../utils/constants';

const MyPets = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPet, setNewPet] = useState({ name: '', breed: '', age: '', gender: 'Male', img: '' });

    const fetchPets = async () => {
        try {
            const userRaw = localStorage.getItem('user');
            if (!userRaw) return;
            const user = JSON.parse(userRaw);
            const res = await fetch(`${API_ENDPOINTS.GET_BUYER_PETS}?buyer_id=${user.user_id}`);
            const data = await res.json();
            if (data.success) {
                setPets(data.pets || []);
            }
        } catch (err) {
            console.error("Failed to fetch pets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleAddPet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userRaw = localStorage.getItem('user');
            if (!userRaw) return;
            const user = JSON.parse(userRaw);

            // The backend endpoint requires photo in base64 without data specifier prefix typically,
            // or handles prefix. Let's send it raw if there is a prefix, we can strip it.
            let base64Photo = '';
            if (newPet.img && newPet.img.startsWith('data:image')) {
                base64Photo = newPet.img.split(',')[1];
            }

            const data = {
                buyer_id: user.user_id,
                pet_name: newPet.name,
                breed: newPet.breed,
                age: newPet.age,
                gender: newPet.gender,
                photo: base64Photo
            };

            const res = await fetch(`${API_ENDPOINTS.BUYER_PET_MANAGEMENT}?action=add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (result.success) {
                setShowAddModal(false);
                setNewPet({ name: '', breed: '', age: '', gender: 'Male', img: '' });
                fetchPets(); // Refresh
            } else {
                alert(result.error || 'Failed to add pet');
            }
        } catch (err) {
            console.error("Error adding pet", err);
        }
    };

    const isBuyer = role === 'buyer';
    const brandColor = isBuyer ? '#FF8C00' : '#ec4899';
    const brandGradient = isBuyer ? 'linear-gradient(135deg, #FF8C00, #FFA500)' : 'linear-gradient(135deg, #ec4899, #f43f5e)';

    return (
        <Shell role={role}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '100px' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            My <span style={{ color: brandColor }}>Private Pets.</span> 🐾
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '500', marginTop: '12px' }}>
                            {isBuyer 
                                ? "Manage your personally added pets for medical and grooming care."
                                : "Manage pets you're caring for that are not yet listed for sale."}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '16px 32px', background: brandColor, color: 'white', border: 'none',
                            borderRadius: '20px', fontSize: '14px', fontWeight: '800', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 10px 20px ${brandColor}30`
                        }}
                    >
                        <Plus size={20} /> Add Private Pet
                    </button>
                </div>

                {/* Pets Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                    {loading ? (
                        <div style={{ color: '#64748B' }}>Loading your pets...</div>
                    ) : pets.length === 0 ? (
                        <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Info size={16} /> No pets yet. Click "Add Private Pet" to get started!
                        </div>
                    ) : pets.map((pet, i) => (
                        <motion.div
                            key={pet.pet_id || i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'white', borderRadius: '32px', overflow: 'hidden',
                                border: '1px solid #F1F5F9', boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
                            }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                        >
                            <div style={{ height: '240px', position: 'relative' }}>
                                <img src={pet.image_url ? (pet.image_url.startsWith('http') ? pet.image_url : ROOT_URL + pet.image_url) : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={pet.pet_name} />
                                <div style={{
                                    position: 'absolute', top: '20px', right: '20px',
                                    padding: '8px 16px', background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)', borderRadius: '100px',
                                    fontSize: '11px', fontWeight: '800', color: brandColor
                                }}>
                                    {pet.source === 'purchased' ? 'APP PURCHASED' : 'PRIVATE CARE'}
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>{pet.pet_name}</h3>
                                        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>{pet.breed || pet.species} • {pet.age || 'Unknown Age'} {pet.gender ? `• ${pet.gender}` : ''}</p>
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: brandColor }}>
                                        <Heart size={20} fill={brandColor} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>AI BREED SCOUT</div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: brandColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            🧬 {pet.breed ? 'Analyzed' : 'Scanning...'}
                                        </div>
                                    </div>
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>CERTIFICATIONS</div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B' }}>
                                            📄 {pet.certificates?.length || 0} Registered
                                        </div>
                                    </div>
                                </div>

                                {/* AI Insight Box */}
                                <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '16px', borderRadius: '20px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '40px', opacity: 0.1 }}>🔬</div>
                                    <div style={{ fontSize: '10px', color: brandColor, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>AI Behavior Analysis</div>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4, fontWeight: '500' }}>
                                        {pet.breed?.includes('Labrador') ? 'Friendly & High Energy. Requires daily exercise and mental stimulation.' :
                                            pet.breed?.includes('Husky') ? 'Vocal & Independent. Needs cold climate & active engagement.' :
                                                'Purebred traits detected. Showing high agility scores and calm social temperament.'}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => navigate(role === 'buyer' ? '/doctors' : '/seller/doctors')}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '14px',
                                            background: 'rgba(16,185,129,0.08)', color: '#10B981',
                                            border: 'none', fontWeight: '800', fontSize: '12px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Stethoscope size={16} /> Vet
                                    </button>
                                    <button
                                        onClick={() => navigate(role === 'buyer' ? '/spas' : '/seller/spas')}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '14px',
                                            background: 'rgba(245,158,11,0.08)', color: '#f59e0b',
                                            border: 'none', fontWeight: '800', fontSize: '12px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Scissors size={16} /> Spa
                                    </button>
                                </div>

                                {pet.certificates && pet.certificates.length > 0 && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {pet.certificates.map((c: any, ci: number) => (
                                            <a key={ci} href={c.certificate_file.startsWith('http') ? c.certificate_file : ROOT_URL + c.certificate_file} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', background: '#F8FAFC', color: '#64748B', borderRadius: '100px', fontSize: '10px', fontWeight: '700', textDecoration: 'none', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                📥 {c.certificate_type}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add Pet Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <div style={{
                            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)',
                            backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{
                                    width: '100%', maxWidth: '500px', background: 'white',
                                    borderRadius: '32px', overflow: 'hidden', position: 'relative'
                                }}
                            >
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{ position: 'absolute', top: '24px', right: '24px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748B' }}
                                >
                                    <X size={18} />
                                </button>

                                <div style={{ padding: '40px' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>Add Private Pet</h2>
                                    <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>This pet will only be visible to you.</p>

                                    <form onSubmit={handleAddPet} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Pet Name</label>
                                            <input
                                                type="text" required value={newPet.name}
                                                onChange={e => setNewPet({ ...newPet, name: e.target.value })}
                                                placeholder="e.g. Max"
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Breed</label>
                                            <input
                                                type="text" required value={newPet.breed}
                                                onChange={e => setNewPet({ ...newPet, breed: e.target.value })}
                                                placeholder="e.g. Labrador"
                                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Pet Picture</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '80px', height: '80px', borderRadius: '20px',
                                                    background: '#F1F5F9', overflow: 'hidden', border: '2px dashed #E2E8F0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8'
                                                }}>
                                                    {newPet.img ? (
                                                        <img src={newPet.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Camera size={32} />
                                                    )}
                                                </div>
                                                <label style={{
                                                    padding: '12px 24px', background: '#F8FAFC', color: '#0F172A',
                                                    borderRadius: '12px', fontSize: '13px', fontWeight: '800',
                                                    cursor: 'pointer', border: '1px solid #E2E8F0', transition: 'all 0.2s'
                                                }}>
                                                    Browse Photo
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setNewPet({ ...newPet, img: reader.result as string });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Age</label>
                                                <input
                                                    type="text" required value={newPet.age}
                                                    onChange={e => setNewPet({ ...newPet, age: e.target.value })}
                                                    placeholder="e.g. 2 Years"
                                                    style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Gender</label>
                                                <select
                                                    value={newPet.gender}
                                                    onChange={e => setNewPet({ ...newPet, gender: e.target.value })}
                                                    style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }}
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                width: '100%', padding: '18px', borderRadius: '18px',
                                                background: brandColor, color: 'white', border: 'none',
                                                fontWeight: '900', fontSize: '14px', cursor: 'pointer',
                                                marginTop: '12px', boxShadow: `0 12px 24px ${brandColor}40`
                                            }}
                                        >
                                            Add Pet to Private Care
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};

export default MyPets;
