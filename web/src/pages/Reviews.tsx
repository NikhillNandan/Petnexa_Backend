import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROOT_URL } from '../utils/constants';

const Reviews = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const targetId = queryParams.get('targetId');
    const targetType = queryParams.get('type');
    const targetName = queryParams.get('name');

    const [sellerTab, setSellerTab] = useState<'received' | 'given'>(queryParams.get('tab') === 'given' ? 'given' : 'received');
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewable, setReviewable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const roleColors: any = {
        buyer: '#FF8C00',
        seller: '#ec4899',
        doctor: '#10b981',
        spa: '#F60076',
        spa_owner: '#F60076',
        vet: '#10b981'
    };
    const normalizedRole = role.toLowerCase();
    const color = targetType ? (roleColors[targetType] || roleColors.buyer) : (roleColors[normalizedRole] || roleColors.buyer);

    useEffect(() => {
        fetchData();
    }, [normalizedRole, sellerTab, targetId, targetType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            let url = '';
            
            if (targetId) {
                // Fetch reviews for a SPECIFIC provider/seller
                url = `${ROOT_URL}review.php?action=get&target_id=${targetId}&type=${targetType || 'seller'}`;
            } else {
                if (!user.user_id) return;
                // Fetch My Reviews (reviews given by me)
                url = `${ROOT_URL}review.php?action=get_my_reviews&user_id=${user.user_id}`;
                
                // If seller and in 'received' tab, get reviews TARGETED at me
                if (normalizedRole === 'seller' && sellerTab === 'received') {
                    url = `${ROOT_URL}review.php?action=get&target_id=${user.user_id}&type=seller`;
                } else if (normalizedRole === 'doctor') {
                    url = `${ROOT_URL}review.php?action=get&target_id=${user.user_id}&type=doctor`;
                } else if (normalizedRole === 'spa' || normalizedRole === 'spa_owner') {
                    url = `${ROOT_URL}review.php?action=get&target_id=${user.user_id}&type=spa`;
                }
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
            }

            // If buyer or seller(given), fetch things I can review
            if (!targetId && (normalizedRole === 'buyer' || (normalizedRole === 'seller' && sellerTab === 'given'))) {
                const rRes = await fetch(`${ROOT_URL}review.php?action=get_reviewable_transactions&user_id=${user.user_id}`);
                const rData = await rRes.json();
                if (rData.success) {
                    setReviewable(rData.transactions || []);
                }
            }
        } catch (e) {
            console.error('Fetch reviews error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction && normalizedRole === 'buyer') {
            alert('Please select a transaction to review.');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const body: any = {
                user_id: user.user_id,
                target_id: selectedTransaction ? selectedTransaction.target_id : 0,
                rating,
                comment,
                type: selectedTransaction ? selectedTransaction.category?.toLowerCase() : 'other'
            };

            if (selectedTransaction?.booking_id) body.booking_id = selectedTransaction.booking_id;
            if (selectedTransaction?.appointment_id) body.appointment_id = selectedTransaction.appointment_id;
            if (selectedTransaction?.transaction_id) body.transaction_id = selectedTransaction.transaction_id;

            const res = await fetch(`${ROOT_URL}review.php?action=submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setShowForm(false);
                setComment('');
                setRating(5);
                setSelectedTransaction(null);
                fetchData();
                alert('Review submitted successfully!');
            } else {
                alert(data.message || 'Failed to submit review');
            }
        } catch (e) {
            console.error(e);
            alert('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Shell role={role}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                            {targetName ? `${targetName}'s ` : 'User '}
                            <span style={{ background: `linear-gradient(135deg, ${color}, #000)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Reviews.</span> ⭐
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>
                            {targetId 
                                ? `What people are saying about this ${targetType || 'provider'}.`
                                : (normalizedRole === 'buyer' ? 'Reviews you have given to others.' : (normalizedRole === 'seller' ? (sellerTab === 'received' ? 'What your customers are saying about you.' : 'Reviews you gave to doctors and spas.') : 'What your customers are saying about you.'))
                            }
                        </p>
                    </div>
                    {!targetId && ((normalizedRole === 'buyer' || (normalizedRole === 'seller' && sellerTab === 'given')) && reviewable.length > 0) && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{ padding: '14px 28px', background: color, color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: `0 12px 24px ${color}30` }}
                        >
                            {showForm ? 'Cancel' : 'Write a Review ✍️'}
                        </button>
                    )}
                    {targetId && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{ padding: '14px 28px', background: '#F1F5F9', color: '#0F172A', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' }}
                        >
                            ← Back
                        </button>
                    )}
                </div>

                {!targetId && normalizedRole === 'seller' && (
                    <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '6px', borderRadius: '16px', width: 'fit-content' }}>
                        <button
                            onClick={() => { setSellerTab('received'); navigate('/reviews?tab=received'); }}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', border: 'none',
                                background: sellerTab === 'received' ? 'white' : 'transparent',
                                color: sellerTab === 'received' ? '#0F172A' : '#64748B',
                                fontWeight: '800', cursor: 'pointer', fontSize: '14px',
                                boxShadow: sellerTab === 'received' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Reviews Received
                        </button>
                        <button
                            onClick={() => { setSellerTab('given'); navigate('/reviews?tab=given'); }}
                            style={{
                                padding: '10px 24px', borderRadius: '12px', border: 'none',
                                background: sellerTab === 'given' ? 'white' : 'transparent',
                                color: sellerTab === 'given' ? '#0F172A' : '#64748B',
                                fontWeight: '800', cursor: 'pointer', fontSize: '14px',
                                boxShadow: sellerTab === 'given' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Reviews Given
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginBottom: '24px' }}>Write Your Review</h2>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Select Transaction</label>
                                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            {reviewable.map(tx => (
                                                <div key={tx.booking_id || tx.appointment_id || tx.transaction_id}
                                                    onClick={() => setSelectedTransaction(tx)}
                                                    style={{ 
                                                        minWidth: '200px', padding: '16px', borderRadius: '16px', border: '2px solid',
                                                        borderColor: selectedTransaction === tx ? color : '#F1F5F9',
                                                        background: selectedTransaction === tx ? `${color}05` : 'white',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{tx.provider_name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748B' }}>{tx.title}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{tx.date}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>Rating</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button key={s} type="button" onClick={() => setRating(s)}
                                                    style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', filter: s <= rating ? 'none' : 'grayscale(100%)', opacity: s <= rating ? 1 : 0.3 }}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Your Comment</label>
                                        <textarea required value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience..."
                                            style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontFamily: 'inherit', resize: 'none' }}
                                        />
                                    </div>
                                    <button type="submit" disabled={isSubmitting}
                                        style={{ width: '100%', padding: '18px', background: '#0F172A', color: 'white', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', border: 'none' }}
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post Review 🚀'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>
                        ) : reviews.length > 0 ? (
                            reviews.map((rev: any, i: number) => (
                                <motion.div key={rev.review_id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    style={{ padding: '24px', borderRadius: '24px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                                                {rev.profile_image ? <img src={ROOT_URL + rev.profile_image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (rev.target_name ? rev.target_name[0] : '👤')}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                    {targetId ? rev.reviewer_name : (rev.target_name || rev.reviewer_name)}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                                                    {targetId ? 'Buyer' : (rev.review_type || 'User')} Review
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '4px' }}>{'⭐'.repeat(rev.rating)}</div>
                                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>{new Date(rev.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                                        "{rev.review_text || rev.comment}"
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>No reviews yet</h3>
                                <p style={{ color: '#94A3B8' }}>{reviewable.length > 0 ? 'You have items waiting to be reviewed!' : 'Start interacting to see reviews here!'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default Reviews;
