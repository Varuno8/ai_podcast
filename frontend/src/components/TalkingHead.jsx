import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TalkingHead({ image, isSpeaking, volume, name }) {
    // normalized volume (0-1)
    const normVol = Math.min(volume / 180, 1);

    // Dynamic scale and tilt based on audio
    const scale = isSpeaking ? 1 + normVol * 0.15 : 1;
    const rotate = isSpeaking ? (Math.random() - 0.5) * normVol * 10 : 0;
    const brightness = isSpeaking ? 1 + normVol * 0.2 : 1;

    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 group">

                {/* Reactive Aura / Portal Effect behind the head */}
                <AnimatePresence>
                    {isSpeaking && (
                        <>
                            {/* Inner reactive ring */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 0.6 * normVol,
                                    scale: 1.2 + normVol * 0.4,
                                    boxShadow: `0 0 ${40 * normVol}px #ff4d00`
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute inset-0 rounded-full border-2 border-[#ff4d00]/40 blur-sm"
                            />
                            {/* Outer dissipating pulse */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.8],
                                    opacity: [0.3, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 rounded-full bg-[#ff4d00]/10"
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Idle "Breathing" and Audio-Reactive Floating Container */}
                <motion.div
                    animate={{
                        y: isSpeaking ? [0, -4, 0] : [0, 4, 0],
                        scale: scale,
                        rotate: rotate,
                        filter: `brightness(${brightness})`
                    }}
                    transition={{
                        y: {
                            duration: isSpeaking ? 0.15 : 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        type: 'spring',
                        stiffness: 400,
                        damping: 15
                    }}
                    className="relative w-full h-full z-10"
                >
                    {/* Headshot with circular mask */}
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Audio Wave Overlay (Visual feedback on top of image) */}
                        <AnimatePresence>
                            {isSpeaking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.2 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-t from-[#ff4d00] to-transparent pointer-events-none"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Speaking Indicator Badge */}
                    <AnimatePresence>
                        {isSpeaking && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -bottom-2 -right-2 bg-[#ff4d00] text-white p-2 rounded-full shadow-lg z-20"
                            >
                                <div className="flex gap-1 items-end h-3">
                                    {[0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [`${h * 20}%`, `${h * 100}%`, `${h * 40}%`] }}
                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            className="w-0.5 bg-white rounded-full"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Floor Shadow Ring */}
                <motion.div
                    animate={{
                        scale: isSpeaking ? 0.9 : 1.1,
                        opacity: isSpeaking ? 0.1 : 0.05
                    }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black rounded-[100%] blur-md -z-10"
                />
            </div>

            {/* Label with dynamic presence */}
            <div className="mt-8 text-center flex flex-col items-center gap-1">
                <motion.p
                    className={`font-black uppercase tracking-[0.3em] text-[10px] transition-all ${isSpeaking ? 'text-[#ff4d00]' : 'text-black/40'}`}
                    animate={{
                        letterSpacing: isSpeaking ? "0.4em" : "0.3em",
                        scale: isSpeaking ? 1.05 : 1
                    }}
                >
                    {name}
                </motion.p>
                {isSpeaking && (
                    <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: 40 }}
                        className="h-0.5 bg-[#ff4d00] rounded-full"
                    />
                )}
            </div>
        </div>
    );
}
