import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shell } from '../../components/Shell';
import { api } from '../../utils/api';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const PetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [showBuySuccess, setShowBuySuccess] = useState<string | boolean>(false);
    const [sellerReviews, setSellerReviews] = useState<any[]>([]);
    const [stats, setStats] = useState({ rating: 0, count: 0 });
    const [showPhone, setShowPhone] = useState(false);
    const [breedData, setBreedData] = useState<any>(null);
    const [loadingBreed, setLoadingBreed] = useState(false);

    useEffect(() => {
        fetchPetDetails();
        const handleScroll = () => setScrolled(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const fetchSellerReviews = async (sellerId: number) => {
        try {
            const r = await fetch(`${ROOT_URL}review.php?action=get&target_id=${sellerId}`);
            const res = await r.json();
            if (res.success) {
                setSellerReviews(res.reviews || []);
                setStats({ rating: Number(res.average_rating) || 0, count: res.total_reviews || 0 });
            }
        } catch (e) {
            console.error('Failed to fetch reviews:', e);
        }
    };

    const fetchPetDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API_ENDPOINTS.GET_LISTING_DETAILS}?pet_id=${id}`);
            if (res && res.success && res.listing) {
                const listing = res.listing;
                setPet({
                    ...listing,
                    id: listing.pet_id,
                    name: listing.pet_name,
                    city: listing.city || 'India',
                    gallery: (listing.images && listing.images.length > 0) 
                        ? listing.images.map((i: any) => i.image_url.startsWith('http') ? i.image_url : ROOT_URL + i.image_url) 
                        : [listing.photo_url ? (listing.photo_url.startsWith('http') ? listing.photo_url : ROOT_URL + listing.photo_url) : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800`],
                    img: listing.photo_url ? (listing.photo_url.startsWith('http') ? listing.photo_url : ROOT_URL + listing.photo_url) : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800`,
                    seller: {
                        other_user_id: listing.seller_id,
                        other_user_name: listing.seller_name || 'Pet Seller',
                        name: listing.seller_name || 'Pet Seller',
                        type: 'Pet Seller',
                        rating: 4.9,
                        location: listing.city || 'India',
                        img: listing.seller_image ? (listing.seller_image.startsWith('http') ? listing.seller_image : ROOT_URL + listing.seller_image) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller_id}`,
                        phone: listing.seller_phone || '+91 98765 43210',
                        upi_id: listing.upi_id || listing.seller_upi || 'petnexa@okaxis'
                    }
                });
                fetchSellerReviews(listing.seller_id);
                if (listing.breed) {
                    fetchBreedAnalysis(listing.breed);
                }
            } else {
                setPet(null);
            }
        } catch (error) {
            console.error('Failed to fetch pet details:', error);
            setPet(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchBreedAnalysis = async (breed: string) => {
        setLoadingBreed(true);
        try {
            const res = await api.getBreedAnalysis(breed);
            if (res && res.status === 'success') {
                setBreedData(res);
            }
        } catch (e) {
            console.error('Failed to fetch breed analysis:', e);
        } finally {
            setLoadingBreed(false);
        }
    };

    if (loading) {
        return (
            <Shell role="buyer">
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin mb-6" style={{ animation: 'spin 1s linear infinite' }}></div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Details...</p>
                </div>
            </Shell>
        );
    }

    if (!pet) {
        return (
            <Shell role="buyer">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Pet Not Found</h3>
                    <p className="text-slate-500 font-medium mb-8">This listing may have been removed or is unavailable.</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Go Back</button>
                </div>
            </Shell>
        );
    }

    const handleCall = () => {
        setShowPhone(true);
    };

    const handleChat = () => {
        navigate('/messages', { state: { recipient: pet.seller } });
    };

    const handleBuyNow = async (method: string) => {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            alert('Please login to purchase.');
            navigate('/login');
            return;
        }
        const user = JSON.parse(userRaw);

        const formData = new FormData();
        formData.append('pet_id', pet.id);
        formData.append('buyer_id', user.user_id);
        formData.append('seller_id', pet.seller_id);
        formData.append('amount', pet.price);
        formData.append('payment_method', method);
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
                navigate('/order-success', { state: { petName: pet.name, method: method } });
            } else {
                alert(data.message || 'Failed to place order.');
                setShowBuySuccess(false);
            }
        } catch (e) {
            console.error(e);
            alert('Connection failed. Please check your network.');
        }
    };

    const isAvailable = !pet.availability_status || pet.availability_status.toLowerCase() === 'available';

    return (
        <Shell role="buyer">
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .parallax-img {
                    transition: transform 0.5s cubic-bezier(0.2, 0, 0, 1);
                }
                .sticky-bottom {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    padding: 16px 24px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
                    z-index: 100;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .attribute-card {
                    background: white;
                    border-radius: 20px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
            `}</style>

            <div style={{ position: 'relative', minHeight: '100vh', background: '#f8fafc', paddingBottom: '100px' }}>

                {/* Hero Section */}
                <div style={{ position: 'relative', height: '500px', overflow: 'hidden', borderRadius: '32px', margin: '0 0 32px 0' }}>
                    <motion.img
                        src={pet.gallery[activeImg] || pet.img}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1 }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent 60%)' }} />

                    <button
                        onClick={() => navigate(-1)}
                        style={{ position: 'absolute', top: '24px', left: '24px', width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                        ←
                    </button>

                    <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: isAvailable ? '#10b981' : '#f43f5e', borderRadius: '100px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: isAvailable ? 'pulse 2s infinite' : 'none' }} />
                                    {isAvailable ? 'Available' : (pet.availability_status || 'Reserved')}
                                </div>
                                <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>{pet.name}</h1>
                                <p style={{ fontSize: '18px', opacity: 0.9, fontWeight: '500' }}>{pet.breed} · {pet.city}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Price</div>
                                <div style={{ fontSize: '42px', fontWeight: '900', color: '#fbbf24' }}>₹{pet.price.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {[
                                { emoji: '🎂', label: 'Age', value: `${pet.age} Yrs`, color: '#fef3c7', text: '#d97706' },
                                { emoji: '📐', label: 'Gender', value: pet.gender || 'Male', color: '#e0f2fe', text: '#0284c7' },
                                { emoji: '⚖️', label: 'Weight', value: pet.weight || '5kg', color: '#fce7f3', text: '#db2777' },
                                { emoji: '💉', label: 'Vaccinated', value: pet.vaccinated ? 'Yes' : 'No', color: '#dcfce7', text: '#16a34a' }
                            ].map((attr, idx) => (
                                <motion.div key={idx} className="attribute-card" whileHover={{ y: -5 }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: attr.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{attr.emoji}</div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{attr.label}</span>
                                    <span style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>{attr.value}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>About {pet.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>
                                {pet.description || "No description provided."}
                            </p>
                        </div>
                        
                        {/* AI Breed Analysis Section */}
                        {breedData && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', borderRadius: '32px', padding: '32px', border: '1px solid #FFEDD5', boxShadow: '0 20px 40px rgba(251,191,36,0.05)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <span style={{ fontSize: '24px' }}>✨</span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: 0 }}>AI Breed Intelligence</h3>
                                        <p style={{ fontSize: '12px', color: '#B45309', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Smart Care Insights for {pet.breed}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                                    <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #FFEDD5' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>🍎 Best Diet</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{breedData.food_best}</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #FFEDD5' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>🎾 Exercise</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{breedData.exercise}</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #FFEDD5' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>🏥 Vet Checkups</div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{breedData.vet_checkup}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '24px', border: '1px solid #DCFCE7' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#166534', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '18px' }}>✅</span> Expert Do's
                                        </h4>
                                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {breedData.dos && breedData.dos.map((item: string, i: number) => (
                                                <li key={i} style={{ fontSize: '13px', color: '#15803d', fontWeight: '600', display: 'flex', alignItems: 'start', gap: '8px' }}>
                                                    <span style={{ color: '#22c55e' }}>•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div style={{ background: '#FEF2F2', padding: '20px', borderRadius: '24px', border: '1px solid #FEE2E2' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#991B1B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '18px' }}>❌</span> Expert Don'ts
                                        </h4>
                                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {breedData.donts && breedData.donts.map((item: string, i: number) => (
                                                <li key={i} style={{ fontSize: '13px', color: '#991B1B', fontWeight: '600', display: 'flex', alignItems: 'start', gap: '8px' }}>
                                                    <span style={{ color: '#ef4444' }}>•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Photo Gallery</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {pet.gallery.map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        style={{ height: '100px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: activeImg === i ? '3px solid #FF8C00' : 'none' }}
                                    >
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                             <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <span style={{ fontSize: '24px' }}>🛡️</span> Documents & Certifications
                             </h3>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                 {pet.certificates && pet.certificates.length > 0 ? pet.certificates.map((cert: any, i: number) => (
                                     <div key={i} style={{ position: 'relative', overflow: 'hidden', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }} className="group">
                                         <div style={{ padding: '20px' }}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                                 <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                     {cert.certificate_type.toUpperCase().includes('VACCIN') ? '💉' : 
                                                      cert.certificate_type.toUpperCase().includes('HEALTH') ? '🏥' : '📄'}
                                                 </div>
                                                 <div style={{ flex: 1 }}>
                                                     <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', lineHeight: 1.2 }}>{cert.certificate_type}</div>
                                                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Professional ✓</div>
                                                 </div>
                                             </div>
                                             <div style={{ display: 'flex', gap: '8px' }}>
                                                 <a 
                                                     href={cert.certificate_file.startsWith('http') ? cert.certificate_file : ROOT_URL + cert.certificate_file} 
                                                     target="_blank" 
                                                     rel="noopener noreferrer"
                                                     style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px', fontWeight: '800', textDecoration: 'none', transition: 'all 0.2s' }}
                                                 >
                                                     Open Doc
                                                 </a>
                                                 <a 
                                                     href={cert.certificate_file.startsWith('http') ? cert.certificate_file : ROOT_URL + cert.certificate_file} 
                                                     download={`${pet.name}_${cert.certificate_type}.pdf`}
                                                     style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#FF8C00', borderRadius: '12px', border: 'none', color: 'white', fontSize: '12px', fontWeight: '800', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                 >
                                                     <span>📥</span> Download
                                                 </a>
                                             </div>
                                         </div>
                                     </div>
                                 )) : (
                                     <div style={{ gridColumn: '1 / -1', padding: '32px', background: '#fff7ed', borderRadius: '24px', border: '1px dashed #ffedd5', textAlign: 'center' }}>
                                         <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                                         <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#9a3412', marginBottom: '4px' }}>Pending Documentation</h4>
                                         <p style={{ color: '#c2410c', fontSize: '13px', fontWeight: '500' }}>The seller hasn't uploaded digital certificates yet. You can request them via chat.</p>
                                         <button onClick={handleChat} style={{ marginTop: '16px', padding: '10px 20px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Request Docs</button>
                                     </div>
                                 )}
                             </div>
                        </div>


                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9' }}>
                             <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Seller Reviews ({stats.count})</h3>
                             <div className="space-y-6">
                                 {sellerReviews.length > 0 ? sellerReviews.slice(0, 3).map((rev, i) => (
                                     <div key={i} style={{ paddingBottom: '16px', borderBottom: i !== sellerReviews.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="font-black text-slate-900 text-sm">{rev.reviewer_name}</span>
                                             <div className="flex text-amber-500 text-[10px]">{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</div>
                                         </div>
                                         <p className="text-slate-500 text-sm leading-relaxed">{rev.comment || rev.review_text}</p>
                                     </div>
                                 )) : (
                                     <p className="text-slate-400 text-sm italic">No reviews yet for this seller.</p>
                                 )}
                                 {sellerReviews.length > 3 && (
                                     <button onClick={() => navigate(`/reviews?targetId=${pet.seller.other_user_id}&type=seller&name=${pet.seller.name}`)} className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-4">View All Reviews →</button>
                                 )}
                             </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', position: 'sticky', top: '100px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sold By</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
                                <img src={pet.seller.img} style={{ width: '60px', height: '60px', borderRadius: '18px', objectFit: 'cover' }} />
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '2px' }}>{pet.seller.name}</h4>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>{pet.seller.type}</p>
                                </div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Rating</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '900' }}>⭐ {stats.rating}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Reviews</span>
                                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800' }}>{stats.count}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleChat} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#e0e7ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4338ca', fontWeight: '700', fontSize: '14px' }}>
                                    💬 Chat
                                </button>
                            </div>
                            <button onClick={() => navigate(`/reviews?targetId=${pet.seller.other_user_id}&type=seller&name=${pet.seller.name}`)} style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ⭐ View Seller Reviews
                            </button>
                        </div>


                    </div>
                </div>

                {isAvailable && (
                    <div className="sticky-bottom">
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Current Price</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>₹{pet.price.toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flex: 2 }}>
                            <button onClick={handleChat} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#f1f5f9', border: 'none', color: '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>Message Seller</button>
                            <button onClick={() => setShowBuySuccess('payment')} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF8C00, #FFA500)', border: 'none', color: 'white', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 12px 24px rgba(99,102,241,0.3)' }}>Buy Now 🚀</button>
                        </div>
                    </div>
                )}

                <AnimatePresence mode='wait'>
                    {(showBuySuccess === 'payment' || showBuySuccess === 'payment_upi') && (
                        <motion.div key="payment-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', textAlign: 'center', maxWidth: '440px', width: '100%' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Select Payment</h2>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Choose how you'd like to pay for {pet.name}.</p>
                                
                                <div style={{ marginBottom: '24px', textAlign: 'left', padding: '16px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Details</h4>
                                    <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                                        <strong>{JSON.parse(localStorage.getItem('user') || '{}').full_name}</strong><br/>
                                        {JSON.parse(localStorage.getItem('user') || '{}').phone}<br/>
                                        {JSON.parse(localStorage.getItem('user') || '{}').address || 'No address added. Please update in profile.'}
                                    </div>
                                    <button onClick={() => navigate('/profile')} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#FF8C00', fontSize: '12px', fontWeight: '800', cursor: 'pointer', padding: 0 }}>Edit Info →</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                    {showBuySuccess === 'payment_upi' ? (
                                        <div style={{ background: '#EEF2FF', borderRadius: '24px', padding: '24px', border: '2px dashed #4338CA', textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Simulating UPI Payment (Mock)</div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b4b', marginBottom: '8px' }}>₹{pet.price.toLocaleString('en-IN')}</div>
                                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Paying to: <b>{pet.seller.name}</b></p>
                                            
                                            <button 
                                                onClick={() => handleBuyNow('UPI')}
                                                style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #4338CA, #6366f1)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}
                                            >
                                                ⚡ Confirm & Pay (Mock Success)
                                            </button>
                                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>This is a mock payment for testing.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowBuySuccess('payment_upi')}
                                                style={{
                                                    padding: '20px', borderRadius: '20px', border: '2px solid',
                                                    borderColor: '#FF8C00', background: '#fff7f0',
                                                    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '28px' }}>⚡</div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: '900', color: '#1e1b4b', fontSize: '15px' }}>Instant UPI Payment</div>
                                                    <div style={{ fontSize: '12px', color: '#FF8C00', fontWeight: '600' }}>Pay via GPay, PhonePe or Amazon Pay</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleBuyNow('COD')}
                                                style={{
                                                    padding: '20px', borderRadius: '20px', border: '2px solid #f1f5f9',
                                                    background: 'white', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '28px' }}>🏠</div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '15px' }}>Cash on Delivery</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Pay in cash when you receive the pet</div>
                                                </div>
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button onClick={() => setShowBuySuccess(false)} style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};

export default PetDetails;
