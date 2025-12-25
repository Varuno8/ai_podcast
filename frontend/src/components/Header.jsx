import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

export function Header({ url, setUrl, inputMode, setInputMode, manualScript, setManualScript, loading, handleGenerate }) {
    return (
        <header className="h-auto min-h-[96px] py-4 px-12 flex items-center justify-between border-b border-black/10 z-10 bg-[#f4f1ea]/80 backdrop-blur-xl sticky top-0">
            <div className="flex flex-col gap-4 w-full max-w-3xl">
                <div className="flex gap-4">
                    <button
                        onClick={() => setInputMode('url')}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-1 border border-black transition-all ${inputMode === 'url' ? 'bg-black text-white' : 'bg-transparent text-black/40 hover:text-black'}`}
                    >
                        URL Mode
                    </button>
                    <button
                        onClick={() => setInputMode('script')}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-1 border border-black transition-all ${inputMode === 'script' ? 'bg-black text-white' : 'bg-transparent text-black/40 hover:text-black'}`}
                    >
                        Direct Script
                    </button>
                </div>

                <div className="flex items-center gap-10 w-full">
                    <div className="flex-1 relative group">
                        {inputMode === 'url' ? (
                            <input
                                type="text"
                                placeholder="READY TO BROADCAST? PASTE URL..."
                                className="w-full bg-transparent border-b-2 border-black/20 px-4 py-3 text-sm font-black tracking-[0.2em] focus:outline-none focus:border-[#ff4d00] transition-all uppercase placeholder:text-black/20"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        ) : (
                            <textarea
                                placeholder="PASTE YOUR SCRIPT HERE (Host 1: ... Host 2: ...)"
                                className="w-full bg-transparent border-b-2 border-black/20 px-4 py-2 text-xs font-bold tracking-wider focus:outline-none focus:border-[#ff4d00] transition-all min-h-[40px] max-h-[120px] resize-y custom-scrollbar-light"
                                value={manualScript}
                                onChange={(e) => setManualScript(e.target.value)}
                            />
                        )}
                        <div className="absolute bottom-0 left-0 h-0.5 bg-[#ff4d00] w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || (inputMode === 'url' ? !url : !manualScript)}
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
