import React from 'react';
import { cn } from '@/lib/utils';

export const Loader = ({ size = 24, className }) => {
    const dotSize = Math.max(4, size / 4);

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <div
                className="bg-current rounded-full animate-bounce"
                style={{
                    width: dotSize,
                    height: dotSize,
                    animationDelay: '0ms',
                    animationDuration: '1s'
                }}
            />
            <div
                className="bg-current rounded-full animate-bounce"
                style={{
                    width: dotSize,
                    height: dotSize,
                    animationDelay: '200ms',
                    animationDuration: '1s'
                }}
            />
            <div
                className="bg-current rounded-full animate-bounce"
                style={{
                    width: dotSize,
                    height: dotSize,
                    animationDelay: '400ms',
                    animationDuration: '1s'
                }}
            />
        </div>
    );
};
