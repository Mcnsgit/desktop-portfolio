import React from 'react';
import styles from './CV.module.scss';
import TextFileViewer from './TextFileViewer';

const CV = () => {
    const cvContent = "This is a virtual Windows 98 desktop built with Next.js and TypeScript!";
    return (
        <div className={styles.cv}>
            <TextFileViewer content={cvContent} />
        </div>
    );
};

export default CV;