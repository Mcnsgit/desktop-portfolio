// src/components/windows/WindowTypes/EducationWindow.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, textVariant } from '../../utils/motion';
import { education, currentLearning } from '../../config/index';
import Image from 'next/image';
import styles from './EducationWindow.module.scss';

const EducationWindow: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'education' | 'current'>('education');

    return (
        <div className={styles.educationWindow}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'education' ? styles.active : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    Education History
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'current' ? styles.active : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    Current Learning
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'education' ? (
                    <EducationHistory />
                ) : (
                    <CurrentLearning />
                )}
            </div>
        </div>
    );
};

const EducationHistory: React.FC = () => {
    return (
        <motion.div
            variants={fadeIn("up", "spring", 0.1, 1)}
            className={styles.educationContainer}
        >
            <motion.h2
                variants={textVariant(0.1)}
                className={styles.sectionTitle}
            >
                Education History
            </motion.h2>

            <div className={styles.timelineContainer}>
                {education.map((item, index) => (
                    <EducationItem
                        key={`edu-${index}`}
                        degree={item.degree}
                        institution={item.institution}
                        date={item.date}
                        description={item.description}
                        icon={item.icon}
                        index={index}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const EducationItem: React.FC<{
    degree: string;
    institution: string;
    date: string;
    description: string;
    icon: string | any;
    index: number;
}> = ({ degree, institution, date, description, icon, index }) => {
    const [expanded, setExpanded] = useState(index === 0); // First item expanded by default

    return (
        <motion.div
            variants={fadeIn("up", "spring", index * 0.1 + 0.2, 0.75)}
            className={`${styles.educationItem} ${expanded ? styles.expanded : ''}`}
            onClick={() => setExpanded(!expanded)}
        >
            <div className={styles.educationHeader}>
                <div className={styles.iconContainer}>
                    {typeof icon === 'string' ? (
                        <Image
                            src={icon}
                            alt={institution}
                            width={32}
                            height={32}
                            className={styles.educationIcon}
                        />
                    ) : (
                        <div className={styles.defaultIcon}>
                            <span>{institution.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <div className={styles.headerText}>
                    <h3 className={styles.degreeTitle}>{degree}</h3>
                    <div className={styles.institutionRow}>
                        <span className={styles.institution}>{institution}</span>
                        <span className={styles.date}>{date}</span>
                    </div>
                </div>

                <div className={`${styles.expandIcon} ${expanded ? styles.expanded : ''}`}>
                    ▶
                </div>
            </div>

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.educationDetails}
                >
                    <p className={styles.description}>{description}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

const CurrentLearning: React.FC = () => {
    return (
        <motion.div
            variants={fadeIn("up", "spring", 0.1, 1)}
            className={styles.currentLearningContainer}
        >
            <motion.h2
                variants={textVariant(0.1)}
                className={styles.sectionTitle}
            >
                Currently Learning
            </motion.h2>

            <div className={styles.courseContainer}>
                {currentLearning.map((course, index) => (
                    <motion.div
                        key={`course-${index}`}
                        variants={fadeIn("up", "spring", index * 0.1 + 0.2, 0.75)}
                        className={styles.courseItem}
                    >
                        <div className={styles.courseHeader}>
                            <div className={styles.courseStatus}>
                                <span
                                    className={`${styles.statusDot} ${course.status === 'In progress' ? styles.inProgress : styles.notStarted}`}
                                ></span>
                                <span className={styles.statusText}>{course.status}</span>
                            </div>
                            <span className={styles.courseDate}>{course.startDate}</span>
                        </div>

                        <h3 className={styles.courseTitle}>{course.course}</h3>

                        {course.platform && (
                            <div className={styles.coursePlatform}>
                                <span>Platform: </span>
                                {course.platform}
                            </div>
                        )}

                        <p className={styles.courseDescription}>{course.description}</p>

                        {course.resource && (
                            <a
                                href={course.resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.courseLink}
                            >
                                View Course Resource
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default EducationWindow;