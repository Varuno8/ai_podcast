import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Radio } from 'lucide-react';

export function TrendingRadar({ trending, playlist, setUrl, handleGenerate, addToPlaylist }) {
    return (
        <motion.div
            key="radar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-16 py-8"
        >
            {/* Header */}
            <div className="flex items-end justify-between border-b-4 border-black pb-6">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff4d00] mb-2">Content Command Center</h4>
                    <h1 className="text-6xl font-black italic tracking-tighter">TRENDING RADAR</h1>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Live Feed</p>
                    <p className="text-xl font-bold font-['Courier_Prime']">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Trending Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {trending.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white border border-black/5 p-8 shadow-[20px_20px_0_rgba(0,0,0,0.02)] hover:shadow-[30px_30px_0_rgba(255,77,0,0.05)] transition-all group flex flex-col h-[500px]"
                    >
                        <div className="mb-6 flex justify-between items-start">
                            <span className="bg-black text-[9px] font-black text-white px-3 py-1.5 uppercase tracking-[0.2em]">{item.source}</span>
                            {item.image ? (
                                <div className="w-16 h-16 border border-black/10 overflow-hidden bg-black/5">
                                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 border border-black/5 bg-[#f4f1ea] flex items-center justify-center">
                                    <Newspaper className="w-6 h-6 text-black/20" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <h3 className="text-2xl font-black leading-tight tracking-tighter hover:text-[#ff4d00] transition-colors line-clamp-3 italic uppercase" title={item.title}>
                                {item.title}
                            </h3>
                            <div className="h-1 w-12 bg-black/10 group-hover:w-20 group-hover:bg-[#ff4d00] transition-all duration-500" />
                            <p className="text-sm text-black/50 font-medium leading-relaxed line-clamp-4">{item.summary.replace(/<[^>]*>?/gm, '')}</p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setUrl(item.url); handleGenerate(); }}
                                className="flex-1 bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] relative overflow-hidden group/btn"
                            >
                                <span className="relative z-10">Broadcast</span>
                                <div className="absolute inset-0 bg-[#ff4d00] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={() => addToPlaylist(item)}
                                className="w-14 h-14 border border-black/10 flex items-center justify-center hover:bg-[#ff4d00]/5 hover:border-[#ff4d00] text-[#ff4d00] transition-all"
                                title="Listen Later"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Listen Later Queue */}
            {playlist.length > 0 && (
                <div className="pt-12 border-t border-black/10">
                    <h2 className="text-3xl font-black italic mb-8">LISTEN LATER QUEUE</h2>
                    <div className="space-y-4">
                        {playlist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-4 border border-black/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-[#ff4d00] rounded-full" />
                                    <div>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-[10px] uppercase tracking-widest text-black/40">{item.source} • {item.url}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setUrl(item.url); handleGenerate(); }}
                                    className="px-6 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                                >
                                    Synth Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Studio Talent */}
            <div className="pt-12">
                <div className="flex items-center gap-4 border-b border-black/10 pb-4 mb-6">
                    <Radio className="w-4 h-4 text-[#ff4d00]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Studio Talent</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Joe Rogan', img: '/images/joe_rogan.jpeg', role: 'EXPERT COMMENTARY' },
                        { name: 'Raj Shamani', img: '/images/raj_shamani.jpeg', role: 'INSIGHT LEAD' },
                        { name: 'Prakhar Gupta', img: '/images/prakhar_gupta.jpg', role: 'PHILOSOPHY HEAD' }
                    ].map((host, i) => (
                        <motion.div
                            key={host.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            whileHover={{ y: -10 }}
                            className="bg-white p-6 pb-10 shadow-[15px_15px_0_rgba(0,0,0,0.03)] border border-black/5 group cursor-default flex flex-col items-center text-center"
                        >
                            <div className="relative w-full aspect-square overflow-hidden mb-8 border-4 border-black/5 shadow-inner">
                                <img
                                    src={host.img}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                                    alt={host.name}
                                />
                                <div className="absolute inset-0 bg-[#ff4d00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">{host.name}</h4>
                            <div className="h-[2px] w-12 bg-[#ff4d00]/20 mb-4 group-hover:w-24 transition-all duration-500" />
                            <p className="text-[10px] font-black text-[#ff4d00] tracking-[0.3em] uppercase">{host.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
