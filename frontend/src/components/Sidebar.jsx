import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Mic2, Settings } from 'lucide-react';
import { cn } from '../utils';

export function Sidebar({
    setCurrentResult,
    setViewHistory,
    setUrl,
    persona,
    setPersona,
    depth,
    setDepth,
    guestUrl,
    setGuestUrl,
    insertAd,
    setInsertAd,
    improv,
    setImprov,
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    history,
    handleHistoryView,
    viewHistory
}) {
    return (
        <aside className="w-80 border-r border-black/10 flex flex-col z-20 bg-[#f4f1ea]">
            <div className="p-8 border-b border-black/10">
                <button
                    onClick={() => {
                        setCurrentResult(null);
                        setViewHistory(null);
                        setUrl('');
                    }}
                    className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left"
                >
                    <Radio className="text-[#ff4d00] w-6 h-6" />
                    <h1 className="text-xl font-black uppercase tracking-[0.2em] italic">
                        PodMaster <span className="text-[#ff4d00]">HQ</span>
                    </h1>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-light px-6 py-8 space-y-8">

                {/* Controls Section */}
                <div className="space-y-6 border-b border-black/10 pb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Studio Controls</h2>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Host Persona</label>
                        <select
                            value={persona}
                            onChange={(e) => setPersona(e.target.value)}
                            className="w-full bg-white border border-black/10 p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#ff4d00]"
                        >
                            <option value="investigator">The Investigator (Serious)</option>
                            <option value="comedian">The Comedian (Funny)</option>
                            <option value="friend">The Friend (Casual)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Content Depth</label>
                        <select
                            value={depth}
                            onChange={(e) => setDepth(e.target.value)}
                            className="w-full bg-white border border-black/10 p-2 text-xs font-bold uppercase focus:outline-none focus:border-[#ff4d00]"
                        >
                            <option value="summary">5-Min Summary</option>
                            <option value="deep_dive">20-Min Deep Dive</option>
                        </select>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Guest URL (Wiki / Profile)</label>
                        <input
                            type="text"
                            value={guestUrl}
                            onChange={(e) => setGuestUrl(e.target.value)}
                            placeholder="LinkedIn/Article URL"
                            className="w-full bg-white border border-black/10 p-2 text-xs font-bold focus:outline-none focus:border-[#ff4d00] font-['Courier_Prime']"
                        />
                        <p className="text-[8px] italic text-black/40">Synthesizes guest persona from URL.</p>
                    </div>

                    <div className="flex flex-col gap-4 pt-2">
                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => setInsertAd(!insertAd)}
                                className={`w-4 h-4 border border-black cursor-pointer flex items-center justify-center ${insertAd ? 'bg-[#ff4d00]' : 'bg-white'}`}
                            >
                                {insertAd && <div className="w-2 h-2 bg-white" />}
                            </div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/60 select-none cursor-pointer" onClick={() => setInsertAd(!insertAd)}>
                                Insert Ad Break
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => setImprov(!improv)}
                                className={`w-4 h-4 border border-black cursor-pointer flex items-center justify-center ${improv ? 'bg-[#ff4d00]' : 'bg-white'}`}
                            >
                                {improv && <div className="w-2 h-2 bg-white" />}
                            </div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/60 select-none cursor-pointer" onClick={() => setImprov(!improv)}>
                                Script Improv Mode
                            </label>
                        </div>
                    </div>

                    {/* Studio Mic / Voice Mashup */}
                    <div className="pt-6 border-t border-black/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Voice Mashup</label>
                            <Mic2 className="w-3 h-3 text-[#ff4d00]" />
                        </div>

                        <div className="flex gap-2">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className={`flex-1 ${audioBlob ? 'bg-white border-black/10 text-black' : 'bg-black text-white'} py-2 text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-all border`}
                                >
                                    {audioBlob ? 'Re-Record' : 'Record Intro'}
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="flex-1 bg-[#ff4d00] text-white py-2 text-[9px] font-black uppercase tracking-widest animate-pulse"
                                >
                                    Stop Recording
                                </button>
                            )}
                        </div>

                        {audioBlob && (
                            <div className="text-xs text-center font-mono text-black/60">
                                Intro Ready ✓
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 border-b border-black/10 pb-2 mb-4">
                        Archives & Files
                    </h2>
                    <div className="space-y-2">
                        {history.map((entry) => (
                            <motion.button
                                key={entry.id}
                                whileHover={{ x: 5 }}
                                onClick={() => handleHistoryView(entry.id)}
                                className={cn(
                                    "w-full text-left p-4 transition-all border border-black/5 group relative overflow-hidden",
                                    viewHistory?.id === entry.id ? "bg-black text-white shadow-xl" : "hover:bg-white hover:shadow-md"
                                )}
                            >
                                <p className={cn(
                                    "text-[8px] font-black uppercase tracking-widest mb-1",
                                    viewHistory?.id === entry.id ? "text-[#ff4d00]" : "text-[#ff4d00]"
                                )}>Entry_{entry.id.split('_').pop()}</p>
                                <p className="text-xs font-bold truncate italic">
                                    {entry.url.split('/').pop().substring(0, 30) || 'UNTITLED_LOG'}
                                </p>
                                {viewHistory?.id === entry.id && (
                                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4d00]" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

        </aside>
    );
}
