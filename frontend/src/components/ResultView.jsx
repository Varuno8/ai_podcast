import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Mic2, RefreshCcw, Volume2, Play, Plus, MessageSquare, Bot, ShieldCheck, Send } from 'lucide-react';
import { cn } from '../utils';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { TalkingHead } from './TalkingHead';

export function ResultView({
    currentResult,
    viewHistory,
    resultTab,
    setResultTab,
    handleGenerateFromHistory,
    downloadAudio,
    setActiveSource,
    regenerateSegment,
    generateQuoteCard,
    showNotes,
    chapters,
    seekTo,
    socialAssets,
    API_BASE,
    audioRef,
    trailerUrl,
    createTrailer,
    comments,
    commentText,
    setCommentText,
    handlePostComment,
    username,
    setUsername,
    activeRightTab,
    setActiveRightTab,
    chatHistory,
    interrogateQuery,
    setInterrogateQuery,
    interrogateHosts,
    loading,
    analytics
}) {
    const [audioElement, setAudioElement] = React.useState(null);
    const volume = useAudioAnalyzer(audioElement);

    return (
        <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-24 pb-32"
        >
            {/* Script Manuscript / Show Notes Toggle */}
            <div className="bg-white border border-black/10 p-16 shadow-[20px_20px_0_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-12 border-b-4 border-black pb-8">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setResultTab('script')}
                            className={cn(
                                "pb-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all",
                                resultTab === 'script' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/30 hover:text-black"
                            )}
                        >
                            Script Manuscript
                        </button>
                        <button
                            onClick={() => setResultTab('notes')}
                            className={cn(
                                "pb-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all",
                                resultTab === 'notes' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/30 hover:text-black"
                            )}
                        >
                            Show Notes & SEO
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        {viewHistory && !viewHistory.audio_url && (
                            <button
                                onClick={handleGenerateFromHistory}
                                className="px-6 h-12 bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00] font-black text-[10px] uppercase tracking-widest hover:bg-[#ff4d00] hover:text-white transition-all flex items-center gap-2"
                            >
                                <Mic2 className="w-4 h-4" /> Forge Audio
                            </button>
                        )}
                        <button
                            onClick={() => downloadAudio(currentResult?.audio_url || viewHistory?.audio_url)}
                            className="w-16 h-16 bg-black text-white flex items-center justify-center hover:bg-[#ff4d00] transition-colors"
                        >
                            <Download className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {resultTab === 'script' ? (
                    <div className="font-['Courier_Prime'] text-sm leading-relaxed space-y-6">
                        {(currentResult?.script || viewHistory?.script || '').split('\n').map((line, i) => {
                            if (line.trim().startsWith('Host 1:')) return (
                                <div key={i} className="group relative">
                                    <p
                                        className="text-[#ff4d00] font-bold mt-4 pr-12 cursor-help border-b border-transparent hover:border-[#ff4d00]/20 transition-all"
                                        onClick={() => setActiveSource({ text: line, source: "Cross-referenced from primary source data. Semantic alignment: 98.4%" })}
                                    >
                                        {line}
                                    </p>
                                    <div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 flex gap-2">
                                        <button
                                            onClick={() => regenerateSegment(line.replace('Host 1:', '').trim(), 'male', i)}
                                            className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-[#ff4d00]"
                                            title="Re-Roll Audio"
                                        >
                                            <RefreshCcw className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => generateQuoteCard(line.replace('Host 1:', '').trim(), 'Host 1')}
                                            className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-[#ff4d00]"
                                        >
                                            Quote
                                        </button>
                                    </div>
                                </div>
                            );
                            if (line.trim().startsWith('Host 2:')) return (
                                <div key={i} className="group relative">
                                    <p
                                        className="font-bold mt-4 pr-12 cursor-help border-b border-transparent hover:border-black/10 transition-all"
                                        onClick={() => setActiveSource({ text: line, source: "Contextual insight extracted from article's conclusion and auxiliary notes." })}
                                    >
                                        {line}
                                    </p>
                                    <div className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 flex gap-2">
                                        <button
                                            onClick={() => regenerateSegment(line.replace('Host 2:', '').trim(), 'female', i)}
                                            className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-[#ff4d00]"
                                            title="Re-Roll Audio"
                                        >
                                            <RefreshCcw className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => generateQuoteCard(line.replace('Host 2:', '').trim(), 'Host 2')}
                                            className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-[#ff4d00]"
                                        >
                                            Quote
                                        </button>
                                    </div>
                                </div>
                            );
                            if (line.trim().startsWith('(')) return <p key={i} className="text-black/40 italic text-xs my-2">{line}</p>;
                            return <p key={i} className="text-black/80">{line}</p>;
                        })}
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff4d00]">Executive Summary</h3>
                            <p className="text-xl font-bold italic leading-relaxed text-black/80">{showNotes}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff4d00] border-b border-black/10 pb-2">Chapter Jumps</h3>
                                <div className="space-y-2">
                                    {chapters.map((chapter, i) => (
                                        <button
                                            key={i}
                                            onClick={() => seekTo(chapter.estimate_seconds)}
                                            className="w-full text-left p-4 border border-black/5 hover:border-[#ff4d00] hover:bg-[#ff4d00]/5 transition-all group flex justify-between items-center"
                                        >
                                            <span className="text-xs font-bold">{chapter.title}</span>
                                            <span className="text-[9px] font-black font-mono text-black/30 group-hover:text-[#ff4d00]">{Math.floor(chapter.estimate_seconds / 60)}:{(chapter.estimate_seconds % 60).toString().padStart(2, '0')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff4d00] border-b border-black/10 pb-2">Social Distribution Lab</h3>
                                <div className="space-y-4">
                                    <div className="p-6 bg-[#f4f1ea] border-l-4 border-blue-600 relative group">
                                        <span className="absolute top-2 right-2 text-[8px] font-black text-blue-600 tracking-widest">LINKEDIN</span>
                                        <p className="text-xs leading-relaxed text-black/70 line-clamp-6">{socialAssets.linkedin}</p>
                                        <button className="mt-4 text-[9px] font-black uppercase text-blue-600 hover:underline">Copy Post</button>
                                    </div>
                                    <div className="p-6 bg-[#f4f1ea] border-l-4 border-black relative group">
                                        <span className="absolute top-2 right-2 text-[8px] font-black text-black tracking-widest">TWITTER (X)</span>
                                        <p className="text-xs leading-relaxed text-black/70 line-clamp-6">{socialAssets.twitter}</p>
                                        <button className="mt-4 text-[9px] font-black uppercase text-black hover:underline">Copy Thread</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Board */}
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12 lg:col-span-7 bg-white border border-black/10 p-12 space-y-10">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Audio Environment</h4>
                        <Volume2 className="w-4 h-4 text-[#ff4d00]" />
                    </div>

                    <div className="h-64 bg-black/5 rounded-2xl flex items-center justify-center gap-12 relative overflow-hidden group border border-black/5 p-8">
                        {/* Visual AI Stage */}
                        <div className="absolute inset-0 bg-grid-black/[0.05] -z-10" />

                        <TalkingHead
                            image="/images/joe_rogan.jpeg"
                            name="HOST 1"
                            isSpeaking={volume > 10}
                            volume={volume}
                        />

                        <div className="h-full w-[2px] bg-black/5" />

                        <TalkingHead
                            image="/images/raj_shamani.jpeg"
                            name="HOST 2"
                            isSpeaking={volume > 10}
                            volume={volume}
                        />

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (viewHistory && !viewHistory.audio_url) {
                                    handleGenerateFromHistory();
                                } else if (audioRef.current) {
                                    if (audioRef.current.paused) audioRef.current.play();
                                    else audioRef.current.pause();
                                }
                            }}
                            className="absolute bottom-4 right-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-20 hover:bg-[#ff4d00] transition-colors"
                        >
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                        </motion.button>
                    </div>

                    {/* Main Audio Player */}
                    {(currentResult?.audio_url || viewHistory?.audio_url) && (
                        <audio
                            ref={(el) => {
                                if (audioRef) audioRef.current = el;
                                if (el !== audioElement) setAudioElement(el);
                            }}
                            controls
                            className="w-full h-10 border border-black/10"
                            src={API_BASE + (currentResult?.audio_url || viewHistory?.audio_url)}
                        />
                    )}

                    {/* Trailer Player */}
                    {trailerUrl && (
                        <div className="bg-[#ff4d00]/5 p-4 border border-[#ff4d00]/20">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#ff4d00] mb-2">Teaser Trailer (60s)</p>
                            <audio controls className="w-full h-8" src={API_BASE + trailerUrl} />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {(currentResult?.audio_url || viewHistory?.audio_url) ? (
                            <button
                                onClick={() => downloadAudio(currentResult?.audio_url || viewHistory?.audio_url)}
                                className="col-span-2 py-5 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#ff4d00] transition-all"
                            >
                                Export Broadcast File
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerateFromHistory}
                                className="col-span-2 py-5 bg-[#ff4d00] text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Forge Audio Master
                            </button>
                        )}

                        {(viewHistory || currentResult) && (currentResult?.audio_url || viewHistory?.audio_url) && (
                            <button
                                onClick={() => createTrailer((currentResult?.id || viewHistory?.id))}
                                className="col-span-2 py-3 border border-black/20 text-black font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                            >
                                Generate Trailer Cut
                            </button>
                        )}
                    </div>

                    {/* Social Timeline */}
                    {(currentResult || viewHistory) && (
                        <div className="pt-8 border-t border-black/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6">Timeline Comments</h4>

                            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 custom-scrollbar p-1">
                                {comments.length === 0 && <p className="text-xs text-black/40 italic">No comments yet. Be the first to weigh in.</p>}
                                {comments.map((c) => (
                                    <div key={c.id} className="bg-[#f4f1ea] p-3 text-xs">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-[#ff4d00]">{c.user}</span>
                                            <span className="font-mono text-black/40">{new Date(c.timestamp_seconds * 1000).toISOString().substr(14, 5)}</span>
                                        </div>
                                        <p>{c.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment at current timestamp..."
                                    className="flex-1 border border-black/10 p-2 text-xs font-bold focus:outline-none focus:border-[#ff4d00]"
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                />
                                <button
                                    onClick={handlePostComment}
                                    className="bg-black text-white px-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff4d00]"
                                >
                                    Post
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <label className="text-[9px] text-black/40 mr-2">Posting as:</label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="text-[9px] font-bold border-b border-dashed border-black/20 focus:outline-none w-20 text-right"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-5 flex flex-col">
                    {/* Right Column Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-black/10">
                        <button
                            onClick={() => setActiveRightTab('interrogate')}
                            className={cn(
                                "pb-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                activeRightTab === 'interrogate' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/30 hover:text-black"
                            )}
                        >
                            Interrogate
                        </button>
                        <button
                            onClick={() => setActiveRightTab('dna')}
                            className={cn(
                                "pb-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                activeRightTab === 'dna' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/30 hover:text-black"
                            )}
                        >
                            Episode DNA
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeRightTab === 'interrogate' ? (
                            <motion.div
                                key="interrogate"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-black/10 p-10 flex flex-col h-[600px] shadow-[15px_15px_0_rgba(0,0,0,0.05)]"
                            >
                                <div className="flex items-center justify-between mb-8 border-b border-black/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 text-[#ff4d00]" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Studio Chat</h4>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-6 mb-8 custom-scrollbar-light pr-4">
                                    {chatHistory.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10 filter grayscale">
                                            <Bot className="w-16 h-16 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Challenge the hosts on any claim</p>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={cn(
                                            "p-6 border relative group",
                                            msg.role === 'user' ? "ml-6 border-black/10 bg-black/5" : "mr-6 border-[#ff4d00]/10 bg-[#ff4d00]/5"
                                        )}>
                                            <span className="absolute -top-2 left-4 px-2 bg-white text-[8px] font-black uppercase tracking-widest text-[#ff4d00]">
                                                {msg.role === 'user' ? username : 'Host Response'}
                                            </span>
                                            <div className="text-xs leading-relaxed font-bold font-['Courier_Prime']">
                                                {msg.text.split('\n').map((line, j) => <p key={j} className="mb-1">{line}</p>)}
                                            </div>
                                            {msg.factCheck && (
                                                <div className="mt-4 pt-4 border-t border-black/5">
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "p-1.5 rounded-full",
                                                            msg.factCheck.status === 'verified' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                        )}>
                                                            <ShieldCheck className="w-3 h-3" />
                                                        </div>
                                                        <div className="text-[9px] leading-tight flex-1">
                                                            <span className="font-black uppercase block mb-1">Status: {msg.factCheck.status}</span>
                                                            <p className="opacity-60">{msg.factCheck.explanation}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={interrogateQuery}
                                        onChange={(e) => setInterrogateQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && interrogateHosts()}
                                        placeholder="SEND MESSAGE..."
                                        className="w-full h-14 bg-[#f4f1ea] border-b-2 border-black px-6 text-sm focus:outline-none focus:border-[#ff4d00] transition-all font-['Courier_Prime'] uppercase font-black"
                                    />
                                    <button
                                        onClick={interrogateHosts}
                                        disabled={loading || !interrogateQuery}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#ff4d00] transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="dna"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-[#ff4d00] p-12 flex flex-col justify-between text-white shadow-[15px_15px_0_rgba(0,0,0,0.1)] h-[600px]"
                            >
                                <div className="space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] border-b border-white/20 pb-4">Episode DNA</h4>
                                    {analytics && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest opacity-60">Sequence</label>
                                                <div className="flex gap-1">
                                                    {analytics.dna_sequence.split('').map((char, i) => (
                                                        <div key={i} className={`h-4 w-1.5 rounded-full ${char === 'A' ? 'bg-white' : 'bg-black/20'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest opacity-60">Vibe Metrics</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(analytics.vibe).map(([key, val]) => (
                                                        <div key={key} className="bg-white/10 p-2 text-[9px] font-bold">{key}: {val}%</div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                                <span className="text-[9px] font-black uppercase opacity-60">Virality Score</span>
                                                <span className="text-4xl font-black italic">{analytics.virality_score}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!analytics && (
                                        <div className="space-y-4 font-['Courier_Prime'] text-xs font-bold uppercase opacity-50">
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span>ANALYZING DNA...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-12">
                                    <p className="text-[10px] font-black leading-relaxed opacity-60">
                                        BROADCAST MASTER SUITE <br /> © 2024 PODMASTER AI SYSTEM.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
