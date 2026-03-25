import React, { useState, useEffect } from 'react';
import { Shell } from '../../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { ROOT_URL } from '../../utils/constants';

const DoctorDashboard = ({ view = 'dashboard' }: { view?: string }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: "Today's Appointments", value: '0', emoji: '📅', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
        { label: 'Total Patients', value: '0', emoji: '🐾', color: '#FF8C00', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
        { label: 'Total Earnings', value: '₹0', emoji: '💰', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.15)' },
    ]);

    const [appointments, setAppointments] = useState<any[]>([]);
    const [allAppointments, setAllAppointments] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [extraAmount, setExtraAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const u = JSON.parse(userData);
            api.getDashboard('doctor', u.user_id).then(res => {
                if (res.success) {
                    setStats([
                        { label: "Today's Appointments", value: res.appointments_today.toString(), emoji: '📅', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                        { label: 'Total Patients', value: res.total_patients.toString(), emoji: '🐾', color: '#00C950', bg: 'rgba(0,201,80,0.08)', border: 'rgba(0,201,80,0.15)' },
                        { label: 'Total Earnings', value: `₹${res.total_earnings.toLocaleString()}`, emoji: '💰', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)' },
                    ]);
                }
            }).catch(console.error);

            // Fetch real appointments
            api.get(`${ROOT_URL}get_today_appointments.php?doctor_id=${u.user_id}&all=1`).then(res => {
                if (res.success) {
                    setAllAppointments(res.appointments || []);
                    setAppointments(res.appointments || []);
                    
                    // Recalculate Earnings
                    const completedTotal = (res.appointments || []).filter((a: any) => 
                        ['CONFIRMED', 'COMPLETED', 'SUCCESS'].includes(a.status?.toUpperCase())
                    ).reduce((acc: number, a: any) => acc + Number(a.fee || a.amount || 0), 0);
                    
                    setStats(prev => prev.map(s => 
                        s.label === 'Total Earnings' ? { ...s, value: `₹${completedTotal.toLocaleString('en-IN')}` } : s
                    ));
                }
                setLoadingAppts(false);
            }).catch(() => setLoadingAppts(false));
        }
    }, []);

    useEffect(() => {
        if (filter === 'ALL') {
            setAppointments(allAppointments);
        } else {
            setAppointments(allAppointments.filter(a => a.status.toUpperCase() === filter || (filter === 'PENDING' && a.status.toUpperCase() === 'BOOKED')));
        }
    }, [filter, allAppointments]);

    const handleAppointmentAction = async (appointmentId: number, status: string) => {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const u = JSON.parse(userData);

        try {
            const formData = new URLSearchParams();
            formData.append('appointment_id', appointmentId.toString());
            formData.append('doctor_id', u.user_id.toString());
            formData.append('status', status);

            const res = await fetch(`${ROOT_URL}update_appointment_status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert(`Appointment ${status === 'CONFIRMED' ? 'confirmed' : 'cancelled'} successfully!`);
                // Refresh
                api.get(`${ROOT_URL}get_today_appointments.php?doctor_id=${u.user_id}&all=1`).then(res => {
                    if (res.success) setAllAppointments(res.appointments || []);
                });
            } else {
                alert(data.error || 'Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    const handleUploadCertificate = (type: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.type !== 'application/pdf') {
                alert("Please select a valid PDF file.");
                return;
            }

            setIsUploading(true);
            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    const bodyPayload = {
                        appointment_id: selectedPatient.appointment_id,
                        certificate_type: type,
                        certificate_data: base64Data
                    };

                    const res = await fetch(`${ROOT_URL}certificate_management.php?action=upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyPayload)
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert(`${type} uploaded successfully to PetNexa Cloud for ${selectedPatient.pet_name}! 🚀`);
                    } else {
                        alert(`Upload failed: ${data.error || 'Unknown error'}`);
                    }
                    setIsUploading(false);
                };
            } catch (err) {
                console.error(err);
                alert('Something went wrong during upload.');
                setIsUploading(false);
            }
        };
        input.click();
    };

    const handleRequestExtraPayment = async () => {
        if (!extraAmount || isNaN(Number(extraAmount)) || Number(extraAmount) <= 0) {
            alert("Please enter a valid extra amount.");
            return;
        }
        setIsProcessingPayment(true);
        try {
            const formData = new URLSearchParams();
            formData.append('appointment_id', selectedPatient.appointment_id.toString());
            formData.append('amount', extraAmount);

            const res = await fetch(`${ROOT_URL}update_extra_payment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert("Extra payment requested successfully!");
                setSelectedPatient((prev: any) => ({ ...prev, extra_paid_amount: extraAmount, extra_payment_status: 'PENDING' }));
                
                // Refresh full list quietly
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                if (u.user_id) {
                    api.get(`${ROOT_URL}get_today_appointments.php?doctor_id=${u.user_id}&all=1`).then(r => {
                        if (r.success) setAllAppointments(r.appointments || []);
                    });
                }
            } else {
                alert(data.error || 'Failed to request payment');
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleVerifyExtraPayment = async () => {
        setIsProcessingPayment(true);
        try {
            const formData = new URLSearchParams();
            formData.append('appointment_id', selectedPatient.appointment_id.toString());

            const res = await fetch(`${ROOT_URL}confirm_extra_payment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            if (data.success) {
                alert("Payment confirmed successfully!");
                setSelectedPatient((prev: any) => ({ ...prev, extra_payment_status: 'CONFIRMED' }));
                
                // Refresh full list quietly
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                if (u.user_id) {
                    api.get(`${ROOT_URL}get_today_appointments.php?doctor_id=${u.user_id}&all=1`).then(r => {
                        if (r.success) setAllAppointments(r.appointments || []);
                    });
                }
            } else {
                alert(data.error || 'Failed to confirm payment');
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const statusColor: any = { 'IN_SESSION': '#10b981', 'WAITING': '#f59e0b', 'UPCOMING': '#FF8C00', 'PENDING': '#f59e0b', 'CONFIRMED': '#10b981', 'CANCELLED': '#ef4444' };
    const statusBg: any = { 'IN_SESSION': 'rgba(16,185,129,0.1)', 'WAITING': 'rgba(245,158,11,0.1)', 'UPCOMING': 'rgba(255,140,0,0.1)', 'PENDING': 'rgba(245,158,11,0.1)', 'CONFIRMED': 'rgba(16,185,129,0.1)', 'CANCELLED': 'rgba(239,68,68,0.1)' };

    const renderAppointmentsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        Clinical <span style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Schedule.</span> 📅
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Manage your patient queue and consultation history.</p>
                </div>
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '6px', borderRadius: '16px', gap: '4px' }}>
                    {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: filter === f ? '#10b981' : 'transparent',
                                color: filter === f ? 'white' : '#64748B',
                                fontSize: '13px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {f === 'CANCELLED' ? 'DECLINED' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.length > 0 ? appointments.map((appt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', cursor: 'pointer' }}
                        onClick={() => { setSelectedPatient(appt); setShowPatientModal(true); }}
                    >
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                            {appt.species === 'Dog' ? '🐕' : appt.species === 'Cat' ? '🐈' : '🐾'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{appt.service_name || appt.type}</div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{appt.pet_name}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>⏰ {appt.time}</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}>{appt.date || 'Today'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F8FAFC', marginTop: '12px' }}>
                                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                                    <div>👤 <span style={{ fontWeight: '700', color: '#0F172A' }}>{appt.owner_name}</span></div>
                                    <div style={{ fontSize: '12px', color: appt.payment_method === 'CASH' ? '#f59e0b' : '#FF8C00', fontWeight: '700', marginTop: '4px' }}>
                                        {appt.payment_method === 'CASH' ? '💰 User likes to pay in cash' : '📱 Paid via UPI'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{
                                        padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                                        background: statusBg[appt.status.toUpperCase()] || 'rgba(148,163,184,0.1)',
                                        color: statusColor[appt.status.toUpperCase()] || '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{appt.status}</div>

                                    {(appt.status.toUpperCase() === 'BOOKED' || appt.status.toUpperCase() === 'PENDING') && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAppointmentAction(appt.appointment_id, 'CANCELLED'); }}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAppointmentAction(appt.appointment_id, 'CONFIRMED'); }}
                                                style={{ padding: '10px 20px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                                            >
                                                Confirm
                                            </button>
                                        </>
                                    )}
                                    {appt.status.toUpperCase() === 'CONFIRMED' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPatient(appt); setShowPatientModal(true); }}
                                            style={{ padding: '10px 20px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', border: '1px solid #10b98130', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Manage Patient
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div style={{ padding: '80px 40px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #F1F5F9', color: '#94A3B8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                        <p style={{ fontSize: '16px', fontWeight: '600' }}>{loadingAppts ? 'Consulting database...' : 'No appointments found for this filter.'}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnalyticsView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                    Clinical <span style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pulse.</span> 📉
                </h1>
                <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Data-driven insights into your veterinary practice performance.</p>
            </div>
            <div style={{ background: 'white', borderRadius: '32px', padding: '60px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🥇</div>
                <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '16px' }}>Practice Excellence</h2>
                <p style={{ color: '#64748B', fontWeight: '600' }}>Your analytics report is being generated based on 124 monthly consults.</p>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Doctor <span style={{ color: '#10b981' }}>Dashboard.</span> 🩺
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>Overview of your patients and today's schedule.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/doctor/appointments')}
                        style={{ padding: '12px 24px', background: '#f8fafc', color: '#0F172A', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                    >
                        View Appointment Requests 📩
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                            if (s.label === 'Total Earnings') navigate('/doctor/analytics');
                            else navigate('/doctor/appointments');
                        }}
                        style={{
                            background: 'white',
                            padding: '28px',
                            borderRadius: '24px',
                            border: `1px solid ${s.border}`,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                {s.emoji}
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{s.value}</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Today's Appointments</h3>
                    <button
                        onClick={() => navigate('/doctor/appointments')}
                        style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Manage Schedule →
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {appointments.slice(0, 4).map((appt, i) => (
                        <div key={i} onClick={() => { setSelectedPatient(appt); setShowPatientModal(true); }} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '20px', background: '#F8FAFC', gap: '20px', cursor: 'pointer' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {appt.species === 'Dog' ? '🐕' : appt.species === 'Cat' ? '🐈' : '🐾'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{appt.pet_name} ({appt.service_name || appt.type})</div>
                                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Owner: {appt.owner_name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{appt.time}</div>
                                <div style={{
                                    marginTop: '4px',
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    background: statusBg[appt.status.toUpperCase()] || 'rgba(148,163,184,0.1)',
                                    color: statusColor[appt.status.toUpperCase()] || '#64748B',
                                    textAlign: 'center'
                                }}>
                                    {appt.status}
                                </div>
                            </div>
                        </div>
                    ))}
                    {appointments.length === 0 && !loadingAppts && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>
                            No patient activity for today.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
                <button onClick={() => navigate('/doctor/analytics')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>E-Prescriptions & Records 💊</button>
                <button onClick={() => navigate('/doctor/reviews')} style={{ flex: 1, padding: '20px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '20px', fontSize: '15px', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>Patient Feedback ⭐</button>
            </div>
        </div>
    );

    return (
        <Shell role="doctor">
            <div style={{ paddingBottom: '60px' }}>
                {view === 'appointments' ? renderAppointmentsView() : view === 'analytics' ? renderAnalyticsView() : renderDashboard()}

                <AnimatePresence>
                    {showPatientModal && selectedPatient && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                            >
                                <div style={{ height: '200px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button onClick={() => setShowPatientModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                        {selectedPatient.species === 'Dog' ? '🐕' : '🐈'}
                                    </div>
                                </div>
                                <div style={{ padding: '40px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' }}>{selectedPatient.pet_name}</h2>
                                        <p style={{ color: '#64748B', fontWeight: '600' }}>Patient ID: #PET-{selectedPatient.appointment_id}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>AI BREED ANALYSIS</div>
                                            <div style={{ color: '#10b981', fontWeight: '900', fontSize: '15px' }}>🧬 {selectedPatient.species} Expert</div>
                                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>High vital signs detected. Healthy weight for age.</p>
                                        </div>
                                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Ownership</div>
                                            <div style={{ color: '#0F172A', fontWeight: '900', fontSize: '15px' }}>👤 {selectedPatient.owner_name}</div>
                                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>Trusted Pet Owner</p>
                                        </div>
                                    </div>

                                    {(!selectedPatient.extra_payment_status || selectedPatient.extra_payment_status !== 'CONFIRMED') && (
                                        <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '24px', border: '1px solid #F1F5F9', marginBottom: '32px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', marginBottom: '16px' }}>Additional Services / Fees</h4>
                                            
                                            {!selectedPatient.extra_payment_status ? (
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ position: 'relative', flex: 1 }}>
                                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#64748B' }}>₹</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Amount" 
                                                            value={extraAmount} 
                                                            onChange={e => setExtraAmount(e.target.value)} 
                                                            style={{ width: '100%', padding: '14px 14px 14px 34px', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700', fontSize: '14px' }}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleRequestExtraPayment} 
                                                        disabled={isProcessingPayment} 
                                                        style={{ padding: '0 24px', borderRadius: '16px', background: '#FF8C00', color: 'white', border: 'none', fontWeight: '800', cursor: isProcessingPayment ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                                                    >
                                                        {isProcessingPayment ? 'Processing...' : 'Request Payment'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,158,11,0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                                                    <div>
                                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                            {selectedPatient.extra_payment_status === 'PAID_CASH' ? 'Paid via Cash (Pending)' : selectedPatient.extra_payment_status === 'PAID_UPI' ? 'Paid via UPI (Pending)' : 'Pending Payment'}
                                                        </div>
                                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#b45309' }}>₹{selectedPatient.extra_paid_amount}</div>
                                                    </div>
                                                    <button 
                                                        onClick={handleVerifyExtraPayment} 
                                                        disabled={isProcessingPayment} 
                                                        style={{ padding: '10px 20px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: '800', cursor: isProcessingPayment ? 'not-allowed' : 'pointer', fontSize: '12px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                                                    >
                                                        {isProcessingPayment ? 'Processing...' : 'Confirm Payment'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedPatient.extra_payment_status === 'CONFIRMED' && (
                                        <div style={{ background: '#ecfdf5', borderRadius: '24px', padding: '20px', border: '1px solid #10b98130', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#10b981' }}>✓</div>
                                                <div>
                                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', marginBottom: '2px' }}>Payment Confirmed</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#064e3b' }}>₹{selectedPatient.extra_paid_amount} Extra Paid</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ background: '#0F172A', borderRadius: '24px', padding: '24px', color: 'white', marginBottom: '32px', opacity: selectedPatient.extra_payment_status !== 'CONFIRMED' ? 0.5 : 1 }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', marginBottom: '16px' }}>Digital Certifications</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <button onClick={() => handleUploadCertificate('Health Cert')} disabled={isUploading || selectedPatient.extra_payment_status !== 'CONFIRMED'} style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', fontWeight: '800', cursor: (isUploading || selectedPatient.extra_payment_status !== 'CONFIRMED') ? 'not-allowed' : 'pointer' }}>
                                                🏥 Upload Health
                                            </button>
                                            <button onClick={() => handleUploadCertificate('Vaccination Cert')} disabled={isUploading || selectedPatient.extra_payment_status !== 'CONFIRMED'} style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', fontWeight: '800', cursor: (isUploading || selectedPatient.extra_payment_status !== 'CONFIRMED') ? 'not-allowed' : 'pointer' }}>
                                                💉 Upload Vaccination
                                            </button>
                                        </div>
                                        {isUploading && <p style={{ fontSize: '10px', color: '#10b981', textAlign: 'center', marginTop: '12px', fontWeight: '800' }}>SECURELY UPLOADING TO CLOUD...</p>}
                                    </div>

                                    <button onClick={() => setShowPatientModal(false)} style={{ width: '100%', padding: '18px', borderRadius: '18px', background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: '800', cursor: 'pointer' }}>Close Records</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};

export default DoctorDashboard;
