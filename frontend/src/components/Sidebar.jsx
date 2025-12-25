import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Mic2, Settings, Sliders, Volume2, Upload, Trash2 } from 'lucide-react';
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
    adPosition,
    setAdPosition,
    adAudioBlob,
    setAdAudioBlob,
    improv,
    setImprov,
    isRecording,
    recordingTarget,
    startRecording,
    stopRecording,
    audioBlob,
    history,
    handleHistoryView,
    viewHistory
}) {
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAdAudioBlob(file);
            setInsertAd(true);
        }
    };

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
                    </div>

                    {/* Ad Configuration Section */}
                    <div className="pt-6 border-t border-black/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Ad Break Config</label>
                            <div
                                onClick={() => setInsertAd(!insertAd)}
                                className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${insertAd ? 'bg-[#ff4d00]' : 'bg-black/10'}`}
                            >
                                <motion.div
                                    animate={{ x: insertAd ? 16 : 0 }}
                                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {insertAd && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-black/40">
                                            <span>Position (Est.)</span>
                                            <span>
                                                {(() => {
                                                    const estTotal = depth === 'summary' ? 300 : 1200;
                                                    const seconds = Math.floor(estTotal * (adPosition / 100));
                                                    const mins = Math.floor(seconds / 60);
                                                    const secs = seconds % 60;
                                                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                                                })()}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="95"
                                            value={adPosition}
                                            onChange={(e) => setAdPosition(parseInt(e.target.value))}
                                            className="w-full accent-[#ff4d00] h-1 bg-black/5 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-black/40">Ad Audio</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => isRecording && recordingTarget === 'ad' ? stopRecording() : startRecording('ad')}
                                                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest transition-all border ${isRecording && recordingTarget === 'ad'
                                                    ? 'bg-[#ff4d00] text-white animate-pulse border-[#ff4d00]'
                                                    : adAudioBlob ? 'bg-white text-black border-black/10' : 'bg-black text-white border-black'
                                                    }`}
                                            >
                                                {isRecording && recordingTarget === 'ad' ? 'Stop' : adAudioBlob ? 'Re-Record' : 'Record Ad'}
                                            </button>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3 py-2 border border-black/10 bg-white hover:bg-black hover:text-white transition-all"
                                                title="Upload Ad MP3"
                                            >
                                                <Upload className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="audio/*"
                                                onChange={handleFileUpload}
                                            />
                                            {adAudioBlob && (
                                                <button
                                                    onClick={() => setAdAudioBlob(null)}
                                                    className="px-3 py-2 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        {adAudioBlob && (
                                            <p className="text-[8px] text-center text-green-600 font-bold uppercase tracking-widest">
                                                Custom Ad Loaded ✓
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
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

                    {/* Studio Mic / Voice Mashup */}
                    <div className="pt-6 border-t border-black/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00]">Intro Recording</label>
                            <Mic2 className="w-3 h-3 text-[#ff4d00]" />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => isRecording && recordingTarget === 'intro' ? stopRecording() : startRecording('intro')}
                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all border ${isRecording && recordingTarget === 'intro'
                                    ? 'bg-[#ff4d00] text-white animate-pulse border-[#ff4d00]'
                                    : audioBlob ? 'bg-white text-black border-black/10' : 'bg-black text-white border-black'
                                    }`}
                            >
                                {isRecording && recordingTarget === 'intro' ? 'Stop' : audioBlob ? 'Re-Record Intro' : 'Record Intro'}
                            </button>
                        </div>

                        {audioBlob && (
                            <div className="text-[8px] text-center font-black uppercase text-green-600 tracking-widest">
                                Intro Segment Ready ✓
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
                                <p className="text-xs font-bold truncate italic leading-tight">
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
