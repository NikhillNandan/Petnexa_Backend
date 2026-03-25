import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import {
    Store, Plus, Search, Filter,
    Edit3, Trash2, TrendingUp,
    ArrowRight, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const SellerListings = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const res = await api.getSellerListings(u.user_id);
            if (res.success) {
                setListings(res.listings || []);
            }
        } catch (err) {
            console.error('Failed to fetch listings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const res = await api.deletePetListing(id, u.user_id);
            if (res.success) {
                setListings(prev => prev.filter(l => l.listing_id !== id));
            } else {
                alert(res.error || 'Failed to delete listing');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting listing');
        }
    };

    const filtered = listings.filter(l =>
        l.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Shell role="seller">
            <div className="space-y-12 pb-20">

                {/* Extraordinary Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-[#FF8C00]/10 text-[#FF8C00] rounded-full border border-[#FF8C00]/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Store size={14} /> Inventory Command
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            My <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-orange-600 font-bold">Listings.</span> 🏷️
                        </h1>
                        <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">
                            A high-fidelity console for <span className="text-slate-900 font-black">curating inventory</span>, monitoring reach, and optimizing sales conversion.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/seller/add-listing')}
                        className="px-10 py-6 bg-slate-900 text-white font-black rounded-[24px] flex items-center gap-4 shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest group"
                    >
                        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> New Product Entry
                    </button>
                </header>

                {/* Cinematic Filters Console */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full md:w-[480px] group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF8C00] transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Pulse search inventory..."
                            className="w-full pl-16 pr-6 py-6 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-[#FF8C00]/5 focus:border-[#FF8C00]/30 transition-all font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[24px] font-black text-[10px] text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                            <Filter size={18} /> Analysis Filter
                        </button>
                        <div className="px-6 py-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center gap-3">
                            <span className="text-[#FF8C00] font-black text-xl leading-none">{filtered.length}</span>
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Units Found</p>
                        </div>
                    </div>
                </div>

                {/* Grid Display */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#FF8C00] rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Assets...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.map((item, i) => (
                            <motion.div
                                key={item.listing_id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -12 }}
                                className="bg-white rounded-[48px] overflow-hidden border border-slate-50 shadow-2xl shadow-slate-100 group cursor-pointer"
                            >
                                <div className="h-64 relative overflow-hidden">
                                    <img 
                                        src={item.photo_url ? (item.photo_url.startsWith('http') ? item.photo_url : ROOT_URL + item.photo_url) : 'https://images.unsplash.com/photo-1519098901907-28783c9f2162?auto=format&fit=crop&q=80&w=400'} 
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                                        alt="" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="absolute top-8 right-8 flex flex-col gap-3">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/seller/edit-listing/${item.listing_id}`); }}
                                                className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all shadow-xl"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.listing_id); }}
                                                className="w-12 h-12 rounded-2xl bg-[#FF8C00]/20 backdrop-blur-xl border border-[#FF8C00]/30 text-[#FF8C00] flex items-center justify-center hover:bg-[#FF8C00] hover:text-white transition-all shadow-xl"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/pet/${item.listing_id}`); }}
                                                className="w-full py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-[#FF8C00] hover:text-white transition-all"
                                            >
                                                View Live Listing <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-8 left-8">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/20 backdrop-blur-md ${item.status === 'AVAILABLE' || item.status === 'Active' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#FF8C00] transition-colors uppercase">{item.pet_name || item.breed}</h3>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-[#FF8C00]" />
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.breed}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1 py-6 bg-slate-50/50 rounded-[32px] border border-slate-100/50">
                                        <div className="text-center px-2">
                                            <p className="text-xl font-black text-slate-900 leading-none mb-2">{item.age}y</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">Age</p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div className="w-[1px] h-8 bg-slate-200"></div>
                                        </div>
                                        <div className="text-center px-2">
                                            <p className="text-xl font-black text-slate-900 leading-none mb-2">{item.gender?.[0]}</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">Gender</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest block leading-none">Asset Valuation</span>
                                            <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">₹{item.price.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF8C00] group-hover:scale-110 transition-transform">
                                            <TrendingUp size={24} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Operational Add Proxy */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => navigate('/seller/add-listing')}
                            className="bg-slate-50/40 border-4 border-dashed border-slate-100 rounded-[56px] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-[#FF8C00]/30 hover:bg-orange-500/5 transition-all"
                        >
                            <div className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center text-slate-200 group-hover:bg-[#FF8C00] group-hover:text-white transition-all shadow-xl group-hover:shadow-[#FF8C00]/30 group-hover:-translate-y-4 duration-500">
                                <Plus size={48} strokeWidth={2.5} />
                            </div>
                            <h3 className="mt-10 text-2xl font-black text-slate-900 tracking-tight uppercase">Expand Flux</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-4 leading-relaxed max-w-[200px]">
                                Integrate a new asset into the PetNexa global marketplace.
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 rounded-[56px] p-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 text-4xl mb-8">📦</div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">No Listings Found</h2>
                        <p className="text-slate-500 max-w-sm mb-10 font-medium">Your inventory is currently empty. Start listing pets to reach buyers across India.</p>
                        <button
                            onClick={() => navigate('/seller/add-listing')}
                            className="px-8 py-5 bg-[#FF8C00] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:-translate-y-1 transition-all text-xs uppercase tracking-widest"
                        >
                            Create First Listing
                        </button>
                    </div>
                )}
            </div>
        </Shell>
    );
};

export default SellerListings;
