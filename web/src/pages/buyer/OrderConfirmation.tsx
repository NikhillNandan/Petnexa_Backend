import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shell } from '../../components/Shell';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { petName, method } = location.state || { petName: 'your new pet', method: 'Payment' };
    const orderId = 'PNX' + Math.random().toString(36).substr(2, 6).toUpperCase();

    return (
        <Shell role="buyer">
            <div style={{ 
                minHeight: '80vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '24px'
            }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{ 
                        background: 'white', 
                        borderRadius: '40px', 
                        padding: '60px 40px', 
                        textAlign: 'center', 
                        maxWidth: '500px', 
                        width: '100%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid #f1f5f9'
                    }}
                >
                    <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: '#f0fdf4', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '50px', 
                        margin: '0 auto 32px auto',
                        boxShadow: '0 0 0 10px #f0fdf4'
                    }}>
                        ✅
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                        Order Confirmed!
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500', lineHeight: 1.6, marginBottom: '40px' }}>
                        Congratulations! Your order for <span style={{ fontWeight: '800', color: '#FF8C00' }}>{petName}</span> has been placed successfully. 
                        {method === 'COD' ? ' The seller will contact you for cash collection and delivery.' : ' High speed verification is in progress.'}
                    </p>

                    <div style={{ 
                        background: '#f8fafc', 
                        borderRadius: '24px', 
                        padding: '24px', 
                        border: '1px solid #f1f5f9', 
                        textAlign: 'left', 
                        marginBottom: '40px' 
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>#{orderId}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{method === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery</div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Est. 2-3 Days</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FF8C00', background: '#FFF7ED', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>CONFIRMED</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button 
                            onClick={() => navigate(`/dashboard/buyer`)} 
                            style={{ 
                                width: '100%', 
                                padding: '18px', 
                                borderRadius: '16px', 
                                background: 'linear-gradient(135deg, #0f172a, #334155)', 
                                color: 'white', 
                                border: 'none', 
                                fontWeight: '900', 
                                fontSize: '16px', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                boxShadow: '0 10px 20px rgba(15,23,42,0.2)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Back to Dashboard
                        </button>
                        <button 
                            onClick={() => navigate('/marketplace')} 
                            style={{ 
                                width: '100%', 
                                padding: '18px', 
                                borderRadius: '16px', 
                                background: '#f1f5f9', 
                                color: '#64748b', 
                                border: 'none', 
                                fontWeight: '800', 
                                fontSize: '15px', 
                                cursor: 'pointer' 
                            }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        </Shell>
    );
};

export default OrderConfirmation;
