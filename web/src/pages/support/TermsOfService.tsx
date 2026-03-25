import React from 'react';
import { Shell } from '../../components/Shell';
import { motion } from 'framer-motion';

const TermsOfService = ({ role = 'buyer' }: { role?: string }) => {
    return (
        <Shell role={role}>
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Terms of <span style={{ color: '#FF8C00' }}>Service.</span> ⚖️</h1>
                    <p style={{ color: '#64748b', marginBottom: '40px' }}>Effective Date: March 15, 2026</p>

                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>1. Acceptance of Terms</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                By accessing PetNexa, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
                            </p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>2. User Responsibilities</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                You are responsible for maintaining the confidentiality of your account. Sellers must provide accurate information about pet health and vaccinations. Doctors and Spas must maintain professional standards.
                            </p>
                        </section>

                        <section>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>3. Prohibited Conduct</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px' }}>
                                Fraudulent listings, animal cruelty, and harassment of other users are strictly prohibited and will result in permanent account termination.
                            </p>
                        </section>

                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <p style={{ margin: 0, color: '#475569', fontSize: '13px', fontStyle: 'italic' }}>
                                PetNexa reserves the right to modify these terms at any time.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Shell>
    );
};

export default TermsOfService;
