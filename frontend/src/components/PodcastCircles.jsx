import React from 'react';
import { motion } from 'framer-motion';

export function PodcastCircles() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-12 py-8"
        >
            <div className="bg-black text-white p-12">
                <h2 className="text-4xl font-black italic mb-4 uppercase">Neural Nexus Circle</h2>
                <p className="text-xs font-mono opacity-60">Members: 142 • Active Broadcasts: 3</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { user: 'Alex_N', action: 'Just generated "The Future of RISC-V"', time: '2m ago' },
                    { user: 'Sarah_Core', action: 'Pinned "Stable Diffusion 3.5 Overview"', time: '15m ago' },
                    { user: 'Broadcaster_99', action: 'Live Reacting to "NVIDIA Earnings"', time: 'Live' }
                ].map((activity, i) => (
                    <div key={i} className="bg-white border border-black/5 p-6 flex items-center justify-between group hover:border-[#ff4d00] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#f4f1ea] rounded-full flex items-center justify-center font-black text-[#ff4d00]">{activity.user[0]}</div>
                            <div>
                                <p className="text-sm font-bold">{activity.user}</p>
                                <p className="text-[10px] text-black/40 uppercase font-black">{activity.action}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-[#ff4d00]">{activity.time}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
