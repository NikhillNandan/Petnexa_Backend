import React, { useState, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../utils/constants';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Download, Calendar } from 'lucide-react';

const Transactions = ({ role = 'buyer' }: { role?: string }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) return;
                const user = JSON.parse(userRaw);
                
                const normalizedRole = (role === 'spa' || role === 'spa_owner') ? 'SPA_OWNER' : role.toUpperCase();
                const url = `${API_ENDPOINTS.GET_TRANSACTIONS}&user_id=${user.user_id}&role=${normalizedRole}`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.success) {
                    setTransactions(data.transactions || []);
                }
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [role]);

    const filtered = transactions.filter(t => {
        const matchesSearch = (t.pet_name || t.type || '').toLowerCase().includes(search.toLowerCase()) ||
                             (t.buyer_name || t.other_party || '').toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchesSearch;
        return matchesSearch && t.payment_method?.toLowerCase() === filter.toLowerCase();
    });

    const totalVolume = filtered
        .filter(t => {
            const status = (t.payment_status || t.status || '').toUpperCase();
            return status === 'SUCCESS' || status === 'CONFIRMED' || status === 'COMPLETED';
        })
        .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return (
        <Shell role={role}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>Transaction History</h1>
                        <p style={{ color: '#64748b', fontWeight: '500', fontSize: '16px' }}>View and manage all your payments, including Cash and UPI transactions.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '12px 24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Volume</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>₹{totalVolume.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                {/* Filters & Tools */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by pet name, service or person..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: '500', outline: 'none', transition: 'all 0.2s' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ padding: '0 20px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', color: '#475569', outline: 'none' }}>
                            <option value="all">All Methods</option>
                            <option value="upi">UPI Payments</option>
                            <option value="cash">Cash Payments</option>
                        </select>
                    </div>
                </div>

                {/* Table / List */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Transaction Details</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Date & Time</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Method</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Fetching transaction records...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No transactions found.</td></tr>
                            ) : filtered.map((t, i) => (
                                <motion.tr 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    style={{ borderBottom: '1px solid #f8fafc' }}
                                >
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: t.transaction_type === 'EARNING' ? '#ecfdf5' : '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {t.transaction_type === 'EARNING' ? <ArrowDownLeft size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#f43f5e" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#0f172a' }}>{t.type || 'Payment'}</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{t.pet_name || 'Service'} · {role === 'buyer' ? 'To' : 'From'} {t.other_party || t.buyer_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(t.transaction_date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {t.transaction_time || '12:00 PM'}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '8px', 
                                            background: '#f1f5f9', 
                                            color: '#475569', 
                                            fontSize: '11px', 
                                            fontWeight: '800', 
                                            display: 'inline-block',
                                            textTransform: 'uppercase'
                                        }}>
                                            {t.payment_method || 'CASH'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (t.payment_status || '').toLowerCase().includes('success') || (t.payment_status || '').toLowerCase().includes('confirmed') || (t.payment_status || '').toLowerCase().includes('completed') ? '#10b981' : '#f59e0b' }} />
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: (t.payment_status || '').toLowerCase().includes('success') || (t.payment_status || '').toLowerCase().includes('confirmed') || (t.payment_status || '').toLowerCase().includes('completed') ? '#10b981' : '#f59e0b' }}>
                                                {t.payment_status || 'Pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>₹{Number(t.amount || 0).toLocaleString('en-IN')}</div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Shell>
    );
};

export default Transactions;
