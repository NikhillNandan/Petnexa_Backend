import React from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';

const PrivacyPolicy = ({ role = 'buyer' }: { role?: string }) => {
    return (
        <Shell role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Privacy <span style={{ color: '#FF8C00' }}>Policy.</span> 🛡️</h1>
                    <p style={{ color: '#64748b', marginBottom: '40px' }}>Last updated: March 15, 2026</p>

                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>1. Information We Collect</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                We collect information you provide directly to us, such as when you create an account, list a pet, or book an appointment. This includes your name, email, phone number, and location data.
                            </p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>2. How We Use Your Data</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                Your data is used to provide our services, process transactions, and improve the PetNexa experience. We use location data specifically to show you relevant pets and professionals within your radius.
                            </p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>3. Data Sharing</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                We do not sell your personal data. We only share information with sellers or professionals when you initiate a transaction or booking to facilitate the service.
                            </p>
                        </section>

                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                                For privacy concerns, contact us at: <span style={{ color: '#FF8C00' }}>privacy@petnexa.com</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Shell>
    );
};

export default PrivacyPolicy;
