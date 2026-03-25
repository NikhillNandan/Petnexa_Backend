import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Search, Info, Shield, CheckCircle, AlertCircle, Loader2, Sparkles, Wand2, Dog, Cat } from 'lucide-react';
import { api } from '../utils/api';
import { Shell } from '../components/Shell';

const BreedDetection = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleDetect = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);

        try {
            const data = await api.aiPredict(selectedImage);
            
            if (data.breed === 'uncertain') {
                setError(data.message || 'Breed is uncertain.');
                setResult(null);
            } else {
                setResult(data);
            }
        } catch (err) {
            console.error('Detection error:', err);
            setError('Biometric processing failed. Please ensure the AI backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <Shell>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px',
                fontFamily: "'Outfit', sans-serif"
            }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 20px',
                            background: 'rgba(255, 140, 0, 0.1)',
                            borderRadius: '100px',
                            color: '#FF8C00',
                            fontSize: '13px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '24px'
                        }}
                    >
                        <Sparkles size={16} /> Powered by PetNexa AI
                    </motion.div>
                    <h1 style={{
                        fontSize: 'clamp(32px, 5vw, 56px)',
                        fontWeight: '900',
                        color: '#0F172A',
                        letterSpacing: '-0.04em',
                        marginBottom: '16px',
                        lineHeight: '1.1'
                    }}>
                        Instant Breed <span style={{ color: '#FF8C00' }}>Detection.</span>
                    </h1>
                    <p style={{
                        color: '#64748B',
                        fontSize: '18px',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Upload a photo of your pet and let our advanced neural networks identify the breed and provide detailed temperament analysis.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: result ? '1fr 1fr' : '1fr',
                    gap: '40px',
                    transition: 'all 0.5s ease',
                    alignItems: 'start'
                }}>
                    {/* Scanner Section */}
                    <div style={{
                        background: 'white',
                        border: '1px solid #F1F5F9',
                        borderRadius: '32px',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                    }}>
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                minHeight: '340px',
                                border: `2px dashed ${previewUrl ? '#FF8C0060' : '#E2E8F0'}`,
                                borderRadius: '24px',
                                background: previewUrl ? '#F8FAFC' : '#FBFDFF',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: loading ? 'wait' : 'pointer',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        position: 'absolute',
                                        inset: 0
                                    }}
                                />
                            ) : (
                                <>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 140, 0, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FF8C00',
                                        marginBottom: '20px'
                                    }}>
                                        <Camera size={40} />
                                    </div>
                                    <h3 style={{ color: '#0F172A', marginBottom: '8px' }}>Click to Upload</h3>
                                    <p style={{ color: '#94A3B8', fontSize: '14px' }}>PNG, JPG up to 10MB</p>
                                </>
                            )}

                            {loading && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(255,255,255,0.8)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(4px)',
                                    zIndex: 10
                                }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        style={{ color: '#FF8C00', marginBottom: '16px' }}
                                    >
                                        <Wand2 size={48} />
                                    </motion.div>
                                    <p style={{ color: '#0F172A', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Analysing DNA...</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', maxWidth: '500px' }}>
                            {previewUrl && !loading && (
                                <button
                                    onClick={reset}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        background: '#F1F5F9',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '16px',
                                        color: '#64748B',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                            <button
                                onClick={handleDetect}
                                disabled={!selectedImage || loading}
                                style={{
                                    flex: 2,
                                    padding: '16px',
                                    background: loading || !selectedImage ? '#F1F5F9' : 'linear-gradient(135deg, #FF8C00, #ff5e00)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: loading || !selectedImage ? '#94A3B8' : 'white',
                                    fontWeight: '800',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: loading || !selectedImage ? 'not-allowed' : 'pointer',
                                    boxShadow: loading || !selectedImage ? 'none' : '0 20px 40px -10px rgba(255, 140, 0, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                {loading ? 'Scanning...' : (
                                    <>Scan Breed <Search size={18} /></>
                                )}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginTop: '24px',
                                    padding: '16px',
                                    background: '#FEF2F2',
                                    border: '1px solid #FEE2E2',
                                    borderRadius: '16px',
                                    color: '#EF4444',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    maxWidth: '500px'
                                }}
                            >
                                <AlertCircle size={20} /> {error}
                            </motion.div>
                        )}
                    </div>

                    {/* Results Section */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                background: 'white',
                                border: '1px solid #F1F5F9',
                                borderRadius: '32px',
                                padding: '40px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: '#ECFDF5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#10B981',
                                    border: '1px solid #D1FAE5'
                                }}>
                                    <CheckCircle size={28} />
                                </div>
                                <div>
                                    <h2 style={{ color: '#0F172A', margin: 0 }}>Analysis Successful</h2>
                                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '14px' }}>Accuracy: {(result.confidence * 100).toFixed(1)}%</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <label style={{ color: '#FF8C00', fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Detected {result.animal_type || 'Breed'}</label>
                                <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                                    {result.breed_name || result.breed}
                                </h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>Suited For</p>
                                    <p style={{ color: '#0F172A', fontWeight: '600', margin: 0, fontSize: '14px' }}>{result.lifestyle_guidance?.best_suited_for || 'Most homes'}</p>
                                </div>
                                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <p style={{ color: '#94A3B8', fontSize: '12px', margin: '0 0 8px 0' }}>Climate</p>
                                    <p style={{ color: '#0F172A', fontWeight: '600', margin: 0, fontSize: '14px' }}>{result.lifestyle_guidance?.climate_preference || 'Tropical'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                                <div>
                                    <h3 style={{ color: '#0F172A', marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={16} color="#FF8C00" /> Recommended Diet
                                    </h3>
                                    <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                        <p style={{ margin: '0 0 8px 0', color: '#0F172A', fontWeight: '600' }}>• {result.recommended_food?.best_choice}</p>
                                        <p style={{ margin: '0 0 8px 0' }}>• {result.recommended_food?.secondary_option}</p>
                                        <p style={{ margin: 0, color: '#FF8C00', fontSize: '12px', fontWeight: '700' }}>{result.recommended_food?.feeding_frequency}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ color: '#0F172A', marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Shield size={16} color="#10B981" /> Professional Care
                                    </h3>
                                    <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                        <p style={{ margin: '0 0 4px 0' }}>{result.health_care_tips?.vet_checkup_frequency}</p>
                                        <p style={{ margin: '0 0 4px 0' }}>{result.health_care_tips?.grooming_needs}</p>
                                        <p style={{ margin: '0 0 4px 0' }}>{result.health_care_tips?.exercise_needs}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div style={{ background: '#ECFDF5', padding: '24px', borderRadius: '24px', border: '1px solid #D1FAE5' }}>
                                    <h4 style={{ color: '#10B981', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Expert Do's</h4>
                                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                        {result.dos?.map((item: string, i: number) => (
                                            <li key={i} style={{ color: '#065F46', fontSize: '13px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                                                <span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={{ background: '#FEF2F2', padding: '24px', borderRadius: '24px', border: '1px solid #FEE2E2' }}>
                                    <h4 style={{ color: '#EF4444', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Expert Don'ts</h4>
                                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                        {result.donts?.map((item: string, i: number) => (
                                            <li key={i} style={{ color: '#991B1B', fontSize: '13px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                                                <span style={{ color: '#EF4444', fontWeight: '900' }}>✕</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '40px',
                                padding: '24px',
                                background: '#FFF7ED',
                                borderRadius: '24px',
                                border: '1px solid #FFEDD5',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#9A3412', margin: 0, fontSize: '14px', fontWeight: '600' }}> Great with: <span style={{ color: '#FF8C00', fontWeight: '900' }}>{result.lifestyle_guidance?.great_with}</span></p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </Shell>
    );
};

export default BreedDetection;
