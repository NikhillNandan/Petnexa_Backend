import React, { useState, useRef, useEffect } from 'react';
import { Shell } from '../components/Shell';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS, ROOT_URL } from '../utils/constants';

const Messages = ({ role = 'buyer' }: { role?: string }) => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [userRole, setUserRole] = useState(() => {
        if (role && role !== 'buyer') return role;
        const storedRole = localStorage.getItem('role');
        if (storedRole === 'spa' || storedRole === 'spa_owner') return 'spa_owner';
        return storedRole || 'buyer';
    });

    const roleColors: any = {
        buyer: { color: '#FF8C00', bg: 'linear-gradient(135deg, #FF8C00, #ff5e00)' },
        seller: { color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
        doctor: { color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        spa_owner: { color: '#F60076', bg: 'linear-gradient(135deg, #F60076, #FF4081)' },
    };
    const rc = roleColors[userRole] || roleColors.buyer;

    const location = useLocation();

    const getUser = () => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            fetchConversations(false);
            if (activeChat) fetchMessages(activeChat.other_user_id, false);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeChat]);

    useEffect(() => {
        // Handle starting a new chat from outside
        if (location.state?.recipient) {
            const r = location.state.recipient;
            const existing = contacts.find(c => c.other_user_id === r.other_user_id || c.other_user_id === r.id);
            if (existing) {
                handleContactClick(existing);
            } else {
                // Temporary mock for starting new chat
                const tempContact = {
                    other_user_id: r.other_user_id || r.id || r.user_id,
                    other_user_name: r.other_user_name || r.name,
                    other_user_photo: r.other_user_photo || r.img || r.profile_image,
                    is_online: 0,
                    last_message: 'Start a new conversation!',
                    unread_count: 0
                };
                setActiveChat(tempContact);
                setMessages([]);
            }
        }
    }, [location.state, contacts.length]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async (loadState = true) => {
        try {
            const user = getUser();
            if (!user) return;
            const res = await fetch(`${API_ENDPOINTS.CHAT}?action=get_conversations&user_id=${user.user_id}`);
            const data = await res.json();
            if (data.success) {
                setContacts(data.conversations || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (other_user_id: number, markRead = true) => {
        try {
            const user = getUser();
            if (!user) return;
            const res = await fetch(`${API_ENDPOINTS.CHAT}?action=get_messages&user_id=${user.user_id}&other_user_id=${other_user_id}&last_message_id=0`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages || []);
            }

            if (markRead) {
                await fetch(`${API_ENDPOINTS.CHAT}?action=mark_read`, {
                    method: 'POST',
                    body: JSON.stringify({ user_id: user.user_id, sender_id: other_user_id })
                });
                fetchConversations(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleContactClick = (c: any) => {
        setActiveChat(c);
        setMobileChatOpen(true);
        fetchMessages(c.other_user_id);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat) return;

        const user = getUser();
        if (!user) return;

        const text = inputText;
        setInputText('');

        try {
            const res = await fetch(`${API_ENDPOINTS.CHAT}?action=send_message`, {
                method: 'POST',
                body: JSON.stringify({
                    sender_id: user.user_id,
                    receiver_id: activeChat.other_user_id,
                    message_text: text,
                    message_type: 'text'
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.data]);
                fetchConversations(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const formatTime = (ts: string) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Shell role={userRole}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } } @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; } 40% { transform: scale(1.2); opacity: 1; } }`}</style>
            <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>

                {/* Left: Contacts */}
                <div style={{ width: '320px', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #F8FAFC' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em' }}>Messages</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '10px 16px' }}>
                            <span>🔍</span>
                            <input type="text" placeholder="Search conversations..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontWeight: '500', color: '#0F172A', width: '100%', fontFamily: "'Outfit', system-ui" }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {contacts.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>No conversations yet.</div>
                        ) : contacts.map(contact => (
                            <div key={contact.other_user_id} onClick={() => handleContactClick(contact)}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s ease', background: activeChat && activeChat.other_user_id === contact.other_user_id ? `${rc.color}10` : 'transparent', border: `1px solid ${activeChat && activeChat.other_user_id === contact.other_user_id ? rc.color + '25' : 'transparent'}`, marginBottom: '2px' }}
                                onMouseEnter={e => { if (!activeChat || activeChat.other_user_id !== contact.other_user_id) e.currentTarget.style.background = '#F8FAFC'; }}
                                onMouseLeave={e => { if (!activeChat || activeChat.other_user_id !== contact.other_user_id) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {contact.other_user_photo ? (
                                            <img src={contact.other_user_photo.startsWith('http') ? contact.other_user_photo : ROOT_URL + contact.other_user_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                                        ) : (
                                            <span style={{ fontSize: '20px' }}>💬</span>
                                        )}
                                    </div>
                                    {contact.is_online > 0 && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: activeChat && activeChat.other_user_id === contact.other_user_id ? rc.color : '#0F172A', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                            {contact.other_user_name}
                                        </span>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8' }}>{formatTime(contact.last_message_time)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                            {contact.last_message || 'Attachment...'}
                                        </p>
                                        {contact.unread_count > 0 && (
                                            <div style={{ width: '20px', height: '20px', background: rc.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>
                                                {contact.unread_count}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Chat */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activeChat ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94A3B8' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Your Messages</h3>
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '20px 28px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {activeChat.other_user_photo ? (
                                            <img src={activeChat.other_user_photo.startsWith('http') ? activeChat.other_user_photo : ROOT_URL + activeChat.other_user_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                                        ) : (
                                            <span style={{ fontSize: '20px' }}>💬</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.01em' }}>{activeChat.other_user_name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            {activeChat.is_online > 0 && <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />}
                                            <span style={{ fontSize: '11px', color: activeChat.is_online > 0 ? '#10b981' : '#94A3B8', fontWeight: '700' }}>
                                                {activeChat.is_online > 0 ? 'Active now' : 'Last seen recently'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Call Action Button Removed */}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FAFBFF' }}>
                                {messages.map((msg, i) => {
                                    const user = getUser();
                                    const isMe = msg.sender_id === user?.user_id;

                                    return (
                                        <motion.div key={msg.message_id || i} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                            style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}
                                        >
                                            <div style={{ maxWidth: '65%' }}>
                                                <div style={{
                                                    padding: '12px 16px',
                                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: isMe ? rc.bg : 'white',
                                                    color: isMe ? 'white' : '#0F172A',
                                                    fontSize: '14px', fontWeight: '500', lineHeight: '1.5',
                                                    boxShadow: isMe ? `0 4px 16px ${rc.color}30` : '0 2px 8px rgba(0,0,0,0.06)',
                                                    border: !isMe ? '1px solid #F1F5F9' : 'none',
                                                }}>
                                                    {msg.message_text}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600', marginTop: '4px', textAlign: isMe ? 'right' : 'left', paddingLeft: '4px', paddingRight: '4px' }}>
                                                    {formatTime(msg.timestamp)} {isMe && <span style={{ color: msg.is_read > 0 ? '#10b981' : '#94A3B8' }}>{msg.is_read > 0 ? '✓✓' : '✓'}</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center', background: 'white' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '16px', padding: '13px 18px', transition: 'all 0.2s' }}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        placeholder="Type a message..."
                                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: '#0F172A', fontFamily: "'Outfit', system-ui" }}
                                    />
                                </div>
                                <button type="submit" style={{ width: '52px', height: '52px', borderRadius: '16px', background: rc.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', boxShadow: `0 8px 20px ${rc.color}40`, transition: 'all 0.2s', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                    ➤
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </Shell>
    );
};

export default Messages;
