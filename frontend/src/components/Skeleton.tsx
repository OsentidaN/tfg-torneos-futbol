import React from 'react';

interface SkeletonProps {
    type?: 'text' | 'title' | 'card' | 'custom';
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', width, height, style, className = '' }) => {
    let baseClass = 'skeleton';
    if (type !== 'custom') {
        baseClass += ` skeleton-${type}`;
    }

    const mergedStyle = {
        ...(width && { width }),
        ...(height && { height }),
        ...style
    };

    return <div className={`${baseClass} ${className}`} style={mergedStyle} />;
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table">
            <thead>
                <tr>
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i}><Skeleton type="text" width="60%" /></th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: columns }).map((_, j) => (
                            <td key={j}><Skeleton type="text" width={j === 0 ? "30%" : "80%"} /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
    <div className="grid-3">
        {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} type="card" height={160} />
        ))}
    </div>
);
