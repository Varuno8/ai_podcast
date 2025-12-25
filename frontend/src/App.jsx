import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  History,
  Settings,
  Play,
  Download,
  Globe,
  Mic2,
  FileText,
  Radio,
  Newspaper,
  Loader2,
  Volume2,
  ChevronRight,
  Monitor
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function App() {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const [keys, setKeys] = useState({
    crawlbase: localStorage.getItem('crawlbase_key') || '',
    cerebras: localStorage.getItem('cerebras_key') || '',
    cartesia: localStorage.getItem('cartesia_key') || ''
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistory(res.data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setStatus("TRANSMITTING...");
    setViewHistory(null);
    setCurrentResult(null);

    try {
      const res = await axios.post(`${API_BASE}/api/generate`, {
        url,
        crawlbase_key: keys.crawlbase,
        cerebras_key: keys.cerebras,
        cartesia_key: keys.cartesia
      });
      setCurrentResult(res.data);
      fetchHistory();
    } catch (e) {
      console.error(e);
      setStatus("SIGNAL LOST");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const handleHistoryView = async (id) => {
    setLoading(true);
    setStatus("RETRIEVING ARCHIVE...");
    try {
      const res = await axios.get(`${API_BASE}/api/history/${id}`);
      setViewHistory(res.data);
      setCurrentResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const handleGenerateFromHistory = async () => {
    if (!viewHistory?.script) return;
    setLoading(true);
    setStatus("SYNTHESIZING AUDIO...");
    try {
      const res = await axios.post(`${API_BASE}/api/generate-from-history`, {
        script: viewHistory.script,
        url: viewHistory.url,
        cartesia_key: keys.cartesia
      });
      setViewHistory({ ...viewHistory, audio_url: res.data.audio_url });
      fetchHistory();
    } catch (e) {
      console.error(e);
      setStatus("SYNTHESIS FAILED");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const saveKeys = () => {
    localStorage.setItem('crawlbase_key', keys.crawlbase);
    localStorage.setItem('cerebras_key', keys.cerebras);
    localStorage.setItem('cartesia_key', keys.cartesia);
    setShowConfig(false);
  };

  const downloadAudio = async (audioUrl) => {
    if (!audioUrl) return;
    try {
      const response = await axios.get(`${API_BASE}${audioUrl}`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'podcast_master.mp3');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      window.open(`${API_BASE}${audioUrl}`, '_blank');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f1ea] text-black font-['Playfair_Display'] selection:bg-orange-200 overflow-hidden">

      {/* Editorial Sidebar */}
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
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 border-b border-black/10 pb-2">
              Archives & Files
            </h2>
            <div className="space-y-1">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleHistoryView(entry.id)}
                  className={cn(
                    "w-full text-left p-3 transition-all border-b border-black/5 group",
                    viewHistory?.id === entry.id ? "bg-black/5 border-black/20" : "hover:bg-black/5"
                  )}
                >
                  <p className="text-[9px] font-black text-[#ff4d00] uppercase tracking-widest mb-1">Entry_{entry.id.split('_').pop()}</p>
                  <p className="text-sm font-bold truncate italic">
                    {entry.url.split('/').pop().substring(0, 30) || 'UNTITLED_LOG'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-black/10">
          <button
            onClick={() => setShowConfig(true)}
            className="w-full flex items-center gap-3 p-4 border border-black/20 hover:border-black transition-all bg-white shadow-sm"
          >
            <Settings className="w-4 h-4 text-[#ff4d00]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative">

        {/* News Bar Header */}
        <header className="h-24 px-12 flex items-center justify-between border-b border-black/10 z-10 bg-[#f4f1ea]/90 backdrop-blur-md">
          <div className="flex items-center gap-8 w-full max-w-2xl">
            <input
              type="text"
              placeholder="INPUT SOURCE URL HERE..."
              className="flex-1 bg-white border border-black/20 px-8 py-4 text-xs font-bold tracking-widest focus:outline-none focus:border-[#ff4d00] transition-all uppercase"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !url}
              className={cn(
                "h-14 px-12 font-black text-xs tracking-[0.3em] uppercase transition-all shadow-md active:scale-95",
                loading
                  ? "bg-black/10 text-black/20 border border-black/5"
                  : "bg-[#ff4d00] text-white hover:bg-black"
              )}
            >
              {loading ? "PROCESSING" : "LAUNCH"}
            </button>
          </div>

          <div className="flex items-center gap-6 pl-8 border-l border-black/10">
            <div className="flex gap-4">
              {[
                { name: 'Rogan', img: '/images/joe_rogan.jpeg' },
                { name: 'Shamani', img: '/images/raj_shamani.jpeg' },
                { name: 'Prakhar', img: '/images/prakhar_gupta.jpg' }
              ].map((host) => (
                <img key={host.name} src={host.img} className="w-10 h-10 border border-black/20 grayscale hover:grayscale-0 transition-all object-cover" title={host.name} />
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-16 custom-scrollbar-light relative">

          <AnimatePresence mode="wait">
            {!currentResult && !viewHistory && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-16 py-12"
              >
                <div className="text-center space-y-8">
                  <div className="w-24 h-24 bg-[#ff4d00]/5 border border-[#ff4d00]/20 flex items-center justify-center mx-auto mb-10">
                    <Newspaper className="w-12 h-12 text-[#ff4d00]" />
                  </div>
                  <h1 className="text-7xl font-black italic tracking-tighter leading-none">
                    TRANSFORMING <br /> INFORMATION.
                  </h1>
                  <p className="text-lg font-medium text-black/60 max-w-md mx-auto leading-relaxed">
                    A premium editorial tool for converting digital artifacts into high-production podcast scripts.
                  </p>
                </div>

                {/* Creative Studio Talent Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-black/10 pb-4">
                    <Radio className="w-4 h-4 text-[#ff4d00]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Available Studio Talent</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { name: 'Joe Rogan', img: '/images/joe_rogan.jpeg', role: 'EXPERT COMMENTARY' },
                      { name: 'Raj Shamani', img: '/images/raj_shamani.jpeg', role: 'INSIGHT LEAD' },
                      { name: 'Prakhar Gupta', img: '/images/prakhar_gupta.jpg', role: 'PHILOSOPHY HEAD' }
                    ].map((host, i) => (
                      <motion.div
                        key={host.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="bg-white p-4 pb-8 shadow-[10px_10px_0_rgba(0,0,0,0.05)] border border-black/5 group cursor-default"
                      >
                        <div className="relative aspect-square overflow-hidden mb-4 border border-black/10">
                          <img
                            src={host.img}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                          />
                          <div className="absolute inset-0 bg-[#ff4d00]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-xl font-black italic mb-1">{host.name}</h4>
                        <p className="text-[9px] font-black text-[#ff4d00] tracking-widest uppercase">{host.role}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-10 border border-black/10 bg-white">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">ENGINE MODE</h4>
                    <p className="text-2xl font-black italic">BROADCAST MASTER 2.0</p>
                  </div>
                  <div className="p-10 border border-black/10 bg-white">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">STATUS</h4>
                    <p className="text-2xl font-black italic text-[#ff4d00]">STATION_READY</p>
                  </div>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#f4f1ea]/95 backdrop-blur-sm z-50 text-center space-y-10"
              >
                <div className="relative">
                  <Monitor className="w-20 h-20 text-black animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-[#ff4d00] animate-ping" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter">{status}</h2>
                  <p className="text-[10px] font-black tracking-[0.5em] text-black/40">Neural Synthesis in Progress</p>
                </div>
              </motion.div>
            )}

            {(currentResult || viewHistory) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-24 pb-32"
              >
                {/* Script Manuscript */}
                <div className="bg-white border border-black/10 p-16 shadow-[20px_20px_0_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between mb-20 border-b-4 border-black pb-8">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ff4d00]">The Manuscript</h4>
                      <h2 className="text-5xl font-black italic">Production Script</h2>
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

                  <div className="space-y-16">
                    {(currentResult?.script || viewHistory?.script)?.split('\n').map((line, i) => {
                      const isH1 = line.startsWith('Host 1:');
                      const isH2 = line.startsWith('Host 2:');
                      if (!isH1 && !isH2) return null;

                      return (
                        <div key={i} className="space-y-6">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "px-4 py-1.5 border-2 text-[11px] font-black uppercase tracking-widest",
                              isH1 ? "border-black text-black" : "border-[#ff4d00] text-[#ff4d00]"
                            )}>
                              {isH1 ? 'SPEAKER_01' : 'SPEAKER_02'}
                            </div>
                            <div className="h-[1px] flex-1 bg-black/10" />
                          </div>
                          <p className="text-2xl font-medium leading-[1.6] italic px-4">
                            {line.replace(/^Host [12]:/, '').trim()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Media Board */}
                <div className="grid grid-cols-12 gap-12">
                  <div className="col-span-12 lg:col-span-7 bg-white border border-black/10 p-12 space-y-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Audio Environment</h4>
                      <Volume2 className="w-4 h-4 text-[#ff4d00]" />
                    </div>
                    <div className="h-40 bg-black flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="flex items-end gap-1 h-12 w-48 mb-4">
                        {[...Array(20)].map((_, i) => (
                          <motion.div key={i} animate={{ height: ['20%', '80%', '40%', '100%', '30%'] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }} className="flex-1 bg-white/20" />
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (viewHistory && !viewHistory.audio_url) {
                            handleGenerateFromHistory();
                          }
                        }}
                        className="absolute w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <Play className="w-6 h-6 fill-black ml-1" />
                      </motion.button>
                    </div>
                    {(currentResult?.audio_url || viewHistory?.audio_url) && (
                      <audio
                        controls
                        className="w-full h-10 border border-black/10"
                        src={API_BASE + (currentResult?.audio_url || viewHistory?.audio_url)}
                      />
                    )}
                    {(currentResult?.audio_url || viewHistory?.audio_url) ? (
                      <button
                        onClick={() => downloadAudio(currentResult?.audio_url || viewHistory?.audio_url)}
                        className="w-full py-5 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#ff4d00] transition-all"
                      >
                        Export Broadcast File
                      </button>
                    ) : (
                      <button
                        onClick={handleGenerateFromHistory}
                        className="w-full py-5 bg-[#ff4d00] text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Forge Audio Master
                      </button>
                    )}
                  </div>

                  <div className="col-span-12 lg:col-span-5 bg-[#ff4d00] p-12 flex flex-col justify-between text-white shadow-[15px_15px_0_rgba(0,0,0,0.1)]">
                    <div className="space-y-8">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.5em] border-b border-white/20 pb-4">Telemetric Logs</h4>
                      <div className="space-y-4 font-['Courier_Prime'] text-xs font-bold uppercase">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span>ORIGIN:</span>
                          <span className="truncate max-w-[100px]">{new URL(currentResult?.url || viewHistory?.url || 'http://void').hostname}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span>SIZE:</span>
                          <span>{(currentResult?.content || viewHistory?.content)?.length || 0} CH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>MODULE:</span>
                          <span>PS_TRANSMIT</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-12">
                      <p className="text-[10px] font-black leading-relaxed opacity-60">
                        BROADCAST MASTER SUITE <br /> © 2024 PODMASTER AI SYSTEM.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl bg-[#f4f1ea] border-4 border-black p-16 shadow-[40px_40px_0_rgba(0,0,0,0.2)]"
            >
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-10 pb-6 border-b-2 border-black">Configuration</h2>

              <div className="space-y-10">
                {['crawlbase', 'cerebras', 'cartesia'].map((key) => (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">{key} connection</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-black/20 focus:border-[#ff4d00] py-4 px-6 text-sm font-['Courier_Prime'] font-bold focus:outline-none transition-all uppercase"
                      value={keys[key]}
                      onChange={(e) => setKeys({ ...keys, [key]: e.target.value })}
                      placeholder="••••••••••••••••"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-8 mt-16 pt-8 border-t border-black/10">
                <button onClick={() => setShowConfig(false)} className="font-black text-[10px] uppercase tracking-widest text-black/40 hover:text-black">Discard</button>
                <button onClick={saveKeys} className="flex-1 py-5 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-[#ff4d00] transition-all">Link Engine</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar-light::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
