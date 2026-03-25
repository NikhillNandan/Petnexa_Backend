import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shell } from '../../components/Shell';
import { ROOT_URL, API_ENDPOINTS } from '../../utils/constants';

const DOCTOR_SERVICES = [
    { id: 1, name: 'General Consultation', price: 800, duration: '30 mins', icon: '🩺' },
    { id: 2, name: 'Vaccination Package', price: 1500, duration: '45 mins', icon: '💉' },
    { id: 3, name: 'Diagnostic Health Scan', price: 2000, duration: '1 hr', icon: '🔬' },
    { id: 4, name: 'Dental Checkup', price: 600, duration: '30 mins', icon: '🦷' }
];

const SPA_SERVICES = [
    { id: 1, name: 'Elite Full Grooming', price: 1500, duration: '2 hrs', icon: '✂️' },
    { id: 2, name: 'Medicinal Bath', price: 800, duration: '1 hr', icon: '🛁' },
    { id: 3, name: 'Style Cut', price: 600, duration: '45 mins', icon: '🎀' },
    { id: 4, name: 'Spa Massage', price: 1200, duration: '1 hr', icon: '💆' }
];

const DATES = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate().toString(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear().toString()
    };
});

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

const BookAppointment = ({ role = 'buyer' }: { role?: string }) => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [myPets, setMyPets] = useState<any[]>([]);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [selectedDate, setSelectedDate] = useState<any>(DATES[0]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [visitType, setVisitType] = useState<'clinic' | 'home'>('clinic');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
    const [showUPIStep, setShowUPIStep] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [provider, setProvider] = useState<any>(null);
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isDoctor = type === 'doctor';
    const themeColor = isDoctor ? '#10b981' : '#f59e0b';
    const themeBg = isDoctor ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #f97316)';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) return;
                const user = JSON.parse(userRaw);
                
                // 1. Fetch User Pets - Try both buyer_id and user_id to ensure sync with app/backend
                const uid = user.user_id || user.id;
                const petsRes = await fetch(`${API_ENDPOINTS.GET_BUYER_PETS}?buyer_id=${uid}&user_id=${uid}`);
                const petsData = await petsRes.json();
                
                if (petsData.success && petsData.pets) {
                    setMyPets(petsData.pets);
                    if (petsData.pets.length > 0) {
                        setSelectedPet(petsData.pets[0]);
                    }
                } else {
                    console.error("Pets fetch failed:", petsData.error);
                }

                // 2. Fetch Provider Details
                const endpoint = type === 'doctor' ? 'get_doctor_details.php' : 'get_spa_details.php';
                const idParam = type === 'doctor' ? 'doctor_id' : 'spa_id';
                const provRes = await fetch(`${ROOT_URL}${endpoint}?${idParam}=${id}`);
                const provData = await provRes.json();
                
                let svcs = type === 'doctor' ? DOCTOR_SERVICES : SPA_SERVICES;
                
                if (provData.success) {
                    setProvider(provData.doctor || provData.spa);
                    // Use services from backend if available
                    if (provData.services && provData.services.length > 0) {
                        svcs = provData.services.map((s: any) => ({
                            id: s.service_id,
                            name: s.service_name,
                            price: parseFloat(s.price),
                            duration: s.duration_minutes ? `${s.duration_minutes} mins` : (s.duration || '30 mins'),
                            icon: type === 'doctor' ? '🩺' : '🛁'
                        }));
                    }
                }
                setAvailableServices(svcs);
            } catch (err) {
                console.error("Booking fetch error:", err);
                // Fallback to defaults on error
                setAvailableServices(type === 'doctor' ? DOCTOR_SERVICES : SPA_SERVICES);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, type]);

    const toggleService = (svcId: number) => {
        setSelectedServices(prev => prev.includes(svcId) ? prev.filter(i => i !== svcId) : [...prev, svcId]);
    };

    const calculateTotal = () => {
        const base = availableServices.filter(s => selectedServices.includes(s.id)).reduce((acc, s) => acc + s.price, 0);
        const travel = visitType === 'home' ? 300 : 0;
        return base + travel;
    };

    const handleConfirmBooking = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const total = calculateTotal();
        
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('pet_id', selectedPet?.pet_id || '-1');
            formData.append('total_amount', total.toString());
            formData.append('payment_method', paymentMethod.toUpperCase());
            formData.append('visit_type', visitType.toUpperCase());

            const endpoint = type === 'doctor' ? 'book_doctor_appointment.php' : 'book_spa.php';
            
            if (type === 'doctor') {
                formData.append('doctor_id', id || '');
                // Format: "15 Mar 2026"
                formData.append('appointment_date', `${selectedDate.date} ${selectedDate.month} ${selectedDate.year}`);
                formData.append('booking_time', selectedTime);
                // Get display names of services
                const svcNames = availableServices
                    .filter(s => selectedServices.includes(s.id))
                    .map(s => s.name)
                    .join(', ');
                formData.append('service_name', svcNames);
            } else {
                formData.append('spa_owner_id', provider?.user_id || id || '');
                // Spa uses single service_id for the profiles connection, we'll pick the first one
                formData.append('service_id', selectedServices[0]?.toString() || '0');
                
                // Spa backend expects "Y-m-d H:i:s"
                // Map month short name to number
                const monthMap: any = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
                const monthNum = monthMap[selectedDate.month] || '01';
                const formattedDate = `${selectedDate.year}-${monthNum}-${selectedDate.date.padStart(2, '0')}`;
                
                // Convert "09:00 AM" to "09:00:00"
                let [time, modifier] = selectedTime.split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString().padStart(2, '0');
                const formattedTime = `${hours}:${minutes}:00`;
                
                formData.append('booking_date', `${formattedDate} ${formattedTime}`);
                
                const svcNames = availableServices
                    .filter(s => selectedServices.includes(s.id))
                    .map(s => s.name)
                    .join(', ');
                formData.append('services', svcNames);
                // For backend compatibility, ensure service_id is passed if possible
                if (selectedServices.length > 0) {
                    formData.append('service_id', selectedServices[0].toString());
                }
            }

            const res = await fetch(`${ROOT_URL}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success || data.status === 'success') {
                setBookingId(data.booking_id || 'PNX' + Math.random().toString(36).substr(2, 6).toUpperCase());
                setStep(4);
            } else {
                alert(data.error || data.message || 'Booking failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during booking.');
        }
    };

    if (loading) return <Shell role={role}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>Loading...</div></Shell>;

    return (
        <Shell role={role}>
            <style>{`
                .step-dot {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    transition: all 0.3s;
                }
                .service-card {
                    padding: 16px;
                    border-radius: 16px;
                    border: 2px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .service-card.selected {
                    border-color: ${themeColor};
                    background: ${isDoctor ? '#f0fdf4' : '#fffbeb'};
                }
                .date-card {
                    padding: 12px;
                    min-width: 80px;
                    text-align: center;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    background: white;
                }
                .date-card.selected {
                    background: ${themeColor};
                    color: white;
                    border-color: ${themeColor};
                    box-shadow: 0 8px 20px ${themeColor}30;
                }
                .time-slot {
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    text-align: center;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 13px;
                }
                .time-slot.selected {
                    background: #0f172a;
                    color: white;
                    border-color: #0f172a;
                }
                .visit-card {
                    padding: 20px;
                    border-radius: 20px;
                    border: 2px solid #f1f5f9;
                    cursor: pointer;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .visit-card.selected {
                    border-color: ${themeColor};
                    background: ${isDoctor ? '#f0fdf4' : '#fffbeb'};
                }
            `}</style>

            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
                {/* Header Gradient */}
                <div style={{ background: themeBg, borderRadius: '32px', padding: '40px', color: 'white', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '10px 16px', color: 'white', cursor: 'pointer' }}>← Back</button>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Book {isDoctor ? 'Doctor' : 'Spa'}</h2>
                        <div style={{ width: '80px' }} />
                    </div>

                    {/* Steps Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 0 }} />
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                                <div className="step-dot" style={{
                                    background: step >= s ? 'white' : 'rgba(255,255,255,0.3)',
                                    color: step >= s ? themeColor : 'white',
                                    boxShadow: step === s ? '0 0 0 6px rgba(255,255,255,0.2)' : 'none'
                                }}>{s}</div>
                                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: step === s ? 1 : 0.6 }}>
                                    {s === 1 ? 'Services' : s === 2 ? 'Schedule' : s === 3 ? 'Summary' : 'Done'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Select Services</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Choose your pet and the services you need.</p>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Pet</label>
                                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                                        {myPets.length > 0 ? myPets.map(pet => (
                                            <div key={pet.pet_id} onClick={() => setSelectedPet(pet)} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '16px', border: '2px solid',
                                                borderColor: selectedPet?.pet_id === pet.pet_id ? themeColor : '#f1f5f9',
                                                background: selectedPet?.pet_id === pet.pet_id ? (isDoctor ? '#f0fdf4' : '#fffbeb') : 'white',
                                                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                                            }}>
                                                <img 
                                                    src={pet.image_url ? (pet.image_url.startsWith('http') ? pet.image_url : ROOT_URL + pet.image_url) : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=32'} 
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                                    alt=""
                                                />
                                                <span style={{ fontWeight: '800', color: '#0f172a' }}>{pet.pet_name}</span>
                                            </div>
                                        )) : (
                                            <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>No pets found. Add a pet in "My Pets" first.</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {availableServices.length > 0 ? 'Available Services' : 'Loading Services...'}
                                    </label>
                                    {availableServices.length > 0 ? availableServices.map(svc => (
                                        <div key={svc.id} className={`service-card ${selectedServices.includes(svc.id) ? 'selected' : ''}`} onClick={() => toggleService(svc.id)}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ fontSize: '24px' }}>{svc.icon}</div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{svc.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{svc.duration}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '900', color: themeColor, fontSize: '18px' }}>₹{svc.price}</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#f8fafc', borderRadius: '16px' }}>Fetching services...</div>
                                    )}
                                </div>

                                <button
                                    disabled={selectedServices.length === 0 || !selectedPet}
                                    onClick={() => setStep(2)}
                                    style={{
                                        width: '100%', marginTop: '40px', padding: '18px', borderRadius: '16px', background: themeBg,
                                        color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
                                        opacity: (selectedServices.length === 0 || !selectedPet) ? 0.5 : 1, transition: 'all 0.2s'
                                    }}
                                >
                                    Next: Select Schedule →
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Pick a Slot</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Choose your preferred date and time.</p>

                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px' }}>
                                    {DATES.map((d, i) => (
                                        <div key={i} className={`date-card ${selectedDate.date === d.date ? 'selected' : ''}`} onClick={() => setSelectedDate(d)}>
                                            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>{d.day}</div>
                                            <div style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0' }}>{d.date}</div>
                                            <div style={{ fontSize: '10px', fontWeight: '700' }}>{d.month}</div>
                                        </div>
                                    ))}
                                </div>

                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Slot</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
                                    {TIME_SLOTS.map(time => (
                                        <div key={time} className={`time-slot ${selectedTime === time ? 'selected' : ''}`} onClick={() => setSelectedTime(time)}>
                                            {time}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '18px', borderRadius: '16px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '800', cursor: 'pointer' }}>Back</button>
                                    <button disabled={!selectedTime} onClick={() => setStep(3)} style={{ flex: 2, padding: '18px', borderRadius: '16px', background: themeBg, color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', opacity: !selectedTime ? 0.5 : 1 }}>Next: Review & Payment →</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Final Review</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Review your booking and complete the payment.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                    <div className={`visit-card ${visitType === 'clinic' ? 'selected' : ''}`} onClick={() => setVisitType('clinic')}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #f1f5f9' }}>🏥</div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>Clinic Visit</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Visit doctor's clinic. No extra charges.</div>
                                        </div>
                                    </div>
                                    <div className={`visit-card ${visitType === 'home' ? 'selected' : ''}`} onClick={() => setVisitType('home')}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid #f1f5f9' }}>🏠</div>
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>Home Service</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Professional comes to your place. +₹300 fee.</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Summary</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {availableServices.filter(s => selectedServices.includes(s.id)).map(s => (
                                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
                                                <span>{s.name}</span>
                                                <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{s.price}</span>
                                            </div>
                                        ))}
                                        {visitType === 'home' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '14px' }}>
                                                <span>Travel Charges</span>
                                                <span style={{ fontWeight: '700', color: '#0f172a' }}>₹300</span>
                                            </div>
                                        )}
                                        <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>
                                            <span>Total Amount</span>
                                            <span style={{ color: themeColor }}>₹{calculateTotal()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '40px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment Method</label>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div
                                            onClick={() => setPaymentMethod('upi')}
                                            style={{
                                                flex: 1, padding: '24px', borderRadius: '20px', border: '2px solid',
                                                borderColor: paymentMethod === 'upi' ? themeColor : '#f1f5f9',
                                                background: paymentMethod === 'upi' ? (isDoctor ? '#f0fdf4' : '#fffbeb') : 'white',
                                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                                            }}
                                        >
                                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
                                            <div style={{ fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>Online UPI</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Secure Digital Pay</div>
                                        </div>
                                        <div
                                            onClick={() => setPaymentMethod('cash')}
                                            style={{
                                                flex: 1, padding: '24px', borderRadius: '20px', border: '2px solid',
                                                borderColor: paymentMethod === 'cash' ? themeColor : '#f1f5f9',
                                                background: paymentMethod === 'cash' ? (isDoctor ? '#f0fdf4' : '#fffbeb') : 'white',
                                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                                            }}
                                        >
                                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💵</div>
                                            <div style={{ fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>Cash on Visit</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Pay after completion</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: '18px', borderRadius: '16px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '800', cursor: 'pointer' }}>Back</button>
                                    <button 
                                        onClick={() => {
                                            if (paymentMethod === 'upi') setShowUPIStep(true);
                                            else handleConfirmBooking();
                                        }} 
                                        style={{ flex: 2, padding: '18px', borderRadius: '16px', background: themeBg, color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer' }}
                                    >
                                        {paymentMethod === 'upi' ? 'Proceed to Pay →' : `Confirm & Pay ₹${calculateTotal()} →`}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showUPIStep && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
                                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', textAlign: 'center', maxWidth: '440px', width: '100%' }}>
                                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📱</div>
                                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>UPI Payment</h3>
                                                <p style={{ color: '#64748b', marginBottom: '24px' }}>Please transfer the amount to the provider's UPI ID.</p>
                                                
                                                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '800', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Simulating UPI Payment (Mock)</div>
                                                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>₹{calculateTotal()}</div>
                                                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Paying to: <b>{provider?.full_name || provider?.spa_name || 'Service Provider'}</b></p>
                                                    <button 
                                                        onClick={handleConfirmBooking}
                                                        style={{ width: '100%', padding: '18px', background: themeBg, color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}
                                                    >
                                                        ✅ Confirm & Pay (Mock)
                                                    </button>
                                                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Test Mode: Simulated payment success.</p>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <button onClick={handleConfirmBooking} style={{ width: '100%', padding: '18px', borderRadius: '16px', background: themeBg, color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>✅ I Have Paid</button>
                                                    <button onClick={() => setShowUPIStep(false)} style={{ width: '100%', padding: '14px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '80px', marginBottom: '24px' }}>✅</div>
                                <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Booking Confirmed!</h3>
                                <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px' }}>
                                    Your {isDoctor ? 'appointment' : 'session'} has been successfully scheduled. <br />
                                    Booking ID: <span style={{ fontWeight: '800', color: '#0f172a' }}>{bookingId}</span>
                                </p>

                                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', marginBottom: '40px', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Date</div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{selectedDate.date} {selectedDate.month}, {selectedDate.year}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Time</div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{selectedTime}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Pet</div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{selectedPet?.pet_name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Location</div>
                                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{visitType === 'clinic' ? 'Clinic Visit' : 'Home Service'}</div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => navigate(`/dashboard/${role}`)} style={{ width: '100%', padding: '18px', borderRadius: '16px', background: '#0f172a', color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>Back to Dashboard</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Shell>
    );
};

export default BookAppointment;
