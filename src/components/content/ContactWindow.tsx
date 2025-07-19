// src/components/windows/WindowTypes/ContactWindow.tsx
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { fadeIn } from '../../utils/motion';
import { contact } from '../../config/data';
import Image from 'next/image';
import styles from './ContactWindow.module.scss';

const ContactWindow: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Validate form
        if (!formData.name || !formData.email || !formData.message) {
            setSubmitStatus({
                success: false,
                message: 'Please fill in all fields'
            });
            setIsSubmitting(false);
            return;
        }

        // In a real application, this would send data to a server
        // For this portfolio, we'll simulate a successful submission
        setTimeout(() => {
            setSubmitStatus({
                success: true,
                message: 'Thank you for your message! I\'ll get back to you soon.'
            });
            setIsSubmitting(false);
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className={styles.contactWindow}>
            <div className={styles.windowContent}>
                <motion.div
                    variants={fadeIn('right', 'tween', 0.1, 1) as Variants}
                    className={styles.contactInfo}
                >
                    <h2 className={styles.heading}>Contact Information</h2>

                    <div className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                            <Image
                                src="/assets/win98-icons/png/msn3-4.png"
                                alt="Email"
                                width={24}
                                height={24}
                            />
                        </div>
                        <div className={styles.infoText}>
                            <h3>Email</h3>
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                            <Image
                                src="/assets/win98-icons/png/address_book_card.png"
                                alt="Phone"
                                width={24}
                                height={24}
                            />
                        </div>
                        <div className={styles.infoText}>
                            <h3>Phone</h3>
                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </div>
                    </div>

                    <div className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                            <Image
                                src="/assets/win98-icons/png/world-1.png"
                                alt="Location"
                                width={24}
                                height={24}
                            />
                        </div>
                        <div className={styles.infoText}>
                            <h3>Location</h3>
                            <p>{contact.location}</p>
                        </div>
                    </div>

                    <div className={styles.socialLinks}>
                        {contact.linkedin && (
                            <a
                                href={contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialIcon}
                                title="LinkedIn"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        )}

                        {contact.github && (
                            <a
                                href={contact.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialIcon}
                                title="GitHub"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeIn('left', 'tween', 0.2, 1) as Variants}
                    className={styles.contactForm}
                >
                    <h2 className={styles.heading}>Send a Message</h2>

                    {submitStatus && (
                        <div className={`${styles.statusMessage} ${submitStatus.success ? styles.success : styles.error}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={styles.formControl}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={styles.formControl}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={styles.formControl}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.submitButton}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactWindow;