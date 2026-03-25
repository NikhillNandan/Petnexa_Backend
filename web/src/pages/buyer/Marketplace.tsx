import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const SavedPets = () => {
    return (
        <Marketplace isSaved={true} />
    );
};

const CATEGORIES = ['All', 'Dogs', 'Cats'];

const Marketplace = ({ isSaved = false }: { isSaved?: boolean }) => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [sort, setSort] = useState('popular');
    const [buyModal, setBuyModal] = useState<any>(null);
    const [purchased, setPurchased] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [showPhoneId, setShowPhoneId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'buyer');

    useEffect(() => {
        const r = localStorage.getItem('role');
        if (r) setUserRole(r);
    }, []);

    useEffect(() => {
        fetchPets();
        
        // Listen for location updates from Shell
        const handleLocationUpdate = () => {
             fetchPets();
        };
        window.addEventListener('locationUpdated', handleLocationUpdate);
        return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
    }, [category, search]);

    const fetchPets = async () => {
        setLoading(true);
        try {
            const userRaw = localStorage.getItem('user');
            let favs: number[] = [];
            if (userRaw) {
                const user = JSON.parse(userRaw);
                const favRes = await fetch(`${API_ENDPOINTS.GET_SAVED_PETS}?buyer_id=${user.user_id}`);
                const favData = await favRes.json();
                if (favData.success) {
                    // Backend returns 'pets' array in get_saved_pets.php
                    const savedList = favData.pets || favData.saved_pets || [];
                    favs = savedList.map((fp: any) => fp.pet_id);
                    setFavorites(favs);
                    
                    if (isSaved) {
                        setPets(savedList);
                        setLoading(false);
                        return; // Done for saved view
                    }
                }
            }

            let species = category === 'All' ? '' : (category === 'Dogs' ? 'Dog' : 'Cat');
            
            let lat = '';
            let lng = '';
            if (userRaw) {
                const user = JSON.parse(userRaw);
                lat = user.latitude || '';
                lng = user.longitude || '';
            }

            // Radius is 50km in backend by default
            const url = `${API_ENDPOINTS.GET_PETS}?species=${species}&search=${search}&lat=${lat}&lng=${lng}`;
            const res = await api.get(url);
            if (res && res.success) {
                setPets(res.pets || res.listings || []);
            }
        } catch (err) {
            console.error('Failed to fetch pets:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFav = async (id: number) => {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            alert('Please log in to save pets.');
            return;
        }
        const user = JSON.parse(userRaw);

        const isCurrentlySaved = favorites.includes(id);
        const next = isCurrentlySaved ? favorites.filter(f => f !== id) : [...favorites, id];
        setFavorites(next); // optimistic UI update

        try {
            await fetch(API_ENDPOINTS.SAVE_PET, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer_id: user.user_id,
                    pet_id: id,
                    action: isCurrentlySaved ? 'unsave' : 'save'
                })
            });
        } catch (err) {
            console.error('Failed to toggle save pet', err);
            // Revert optimistic update
            setFavorites(isCurrentlySaved ? [...favorites, id] : favorites.filter(f => f !== id));
        }
    };

    let filtered = pets;

    // Filter by category/search if not in saved mode (saved mode already fetched specific pets)
    if (!isSaved) {
        // Search/Category filtering is already handled by the API call in fetchPets
        // but if we want local refinement, we could add it here.
    }

    if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
    // Rating isn't in backend yet, so we'll just skip or use a default
    // else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.pet_rating - a.pet_rating);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`);
                    const data = await res.json();
                    
                    if (data && data.address) {
                        const a = data.address;

                        if (a.country === 'South Korea' || a.country_code === 'kr' || a.country === 'North Korea') {
                             throw new Error("Suspicious GPS");
                        }

                        const city = a.city || a.town || a.village || a.state_district || a.state || '';
                        if (city && (a.country === 'India' || a.country_code === 'in')) {
                            setSearch(city);
                            // Also update global user location
                            const userRaw = localStorage.getItem('user');
                            if (userRaw) {
                                const user = JSON.parse(userRaw);
                                const updated = { ...user, latitude, longitude, city };
                                localStorage.setItem('user', JSON.stringify(updated));
                                window.dispatchEvent(new CustomEvent('locationUpdated', { detail: updated }));
                                alert(`📍 Precise location detected: ${city}`);
                            }
                        } else if (city) {
                             // If not India, but we have a city, maybe it's okay but let's be careful
                             setSearch(city);
                             alert(`📍 Location detected: ${city}`);
                        }
                    }
                } catch (err) {
                    console.log('GPS failed/suspicious, trying IP fallback...');
                    await fallbackToIPMarketplace();
                } finally {
                    setIsLocating(false);
                }
            },
            async (err) => {
                await fallbackToIPMarketplace();
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const fallbackToIPMarketplace = async () => {
        try {
            let res = await fetch('https://ipapi.co/json/');
            let ipData = await res.json();
            
            if (!ipData.city || ipData.country_code === 'KR') {
                res = await fetch('http://ip-api.com/json');
                ipData = await res.json();
                ipData.latitude = ipData.lat;
                ipData.longitude = ipData.lon;
            }

            if (ipData.city) {
                setSearch(ipData.city);
                const userRaw = localStorage.getItem('user');
                if (userRaw) {
                    const user = JSON.parse(userRaw);
                    const updated = { ...user, latitude: ipData.latitude, longitude: ipData.longitude, city: ipData.city };
                    localStorage.setItem('user', JSON.stringify(updated));
                    window.dispatchEvent(new CustomEvent('locationUpdated', { detail: updated }));
                }
                alert(`📍 Location detected via network: ${ipData.city}`);
            }
        } catch (e) {
            alert('Error getting city name. Please try manual search.');
        }
    };

    const handleBuy = async () => {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            alert('Please login to purchase.');
            navigate('/login');
            return;
        }
        const user = JSON.parse(userRaw);

        const formData = new FormData();
        formData.append('pet_id', buyModal.pet_id);
        formData.append('buyer_id', user.user_id);
        formData.append('seller_id', buyModal.seller_id);
        formData.append('amount', buyModal.price);
        formData.append('payment_method', buyModal.paymentMethod || 'UPI');
        
        // Add delivery info
        formData.append('delivery_address', user.address || '');
        formData.append('delivery_name', user.full_name || '');
        formData.append('delivery_phone', user.phone || '');

        try {
            const res = await fetch(`${ROOT_URL}pet_order.php?action=create`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                fetchPets(); // refresh listings
                navigate('/order-success', { 
                    state: { 
                        petName: buyModal.pet_name, 
                        method: buyModal.paymentMethod === 'COD' ? 'COD' : 'UPI' 
                    } 
                });
            } else {
                alert(data.message || 'Failed to place order.');
            }
        } catch (e) {
            console.error(e);
            alert('Connection failed. Please check your network.');
        }
    };

    const handleConfirmStep = () => {
        if (buyModal.paymentMethod === 'UPI' || !buyModal.paymentMethod) {
            setBuyModal({ ...buyModal, showUPI: true });
        } else {
            handleBuy();
        }
    };

    return (
        <Shell role={userRole}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

            {/* Buy Modal */}
            {buyModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }} onClick={() => { setBuyModal(null); setPurchased(false); }}>
                    <div style={{ background: 'white', borderRadius: '28px', padding: '40px', maxWidth: '480px', width: '90%', boxShadow: '0 40px 80px rgba(0,0,0,0.25)', animation: 'fadeIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
                        {purchased ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                                <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '12px' }}>Payment Successful!</h3>
                                <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                                    You have successfully purchased <strong>{buyModal.name}</strong>. The seller will contact you within 24 hours to arrange delivery.
                                </p>
                                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', color: '#10b981', fontSize: '14px', fontWeight: '700', marginBottom: '24px' }}>
                                    ✅ Receipt sent to your email & SMS
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '14px', background: '#0F172A', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>View My Orders</button>
                                    <button onClick={() => { setBuyModal(null); setPurchased(false); }} style={{ width: '100%', padding: '14px', background: '#F1F5F9', border: 'none', borderRadius: '12px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>Done</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', alignItems: 'center' }}>
                                    {(() => {
                                        const rawImg = buyModal.photo_url || buyModal.image_url;
                                        const finalImg = rawImg 
                                            ? (rawImg.startsWith('http') ? rawImg : ROOT_URL + rawImg)
                                            : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
                                        
                                        return (
                                            <img 
                                                src={finalImg} 
                                                alt={buyModal.pet_name} 
                                                style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0 }} 
                                            />
                                        );
                                    })()}
                                    <div>
                                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>{buyModal.pet_name}</h3>
                                        <p style={{ fontSize: '13px', color: '#64748B' }}>{buyModal.breed} · {buyModal.city || 'India'}</p>
                                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', letterSpacing: '-0.03em', marginTop: '6px' }}>₹{buyModal.price.toLocaleString('en-IN')}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Choose Payment</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div
                                            onClick={() => setBuyModal({ ...buyModal, paymentMethod: 'UPI' })}
                                            style={{ padding: '16px', borderRadius: '16px', border: '2px solid', borderColor: (buyModal.paymentMethod === 'UPI' || !buyModal.paymentMethod) ? '#FF8C00' : '#F1F5F9', background: (buyModal.paymentMethod === 'UPI' || !buyModal.paymentMethod) ? '#EEF2FF' : 'white', cursor: 'pointer', textAlign: 'center' }}
                                        >
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📱</div>
                                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#4338CA' }}>UPI</div>
                                        </div>
                                        <div
                                            onClick={() => setBuyModal({ ...buyModal, paymentMethod: 'COD' })}
                                            style={{ padding: '16px', borderRadius: '16px', border: '2px solid', borderColor: buyModal.paymentMethod === 'COD' ? '#FF8C00' : '#F1F5F9', background: buyModal.paymentMethod === 'COD' ? '#EEF2FF' : 'white', cursor: 'pointer', textAlign: 'center' }}
                                        >
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>💵</div>
                                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#4338CA' }}>Cash</div>
                                        </div>
                                    </div>
                                </div>

                                {buyModal.showUPI && (
                                    <div style={{ marginBottom: '24px', background: '#EEF2FF', borderRadius: '20px', padding: '24px', border: '2px dashed #4338CA', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Simulating UPI Payment (Mock)</div>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981', marginBottom: '8px' }}>₹{buyModal.price.toLocaleString('en-IN')}</div>
                                        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>Receiver: <b>{buyModal.seller_name || 'Pet Seller'}</b></p>
                                        <button 
                                            onClick={handleBuy}
                                            style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4338CA, #6366f1)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', marginBottom: '16px' }}
                                        >
                                            🚀 Confirm & Pay Success
                                        </button>
                                        <p style={{ fontSize: '10px', color: '#94a3b8' }}>Test Mode: One-click mock payment active.</p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px', textAlign: 'left', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Delivery To</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                                        <strong>{JSON.parse(localStorage.getItem('user') || '{}').full_name}</strong><br/>
                                        {JSON.parse(localStorage.getItem('user') || '{}').phone}<br/>
                                        {JSON.parse(localStorage.getItem('user') || '{}').address || 'No address added.'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setBuyModal(null)} style={{ flex: 1, padding: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>Cancel</button>
                                    <button onClick={buyModal.showUPI ? handleBuy : handleConfirmStep} style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '12px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui", boxShadow: '0 12px 24px rgba(16,185,129,0.3)' }}>
                                        {buyModal.showUPI ? '✅ I Have Paid' : (buyModal.paymentMethod === 'COD' ? '✅ Confirm Purchase' : 'Next Step →')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>

                {/* Hero Banner */}
                {!isSaved && (
                    <div style={{ borderRadius: '28px', overflow: 'hidden', height: '320px', position: 'relative' }}>
                        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1400" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="marketplace hero" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 70%, transparent 100%)' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '48px' }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(99,102,241,0.8)', borderRadius: '100px', marginBottom: '18px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                    <span style={{ color: 'white', fontSize: '10px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase' }}>1,200+ Pets Available</span>
                                </div>
                                <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: '900', color: 'white', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '14px' }}>
                                    Buy a<br /><span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dog or Cat 🐾</span>
                                </h1>
                                <p style={{ color: 'rgba(203,213,225,0.8)', fontSize: '16px', maxWidth: '380px', lineHeight: 1.6, marginBottom: '24px' }}>
                                    India's most trusted marketplace for healthy, certified pets from breeders.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button style={{ padding: '13px 24px', background: 'white', border: 'none', borderRadius: '12px', color: '#0F172A', fontSize: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Outfit', system-ui" }}>Browse All</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Title for Saved */}
                {isSaved && (
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                            Saved Pets <span style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>❤️</span>
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '15px' }}>Pets you have saved for later. Buy before they are gone!</p>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '10px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'Outfit', system-ui", border: 'none', background: category === cat ? '#FF8C00' : 'white', color: category === cat ? 'white' : '#64748B', boxShadow: category === cat ? '0 8px 20px rgba(255,140,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '11px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minWidth: '320px', position: 'relative' }}>
                            <span style={{ fontSize: '16px' }}>🔍</span>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search breed, city..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontWeight: '500', color: '#0F172A', width: '100%', fontFamily: "'Outfit', system-ui" }} />
                        </div>
                        <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '11px 18px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#0F172A', cursor: 'pointer', fontFamily: "'Outfit', system-ui", outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <option value="popular">Sort: Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>
                        Showing <strong style={{ color: '#0F172A' }}>{filtered.length}</strong> pets {category !== 'All' ? `in ${category}` : ''}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', background: 'rgba(99,102,241,0.08)', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>India-wide</span>
                </div>

                {/* Pet Grid */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '16px', color: '#64748B', fontWeight: '600', fontSize: '14px' }}>Loading Amazing Pets...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filtered.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                        {filtered.map((pet: any, i: number) => (
                            <motion.div key={pet.pet_id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                onClick={() => navigate(`/pet/${pet.pet_id}`)}
                                style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 24px 48px -10px ${pet.color || '#FF8C00'}25`; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                {/* Image */}
                                <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                                    {(() => {
                                        const rawImg = pet.photo_url || pet.image_url;
                                        const finalImg = rawImg 
                                            ? (rawImg.startsWith('http') ? rawImg : ROOT_URL + rawImg)
                                            : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800';
                                        
                                        return (
                                            <img 
                                                src={finalImg} 
                                                alt={pet.pet_name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                                                onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = 'scale(1.08)')} 
                                                onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = 'scale(1)')} 
                                            />
                                        );
                                    })()}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

                                    {/* Fav */}
                                    {userRole === 'buyer' && (
                                        <button onClick={e => { e.stopPropagation(); toggleFav(pet.pet_id); }}
                                            style={{ position: 'absolute', top: '14px', right: '14px', width: '40px', height: '40px', borderRadius: '12px', background: favorites.includes(pet.pet_id) ? '#ec4899' : 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {favorites.includes(pet.pet_id) ? '❤️' : '🤍'}
                                        </button>
                                    )}

                                    {/* Age badge */}
                                    <div style={{ position: 'absolute', top: '14px', left: '14px', padding: '4px 12px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px', color: 'white', fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em', backdropFilter: 'blur(8px)' }}>
                                        {pet.age} Yrs
                                    </div>


                                    {/* Health cert */}
                                    {pet.certified && (
                                        <div style={{ position: 'absolute', bottom: '14px', left: '14px', padding: '4px 12px', background: 'rgba(16,185,129,0.9)', borderRadius: '8px', color: 'white', fontSize: '10px', fontWeight: '800', backdropFilter: 'blur(8px)', letterSpacing: '0.05em' }}>
                                            ✅ Health Certified
                                        </div>
                                    )}


                                </div>

                                {/* Info */}
                                <div style={{ padding: '22px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: (!pet.availability_status || pet.availability_status?.toLowerCase() === 'available') ? '#10b981' : '#f43f5e', animation: (!pet.availability_status || pet.availability_status?.toLowerCase() === 'available') ? 'pulse 2s infinite' : 'none' }} />
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                            {pet.availability_status || 'Available'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '4px' }}>{pet.pet_name}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                                        {pet.breed} · {pet.gender} · 
                                        <span 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/reviews?targetId=${pet.user_id || pet.seller_id}&type=seller&name=${pet.seller_name}`);
                                            }}
                                            style={{ color: '#FF8C00', fontWeight: '800', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}
                                        >
                                            {pet.seller_name || 'Seller'}
                                        </span>
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', marginBottom: '18px' }}>📍 {pet.city || 'India'}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowPhoneId(pet.pet_id); }}
                                            style={{ padding: '10px', background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '12px', color: '#FF8C00', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            {showPhoneId === pet.pet_id ? pet.seller_phone : '📞 Call'}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate('/messages', { state: { recipient: { id: pet.seller_id, name: pet.seller_name, img: pet.seller_image, phone: pet.seller_phone } } }); }}
                                            style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#6366f1', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                        >
                                            💬 Chat
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F8FAFC' }}>
                                        <div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '2px' }}>Price</div>
                                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#10b981', letterSpacing: '-0.04em' }}>₹{pet.price.toLocaleString('en-IN')}</div>
                                        </div>
                                        {userRole === 'buyer' && (
                                            <button onClick={(e) => { e.stopPropagation(); setBuyModal(pet); }} style={{ padding: '12px 20px', background: '#0F172A', border: 'none', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', system-ui", transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = '#FF8C00'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,140,0,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                🛍️ Buy Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '56px', marginBottom: '20px' }}>{isSaved ? '💔' : '🔍'}</div>
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
                            {isSaved ? 'No Saved Pets' : 'No Pets Found'}
                        </h3>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>
                            {isSaved ? 'Browse the Marketplace and save pets you love!' : 'Try a different category or search term.'}
                        </p>
                        {isSaved && <button onClick={() => navigate('/marketplace')} style={{ marginTop: '20px', padding: '12px 28px', background: '#FF8C00', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Outfit', system-ui" }}>Browse Marketplace →</button>}
                    </div>
                )}
            </div>
        </Shell>
    );
};

export { SavedPets };
export default Marketplace;
