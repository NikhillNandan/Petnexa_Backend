import React from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';

const About = ({ role = 'buyer' }: { role?: string }) => {
    return (
        <Shell role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>About <span style={{ color: '#FF8C00' }}>PetNexa.</span> 🐾</h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '40px' }}>
                        PetNexa is India's most trusted digital platform for pet lovers. We connect pet parents with trusted sellers, professional veterinarians, and premium spa services—all in one place.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🐕‍🦺</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Our Mission</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>To make pet care accessible, reliable, and delightful for every pet parent in the country.</p>
                        </div>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛡️</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Fully Trusted</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Every listing and professional on our platform undergoes a rigorous verification process.</p>
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', color: 'white' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>App Version 2.4.0</h3>
                        <p style={{ opacity: 0.7, lineHeight: '1.6', marginBottom: '0' }}>
                            Built with ❤️ by the PetNexa Team.<br />
                            Dedicated to providing the best experience for you and your furry friends.
                        </p>
                    </div>
                </motion.div>
            </div>
        </Shell>
    );
};

export default About;
