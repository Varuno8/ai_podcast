import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils'; // Assuming we move cn to a utility or keep it inline, but better to extract

export function Header({ url, setUrl, loading, handleGenerate }) {
    return (
        <header className="h-24 px-12 flex items-center justify-between border-b border-black/10 z-10 bg-[#f4f1ea]/80 backdrop-blur-xl sticky top-0">
            <div className="flex items-center gap-10 w-full max-w-3xl">
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        placeholder="READY TO BROADCAST? PASTE URL..."
                        className="w-full bg-transparent border-b-2 border-black/20 px-4 py-3 text-sm font-black tracking-[0.2em] focus:outline-none focus:border-[#ff4d00] transition-all uppercase placeholder:text-black/20"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 bg-[#ff4d00] w-0 group-focus-within:w-full transition-all duration-500" />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !url}
                    className={cn(
                        "h-14 px-16 font-black text-xs tracking-[0.4em] uppercase transition-all relative overflow-hidden",
                        loading
                            ? "bg-black/5 text-black/20 cursor-not-allowed"
                            : "bg-black text-white hover:bg-[#ff4d00]"
                    )}
                >
                    <span className="relative z-10">{loading ? "PROCESSING..." : "LAUNCH"}</span>
                </button>
            </div>

            <div className="flex items-center gap-8 pl-10 border-l border-black/10 h-10">
                <div className="flex -space-x-3">
                    {[
                        { name: 'Joe Rogan', img: '/images/joe_rogan.jpeg' },
                        { name: 'Raj Shamani', img: '/images/raj_shamani.jpeg' },
                        { name: 'Prakhar Gupta', img: '/images/prakhar_gupta.jpg' }
                    ].map((host, i) => (
                        <motion.img
                            key={host.name}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            src={host.img}
                            className="w-12 h-12 rounded-full object-cover border-4 border-[#f4f1ea] grayscale hover:grayscale-0 hover:z-20 hover:scale-125 transition-all shadow-xl cursor-help"
                            title={host.name}
                        />
                    ))}
                </div>
            </div>
        </header>
    );
}
