import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { API_ENDPOINTS, ROOT_URL } from '../../utils/constants';
import {
    Search,
    Filter,
    Star,
    Clock,
    MapPin,
    ChevronRight,
    Zap,
    Calendar as CalendarIcon,
    CheckCircle2,
    Stethoscope,
    Sparkles,
    Phone,
    MessageCircle
} from 'lucide-react';

const Doctors = ({ role = 'buyer' }: { role?: string }) => {
    const navigate = useNavigate();
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('All');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booked, setBooked] = useState(false);
    const [showPhoneId, setShowPhoneId] = useState<number | null>(null);

    const specializations = ['All', 'General Vet', 'Surgeon', 'Dermatologist', 'Nutritionist', 'Behaviorist'];

    useEffect(() => {
        fetchDoctors();

        // Listen for location updates from Shell
        const handleLocationUpdate = () => {
            fetchDoctors();
        };
        window.addEventListener('locationUpdated', handleLocationUpdate);
        return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
    }, [searchQuery, filterSpecialization]);

    const fetchDoctors = async () => {
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

            const r = await fetch(`${ROOT_URL}doctor.php?action=get_list${lat ? `&lat=${lat}` : ''}${lng ? `&lng=${lng}` : ''}`);
            const res = await r.json();
            if (res.status === 'success' || res.success || res.doctors) {
                const docs = (res.doctors || []).map((d: any) => ({
                    ...d,
                    id: d.user_id,
                    name: `Dr. ${d.full_name}`,
                    specialty: d.specialization || 'General Vet',
                    rating: d.avg_rating || 0.0,
                    reviews: d.review_count || 0,
                    location: d.city || 'India',
                    fee: d.consultation_fee || 500,
                    img: d.profile_image ? (d.profile_image.startsWith('http') ? d.profile_image : ROOT_URL + d.profile_image) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.full_name}`,
                    distance: d.distance_km ? `${d.distance_km} km` : ''
                }));
                
                let filtered = docs;
                if (filterSpecialization !== 'All') {
                    filtered = docs.filter((d: any) => d.specialty === filterSpecialization);
                }
                if (searchQuery) {
                    filtered = filtered.filter((d: any) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase()));
                }
                setDoctors(filtered);
            } else {
                console.warn('Doctor list API returned non-success:', res);
                setDoctors([]);
            }
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Shell role={role}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div className="space-y-12 pb-20">
                {/* Stunning Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Sparkles size={14} /> Medical Excellence Network
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            Find Top <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Vets.</span> 🩺
                        </h1>
                        <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">
                            Connect with <span className="text-slate-900 font-black">world-class specialists</span> for your pet’s health. Showing top rated <span className="text-emerald-600 font-black">experts</span>.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name, specialty..."
                                className="pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 w-full md:w-80 font-bold text-slate-700 shadow-sm transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {specializations.map(spec => (
                        <button
                            key={spec}
                            onClick={() => setFilterSpecialization(spec)}
                            className={`px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${filterSpecialization === spec ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'}`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border border-slate-100 shadow-sm w-full">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-6" style={{ animation: 'spin 1s linear infinite' }}></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Consulting our Network...</p>
                            </div>
                        ) : doctors.map((doc: any, idx: number) => (
                            <motion.div
                                key={doc.user_id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-white rounded-[40px] p-2 border transition-all duration-500 group cursor-pointer ${selectedDoctor?.user_id === doc.user_id ? 'border-emerald-500 shadow-2xl shadow-emerald-200' : 'border-slate-50 hover:border-slate-200 hover:shadow-xl'}`}
                                onClick={() => { setSelectedDoctor(doc); setBooked(false); }}
                            >
                                <div className="flex flex-col md:flex-row gap-8 p-6">
                                    <div className="relative w-full md:w-48 h-60 rounded-[32px] overflow-hidden shrink-0 shadow-lg bg-slate-100">
                                        <img src={doc.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={doc.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>

                                    <div className="flex-1 flex flex-col py-2">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{doc.name}</h3>
                                                <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">{doc.specialty}</p>
                                            </div>
                                            <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-100">
                                                <Star className="text-amber-400" size={18} fill="currentColor" />
                                                <span className="font-black text-slate-900">{doc.rating}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-8">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                    <Clock size={18} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700">{doc.experience} Yrs EXP.</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 truncate">{doc.distance}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 gap-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-slate-900 font-black text-3xl tracking-tighter">₹{doc.fee}</span>
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ Consult</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setShowPhoneId(doc.id);
                                                    }}
                                                    className="w-auto px-4 h-12 bg-emerald-50 text-emerald-600 rounded-[14px] flex items-center justify-center border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm font-bold text-xs"
                                                >
                                                    {showPhoneId === doc.id ? doc.phone : <Phone size={18} />}
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        navigate('/messages', { state: { recipient: { id: doc.user_id, name: doc.full_name, profile_image: doc.profile_image } } });
                                                    }}
                                                    className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[14px] flex items-center justify-center border border-blue-100 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(role === 'buyer' ? `/doctor/${doc.user_id}` : `/seller/doctor/${doc.user_id}`); }}
                                                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                                >
                                                    Profile
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(role === 'buyer' ? `/book/doctor/${doc.user_id}` : `/seller/book/doctor/${doc.user_id}`); }}
                                                    className="px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3"
                                                >
                                                    Book <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {!loading && doctors.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                                <div className="text-6xl mb-6">🔍</div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No Specialists Found</h3>
                                <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 h-fit">
                        <AnimatePresence mode="wait">
                            {selectedDoctor ? (
                                <motion.div
                                    key="booking"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-900 rounded-[56px] p-10 text-white sticky top-20 shadow-3xl overflow-hidden group"
                                >
                                    <div className="relative z-10 space-y-10">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                                <Zap size={14} className="text-emerald-400 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quick Consult</span>
                                            </div>
                                            <h3 className="text-4xl font-black tracking-tighter leading-tight">{selectedDoctor.name}</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[32px]">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center p-2 shadow-lg shadow-emerald-500/20">
                                                    <CalendarIcon size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-emerald-300 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Clinic</p>
                                                    <p className="text-xl font-black">{selectedDoctor.hospital || 'Private Clinic'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-white/10">
                                            <div className="flex justify-between items-center mb-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">Fee</p>
                                                    <span className="text-4xl font-black tracking-tighter">₹{selectedDoctor.fee}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => navigate(role === 'buyer' ? `/book/doctor/${selectedDoctor.user_id}` : `/seller/book/doctor/${selectedDoctor.user_id}`)} 
                                                className="w-full bg-white text-slate-900 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:bg-emerald-400 hover:text-white transition-all transform active:scale-95"
                                            >
                                                Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-[600px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[56px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                    <Stethoscope size={64} className="mb-6 opacity-20" />
                                    <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Select a Doctor</h4>
                                    <p className="text-xs font-bold uppercase tracking-widest">To see details and book instant care</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default Doctors;
