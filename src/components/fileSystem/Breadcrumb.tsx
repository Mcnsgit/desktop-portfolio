// src/components/fileSystem/Breadcrumb.tsx
import React, { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useSounds } from '@/hooks/useSounds';
import styles from '../styles/Breadcrumb.module.scss';

interface BreadcrumbSegment {
    name: string;
    path: string;
}

interface BreadcrumbProps {
    path: string;
    segments?: BreadcrumbSegment[];
    onNavigate: (path: string) => void;
    maxSegments?: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    path,
    segments: providedSegments,
    onNavigate,
    maxSegments = 5,
}) => {
    const { playSound } = useSounds();

    // Generate segments from path if not provided
    const segments = useMemo(() => {
        if (providedSegments) return providedSegments;

        const parts = path.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbSegment[] = [];

        let currentPath = '';
        for (const part of parts) {
            currentPath += `/${part}`;
            breadcrumbs.push({
                name: part,
                path: currentPath,
            });
        }

        return breadcrumbs;
    }, [path, providedSegments]);

    // Handle segment click
    const handleSegmentClick = (segmentPath: string) => {
        playSound("click");
        onNavigate(segmentPath);
    };

    // Compress breadcrumbs if there are too many
    const displayedSegments = useMemo(() => {
        if (segments.length <= maxSegments) return segments;

        // Show first, last, and some middle segments
        const firstSegment = segments[0];
        const lastSegments = segments.slice(-3);

        return [
            firstSegment,
            { name: '...', path: '' },
            ...lastSegments,
        ];
    }, [segments, maxSegments]);

    return (
        <div className={styles.breadcrumb}>
            {/* Home/Root button */}
            <button
                className={styles.homeButton}
                onClick={() => handleSegmentClick('/')}
                title="Home"
            >
                <Home size={16} />
            </button>

            {/* Breadcrumb segments */}
            <div className={styles.segmentsContainer}>
                {displayedSegments.map((segment, index) => (
                    <React.Fragment key={segment.path || `ellipsis-${index}`}>
                        {index > 0 && (
                            <ChevronRight size={14} className={styles.separator} />
                        )}

                        {segment.name === '...' ? (
                            <span className={styles.ellipsis}>...</span>
                        ) : (
                            <button
                                className={`${styles.segment} ${index === displayedSegments.length - 1 ? styles.current : ''}`}
                                onClick={() => segment.path && handleSegmentClick(segment.path)}
                                disabled={!segment.path || index === displayedSegments.length - 1}
                                title={segment.path}
                            >
                                {segment.name}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Path text input for direct navigation */}
            <div className={styles.pathInputContainer}>
                <input
                    type="text"
                    className={styles.pathInput}
                    value={path}
                    onChange={(e) => { }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onNavigate(e.currentTarget.value);
                        }
                    }}
                    title="Location"
                />
                <button
                    className={styles.goButton}
                    onClick={() => { }}
                    title="Go"
                >
                    Go
                </button>
            </div>
        </div>
    );
};

export default Breadcrumb;