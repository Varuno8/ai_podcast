import React from 'react';
import { motion } from 'framer-motion';

export function TalkingHead({ image, isSpeaking, volume, name }) {
    // Basic "talking" animation: scaling based on volume if speaking
    const scale = isSpeaking ? 1 + (volume / 255) * 0.2 : 1;

    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                {/* Glow ring based on volume */}
                {isSpeaking && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-[#ff4d00]/30 blur-xl"
                        animate={{ scale: 1 + (volume / 255) * 0.5 }}
                    />
                )}

                <motion.img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                    animate={{ scale }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            </div>
            <motion.p
                className={`mt-4 font-black uppercase tracking-widest text-xs ${isSpeaking ? 'text-[#ff4d00]' : 'text-black/50'}`}
                animate={{ opacity: isSpeaking ? 1 : 0.7 }}
            >
                {name}
            </motion.p>
        </div>
    );
}
