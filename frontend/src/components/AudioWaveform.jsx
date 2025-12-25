import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function AudioWaveform({ volume, isSpeaking }) {
    const [time, setTime] = useState(0);

    // Continuous movement ticker
    useEffect(() => {
        let frame;
        const tick = () => {
            setTime(t => t + 0.05);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    const intensity = Math.min(volume / 50, 2);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
                viewBox="0 0 800 200"
                preserveAspectRatio="none"
                className="w-full h-40"
            >
                <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 77, 0, 0)" />
                        <stop offset="50%" stopColor="rgba(255, 77, 0, 0.4)" />
                        <stop offset="100%" stopColor="rgba(255, 77, 0, 0)" />
                    </linearGradient>
                </defs>

                {/* Background "Ghost" Wave */}
                <WaveLayer
                    time={time}
                    amplitude={15 + intensity * 20}
                    frequency={0.01}
                    speed={0.8}
                    offset={0}
                    opacity={0.2}
                />

                {/* Mid Layer Wave */}
                <WaveLayer
                    time={time}
                    amplitude={10 + intensity * 40}
                    frequency={0.02}
                    speed={1.2}
                    offset={Math.PI}
                    opacity={0.4}
                />

                {/* Primary Sharp Wave */}
                <WaveLayer
                    time={time}
                    amplitude={5 + intensity * 60}
                    frequency={0.03}
                    speed={2}
                    offset={Math.PI / 2}
                    opacity={0.6}
                    strokeWidth={2}
                />
            </svg>
        </div>
    );
}

function WaveLayer({ time, amplitude, frequency, speed, offset, opacity, strokeWidth = 1 }) {
    const points = 100;
    const width = 800;
    const middle = 100;

    const generatePath = () => {
        const path = [];
        for (let i = 0; i <= points; i++) {
            const x = (i / points) * width;
            // The magic formula: Sine(dist) * Envelope(dist) * Time
            // Envelope ensures it tapers at the ends
            const envelope = Math.sin((i / points) * Math.PI);
            const y = middle + Math.sin(i * frequency * 50 + time * speed + offset) * amplitude * envelope;
            path.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }
        return path.join(' ');
    };

    return (
        <path
            d={generatePath()}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ opacity, transition: 'd 0.1s linear' }}
        />
    );
}
