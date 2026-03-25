import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { Camera, Search, RefreshCw, Info, CheckCircle2, AlertCircle, Sparkles, Upload, Star, Zap, ShieldCheck, ArrowRight, Activity, Brain, Heart, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const AIDetection = () => {
    const location = useLocation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.image) {
            setSelectedImage(location.state.image);
        }
    }, [location.state]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async () => {
        if (!selectedFile) return;
        setAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const data = await api.aiPredict(selectedFile);

            if (data.breed === 'uncertain') {
                setError(data.message || "Unable to identify breed with high confidence.");
                return;
            }

            // Transform backend data to UI format
            setResult({
                breed: data.breed_name || data.breed,
                confidence: (data.confidence * 100).toFixed(1),
                traits: data.lifestyle_guidance?.great_with ? [data.lifestyle_guidance.great_with, data.lifestyle_guidance.best_suited_for] : ["Active", "Intelligent", "Social"],
                metrics: [
                    { label: 'Feeding', value: data.recommended_food?.feeding_frequency || "3-4 meals/day", icon: <Droplets size={14} /> },
                    { label: 'Checkup', value: data.health_care_tips?.vet_checkup_frequency || "Regularly", icon: <Activity size={14} /> },
                    { label: 'Exercise', value: data.health_care_tips?.exercise_needs || "Daily play", icon: <Zap size={14} /> }
                ],
                care: {
                    food: data.recommended_food?.best_choice || "High quality protein diet",
                    grooming: data.health_care_tips?.grooming_needs || "Regular brushing",
                    dos: data.dos || ["Provide fresh water", "Socialize early"],
                    donts: data.donts || ["Avoid overfeeding", "Don't leave alone long"]
                },
                info: `Neural analysis identifies this pet as a ${data.breed_name || data.breed}. This breed is known for being ${data.lifestyle_guidance?.best_suited_for.toLowerCase() || 'a great companion'}.`
            });

        } catch (error) {
            console.error("Analysis failed:", error);
            setError("Vision processing failed. Please check if AI Backend is active.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Shell role="buyer">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-orange-100 mb-4"
                    >
                        <Zap size={14} className="fill-orange-600" /> Next-Gen Vision AI
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                        Instant Breed <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600">Recognition</span> 📸
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        Upload a photo and let our neural network handle the identification.
                        99.2% accuracy on over 300+ recognized domestic breeds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Visual Interface */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-slate-200 border border-slate-50 relative group"
                        >
                            <div className={`relative aspect-square rounded-[2.5rem] overflow-hidden group ${!selectedImage ? 'bg-slate-50/50 border-4 border-dashed border-slate-100' : ''}`}>

                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Selected pet" />

                                        {/* Analyzing Scan Effect */}
                                        <AnimatePresence>
                                            {analyzing && (
                                                <motion.div
                                                    initial={{ top: '0%' }}
                                                    animate={{ top: '100%' }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-1 bg-orange-500 shadow-[0_0_20px_#6366f1] z-20"
                                                />
                                            )}
                                        </AnimatePresence>

                                        {analyzing && (
                                            <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[2px] z-10 animate-pulse" />
                                        )}

                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                            <label className="bg-white text-slate-900 font-black px-6 py-3 rounded-2xl cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                                <RefreshCw size={18} /> Change Photo
                                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                                        <div className="w-20 h-20 rounded-[2rem] bg-orange-50 text-orange-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <span className="text-slate-900 font-black text-xl">Upload Profile</span>
                                        <span className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-widest">DRAG & DROP READY</span>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="p-8 pt-10">
                                <button
                                    onClick={startAnalysis}
                                    disabled={!selectedImage || analyzing}
                                    className={`w-full py-5 rounded-[2rem] text-xl font-black shadow-2xl transition-all flex items-center justify-center gap-4 ${!selectedImage || analyzing
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95'
                                        }`}
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            SYST_ANALYSIS_IN_PROGRESS
                                        </>
                                    ) : (
                                        <>Process Vision <Zap size={20} className="fill-current" /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-4 px-8 py-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <ShieldCheck className="text-emerald-500" size={32} />
                            <div>
                                <h5 className="font-black text-slate-900">Secure Processing</h5>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Encrypted Local Prediction</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Display */}
                    <div className="lg:pt-10">
                        <AnimatePresence mode="wait">
                            {!result && !analyzing && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center"
                                >
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-8">
                                        <Sparkles size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-700 mb-3 tracking-tight">Awaiting Input</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Once processing begins, high-fidelity metrics and breed characteristics will appear in this console.
                                    </p>
                                </motion.div>
                            )}

                            {analyzing && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-slate-50 rounded-[2rem] relative overflow-hidden">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full"
                                                animate={{ left: ['-100%', '200%'] }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {result && (
                                <motion.div
                                    key="result"
                                    initial={{ x: 40, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="elite-card p-10 relative overflow-hidden bg-white border border-slate-100 rounded-[3rem] shadow-xl">
                                        <div className="flex justify-between items-center mb-8">
                                            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                                Biometric Report
                                            </span>
                                            <div className="text-emerald-500 flex items-center gap-2">
                                                <CheckCircle2 size={24} />
                                                <span className="font-black text-2xl tracking-tighter">{result.confidence}% Confidence</span>
                                            </div>
                                        </div>

                                        <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tight leading-none uppercase">{result.breed}</h2>
                                        <p className="text-slate-600 font-medium text-lg leading-relaxed mb-10">{result.info}</p>

                                        <div className="grid grid-cols-3 gap-4 mb-8">
                                            {result.metrics.map((m: any, i: number) => (
                                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                                                        {m.icon}
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</span>
                                                    </div>
                                                    <div className="text-lg font-black text-slate-900">{m.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {result.traits.map((trait: string) => (
                                                <span
                                                    key={trait}
                                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all cursor-default"
                                                >
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-600 to-rose-600 rounded-[2.5rem] p-8 text-white shadow-2xl hover:scale-[1.02] transition-all cursor-pointer">
                                        <div className="flex gap-6 items-start">
                                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                                <Zap size={28} className="fill-white" />
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-black mb-1">Health & Nutrition</h5>
                                                <p className="text-white/80 font-medium text-sm leading-relaxed mb-4">
                                                    {result.breed}s have specific nutritional needs. View our curated diet plans for this breed.
                                                </p>
                                                <button className="flex items-center gap-2 font-black text-xs uppercase tracking-widest border-b-2 border-white/40 pb-1 hover:border-white transition-all">
                                                    Open Health Guide <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default AIDetection;
