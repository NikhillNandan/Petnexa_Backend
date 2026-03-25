import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { Scissors, MapPin, Star, Calendar, Clock, ShieldCheck, ChevronRight, Search, Filter, Sparkles, Zap, Award, CheckCircle2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';

const Spas = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const [selectedSpa, setSelectedSpa] = useState<any>(null);
    const [booked, setBooked] = useState(false);
    const [spas, setSpas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showPhoneId, setShowPhoneId] = useState<number | null>(null);

    useEffect(() => {
        fetchSpas();

        // Listen for location updates from Shell
        const handleLocationUpdate = () => {
             fetchSpas();
        };
        window.addEventListener('locationUpdated', handleLocationUpdate);
        return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
    }, [search]);

    const fetchSpas = async () => {
        setLoading(true);
        try {
            const userRaw = localStorage.getItem('user');
            let lat = '';
            let lng = '';
            if (userRaw) {
                const user = JSON.parse(userRaw);
                lat = user.latitude || '';
                lng = user.longitude || '';
            }
            const url = `${API_ENDPOINTS.GET_SPAS}${lat ? `?lat=${lat}` : ''}${lng ? (lat ? `&lng=${lng}` : `?lng=${lng}`) : ''}`;
            const res = await api.get(url);
            if (res && (res.status === 'success' || res.success || res.spas)) {
                setSpas(res.spas || []);
            } else {
                console.warn('Spa list API returned non-success:', res);
                setSpas([]);
            }
        } catch (err) {
            console.error('Failed to fetch spas:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = spas.filter(s =>
        s.spa_name.toLowerCase().includes(search.toLowerCase()) ||
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.city && s.city.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Shell role={role}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div className="space-y-12 pb-20">
                {/* Extraordinary Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Sparkles size={14} /> Luxury Wellness Network
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            Wellness <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold">Spas.</span> ✨
                        </h1>
                        <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">
                            India's finest <span className="text-slate-900 font-black">pet wellness studios</span>, recognized for therapeutic expertise and luxurious care.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search spas or services..."
                                className="pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/30 w-full md:w-80 font-bold text-slate-700 shadow-sm transition-all"
                            />
                        </div>
                        <button className="p-5 bg-white border border-slate-200 rounded-[24px] text-slate-600 hover:bg-slate-50 shadow-sm transition-all"><Filter size={24} /></button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-6" style={{ animation: 'spin 1s linear infinite' }}></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Preparing Luxury Suites...</p>
                            </div>
                        ) : filtered.map((spa: any, idx: number) => (
                            <motion.div
                                key={spa.user_id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-white rounded-[40px] p-2 border transition-all duration-500 group cursor-pointer ${selectedSpa?.user_id === spa.user_id ? 'border-amber-500 shadow-2xl shadow-amber-200' : 'border-slate-50 hover:border-slate-200 hover:shadow-xl'}`}
                                onClick={() => { setSelectedSpa(spa); setBooked(false); }}
                            >
                                <div className="flex flex-col md:flex-row gap-8 p-6">
                                    <div className="relative w-full md:w-56 h-72 rounded-[32px] overflow-hidden shrink-0 shadow-lg bg-slate-100">
                                        <img src={spa.profile_image ? (spa.profile_image.startsWith('http') ? spa.profile_image : ROOT_URL + spa.profile_image) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${spa.user_id}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={spa.spa_name} />
                                        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                            <Award size={20} />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col py-2">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{spa.spa_name}</h3>
                                                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100/50">
                                                        {spa.services_offered || 'Full Grooming'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-3xl text-right border border-slate-100">
                                                <div className="flex items-center gap-2 text-amber-500 font-black justify-end">
                                                    <Star size={20} fill="currentColor" /> {spa.avg_rating || '5.0'}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{spa.review_count || 0} REVIEWS</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</p>
                                                    <p className="text-sm font-black text-slate-900">9 AM - 9 PM</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                                                    <p className="text-sm font-black text-slate-900 truncate">{spa.city || 'India'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {(Array.isArray(spa.services) ? spa.services : []).map((s: any) => (
                                                <span key={s.service_id} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                                    {s.service_name}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 gap-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-slate-900 font-black text-3xl tracking-tighter">₹{spa.services?.[0]?.price || 1000}</span>
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ Session</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setShowPhoneId(spa.user_id);
                                                    }}
                                                    className="w-auto px-4 h-12 bg-amber-50 text-amber-600 rounded-[14px] flex items-center justify-center border border-amber-100 hover:bg-amber-500 hover:text-white transition-all shadow-sm font-bold text-xs"
                                                    title="Call Spa"
                                                >
                                                    {showPhoneId === spa.user_id ? spa.phone : '📞 Call'}
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        navigate('/messages', { 
                                                            state: { 
                                                                recipient: { 
                                                                    id: spa.user_id, 
                                                                    name: spa.spa_name, 
                                                                    profile_image: spa.profile_image 
                                                                } 
                                                            } 
                                                        });
                                                    }}
                                                    className="w-12 h-12 bg-orange-50 text-orange-600 rounded-[14px] flex items-center justify-center border border-orange-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                                    title="Chat with Spa"
                                                >
                                                    💬
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(role === 'buyer' ? `/spa/${spa.user_id}` : `/seller/spa/${spa.user_id}`); }}
                                                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        navigate(role === 'buyer' ? `/book/spa/${spa.user_id}` : `/seller/book/spa/${spa.user_id}`);
                                                    }}
                                                    className={`px-8 py-4 ${selectedSpa?.user_id === spa.user_id ? 'bg-amber-500' : 'bg-slate-900'} text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 group-hover:bg-amber-500 transition-all flex items-center gap-3`}
                                                >
                                                    Book Now <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                                <div className="text-6xl mb-6">🔍</div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No Spas Found</h3>
                                <p className="text-slate-500 font-medium">Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 h-fit">
                        <AnimatePresence mode="wait">
                            {selectedSpa ? (
                                <motion.div
                                    key="booking"
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-slate-900 rounded-[56px] p-10 text-white sticky top-20 shadow-3xl overflow-hidden group"
                                >
                                    <div className="absolute inset-0 opacity-40">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                                    </div>

                                    {!booked ? (
                                        <div className="relative z-10 space-y-10">
                                            <div className="space-y-2">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                                    <Zap size={14} className="text-amber-400 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Spa Booking</span>
                                                </div>
                                                <h3 className="text-4xl font-black tracking-tighter leading-tight">Wellness <br /> <span className="text-amber-400">Session.</span></h3>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 transition-colors cursor-pointer">
                                                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center p-2 shadow-lg shadow-amber-500/20">
                                                        <Calendar size={28} />
                                                    </div>
                                                    <div>
                                                        <p className="text-amber-300 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Session Date</p>
                                                        <p className="text-xl font-black">Oct 14, 2026</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 transition-colors cursor-pointer">
                                                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center p-2 shadow-lg">
                                                        <Clock size={28} />
                                                    </div>
                                                    <div>
                                                        <p className="text-amber-300 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Time Slot</p>
                                                        <p className="text-xl font-black">02:30 PM - IST</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-10 border-t border-white/10">
                                                <div className="flex justify-between items-end mb-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest">Session Cost</p>
                                                        <span className="text-4xl font-black tracking-tighter">₹{selectedSpa.services?.[0]?.price || 1000}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] block mb-1">Wellness Studio</span>
                                                        <div className="flex gap-1 justify-end">
                                                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => navigate(role === 'buyer' ? `/book/spa/${selectedSpa.user_id}` : `/seller/book/spa/${selectedSpa.user_id}`)} 
                                                    className="w-full bg-white text-slate-900 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-amber-400 hover:text-white transition-all transform active:scale-95"
                                                >
                                                    Proceed to Selection
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative z-10 text-center py-12 space-y-8">
                                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                                                <CheckCircle2 size={48} className="text-white" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-4xl font-black tracking-tighter leading-tight">Session <br /> <span className="text-amber-400">Confirmed!</span></h3>
                                                <p className="text-slate-400 font-medium leading-relaxed">Your luxury grooming session with <span className="text-white font-bold">{selectedSpa.spa_name}</span> is all set.</p>
                                            </div>
                                            <button onClick={() => navigate(role === 'buyer' ? '/appointments' : '/seller/appointments')} className="w-full bg-white text-slate-900 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-amber-400 hover:text-white transition-all">
                                                View In Appointments
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[600px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[56px] flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-10 text-slate-300">
                                        <Scissors size={48} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Select a Spa</h4>
                                    <p className="text-slate-400 font-medium leading-relaxed uppercase text-[10px] tracking-widest">
                                        Choose a wellness studio to check availability and book your pet's luxury session.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default Spas;
