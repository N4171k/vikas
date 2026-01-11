'use client';

import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import styles from './ChatBubble.module.css';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m VIKAS AI 🤖 How can I help you shop today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await api.aiQuery(userMessage);

            if (response.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.response || 'I found some products for you!',
                    products: response.data.products
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message || 'Sorry, I couldn\'t process that. Try asking about products!'
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting. Please try again!'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        'Show me trending products',
        'Find cotton pants under ₹1000',
        'What are the best rated items?'
    ];

    return (
        <div className={styles.chatContainer}>
            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    {/* Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.headerInfo}>
                            <div className={styles.avatar}>🤖</div>
                            <div>
                                <h4>VIKAS AI</h4>
                                <span className={styles.status}>Online</span>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.chatMessages}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${styles.message} ${styles[msg.role]}`}
                            >
                                <div className={styles.messageContent}>
                                    {msg.content}

                                    {/* Product Cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className={styles.productList}>
                                            {msg.products.slice(0, 3).map((product, pIdx) => (
                                                <a
                                                    key={pIdx}
                                                    href={`/product/${product.id}`}
                                                    className={styles.miniProduct}
                                                >
                                                    <img
                                                        src={product.images?.[0] || 'https://via.placeholder.com/60'}
                                                        alt={product.title}
                                                    />
                                                    <div>
                                                        <p className={styles.miniTitle}>{product.title?.substring(0, 40)}...</p>
                                                        <p className={styles.miniPrice}>₹{parseFloat(product.price).toLocaleString()}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.message} ${styles.assistant}`}>
                                <div className={styles.messageContent}>
                                    <div className={styles.typing}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length <= 2 && (
                        <div className={styles.quickActions}>
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setInput(action); }}
                                    className={styles.quickAction}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.chatInput}>
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className={styles.sendBtn}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                id="tour-ai-chat"
                className={`${styles.floatingBtn} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                        </svg>
                        <span className={styles.badge}>AI</span>
                    </>
                )}
            </button>
        </div>
    );
}
