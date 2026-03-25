import React, { useState } from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';
import { Clock, Calendar, Save, Plus, X, Check } from 'lucide-react';

const SpaAvailability = () => {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [schedule, setSchedule] = useState<any>({
        Monday: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
        Tuesday: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '06:00 PM'],
        Wednesday: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        Thursday: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
        Friday: ['10:00 AM', '11:00 AM', '12:00 PM', '05:00 PM'],
        Saturday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        Sunday: ['10:00 AM', '11:00 AM', '12:00 PM'],
    });

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    const toggleSlot = (time: string) => {
        const current = [...(schedule[selectedDay] || [])];
        if (current.includes(time)) {
            setSchedule({ ...schedule, [selectedDay]: current.filter(t => t !== time) });
        } else {
            setSchedule({ ...schedule, [selectedDay]: [...current, time].sort() });
        }
    };

    const handleSave = () => {
        alert('Spa hours updated successfully! ✨');
    };

    return (
        <Shell role="spa">
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                            Spa <span style={{ color: '#f59e0b' }}>Availability.</span> ✨
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '16px', fontWeight: '600' }}>Manage your grooming sessions and operational hours.</p>
                    </div>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,158,11,0.25)' }}>
                        <Save size={18} /> Save Changes
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
                    {/* Days Sidebar */}
                    <div style={{ background: 'white', borderRadius: '24px', padding: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.keys(schedule).map(day => (
                            <button key={day} onClick={() => setSelectedDay(day)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '16px', border: 'none',
                                    background: selectedDay === day ? 'rgba(245,158,11,0.06)' : 'transparent',
                                    color: selectedDay === day ? '#f59e0b' : '#64748B',
                                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {day}
                                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '8px', background: selectedDay === day ? '#f59e0b' : '#F1F5F9', color: selectedDay === day ? 'white' : '#94A3B8' }}>
                                    {schedule[day].length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Time Slots Grid */}
                    <div style={{ background: 'white', borderRadius: '32px', padding: '40px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛁</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>Slots for {selectedDay}</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                            {timeSlots.map(time => {
                                const active = schedule[selectedDay].includes(time);
                                return (
                                    <button key={time} onClick={() => toggleSlot(time)}
                                        style={{
                                            padding: '16px', borderRadius: '16px', border: active ? '2px solid #f59e0b' : '1px solid #E2E8F0',
                                            background: active ? 'white' : '#F8FAFC',
                                            color: active ? '#f59e0b' : '#64748B',
                                            fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        {active && <Check size={14} />} {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
};

export default SpaAvailability;
