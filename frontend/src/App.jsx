import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TrendingRadar } from './components/TrendingRadar';
import { PodcastCircles } from './components/PodcastCircles';
import { ResultView } from './components/ResultView';
import { QuoteCardModal } from './components/QuoteCardModal';
import { SourceArtifactModal } from './components/SourceArtifactModal';
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
  Monitor,
  RefreshCcw,
  Users
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function App() {
  const [url, setUrl] = useState('');
  const [guestUrl, setGuestUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);

  // New State for Features
  const [persona, setPersona] = useState('investigator');
  const [depth, setDepth] = useState('deep_dive');
  const [insertAd, setInsertAd] = useState(false);
  const [improv, setImprov] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);


  // Dashboard State
  const [trending, setTrending] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  // Social State
  const [username, setUsername] = useState(localStorage.getItem('username') || `User_${Math.floor(Math.random() * 1000)}`);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('radar'); // radar or circles
  const [activeSource, setActiveSource] = useState(null);
  const [resultTab, setResultTab] = useState('script'); // script or notes
  const [showNotes, setShowNotes] = useState('');
  const [chapters, setChapters] = useState([]);
  const [socialAssets, setSocialAssets] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [interrogateQuery, setInterrogateQuery] = useState('');
  const [activeRightTab, setActiveRightTab] = useState('interrogate');
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('username', username);
  }, [username]);

  useEffect(() => {
    fetchHistory();
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [trendRes, playRes] = await Promise.all([
        axios.get(`${API_BASE}/api/discovery/trending`),
        axios.get(`${API_BASE}/api/playlist`)
      ]);
      setTrending(trendRes.data);
      setPlaylist(playRes.data);
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    }
  };

  const addToPlaylist = async (item) => {
    try {
      await axios.post(`${API_BASE}/api/playlist/add`, {
        url: item.url,
        title: item.title,
        source: item.source,
        summary: item.summary
      });
      fetchDashboard(); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistory(res.data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (e) {
      console.error("Mic access denied", e);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const [quoteImage, setQuoteImage] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async (id) => {
    try {
      // Mock delay for effect
      await new Promise(r => setTimeout(r, 1000));
      const res = await axios.get(`${API_BASE}/api/analytics/${id}`);
      setAnalytics(res.data);
    } catch (e) {
      console.error("Analytics fetch failed", e);
    }
  }

  const generateQuoteCard = async (text, author) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/quote`, { text, author });
      setQuoteImage(API_BASE + res.data.image_url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const regenerateSegment = async (line, voice, index) => {
    setStatus("RE-ROLLING...");
    try {
      const res = await axios.post(`${API_BASE}/api/regenerate-segment`, {
        text: line,
        voice: voice
      });
      // Play the regenerated audio immediately
      const audio = new Audio(API_BASE + res.data.audio_url);
      audio.play();
    } catch (e) {
      console.error(e);
    } finally {
      setStatus(null);
    }
  };

  const handleGenerate = async () => {
    if (!url) return;
    setLoading(true);
    setStatus("TRANSMITTING...");
    setViewHistory(null);
    setCurrentResult(null);
    setTrailerUrl(null);

    try {
      let uploadedFilename = null;

      // Upload Intro if exists
      if (audioBlob) {
        setStatus("UPLOADING INTRO...");
        const formData = new FormData();
        formData.append("file", audioBlob, "user_intro.mp3");
        const uploadRes = await axios.post(`${API_BASE}/api/upload/audio`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFilename = uploadRes.data.filename;
      }

      setStatus("GENERATING...");
      const res = await axios.post(`${API_BASE}/api/generate`, {
        url,
        persona,
        depth,
        insert_ad: insertAd,
        improv: improv,
        user_intro_file: uploadedFilename,
        guest_url: guestUrl
      });
      setCurrentResult(res.data);
      setShowNotes(res.data.show_notes || '');
      setChapters(res.data.chapters || []);
      setSocialAssets(res.data.social_assets || {});
      fetchHistory();
      fetchAnalytics(res.data.id);
    } catch (e) {
      console.error(e);
      setStatus("SIGNAL LOST");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  // ... inside handleHistoryView
  const handleHistoryView = async (id) => {
    setLoading(true);
    setStatus("RETRIEVING ARCHIVE...");
    setAnalytics(null); // Clear previous
    try {
      const res = await axios.get(`${API_BASE}/api/history/${id}`);
      setViewHistory(res.data);
      setShowNotes(res.data.show_notes || '');
      setChapters(res.data.chapters || []);
      setSocialAssets(res.data.social_assets || {});
      setCurrentResult(null);
      setTrailerUrl(null);
      if (res.data.comments) setComments(res.data.comments);
      fetchAnalytics(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  const createTrailer = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/api/trailer/${id}`);
      setTrailerUrl(res.data.audio_url);
    } catch (e) {
      console.error("Trailer generation failed", e);
    }
  };

  const fetchComments = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/history/${id}`);
      if (res.data.comments) setComments(res.data.comments);
    } catch (e) { console.error(e); }
  }

  const seekTo = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play();
    }
  };

  const handlePostComment = async () => {
    if (!commentText) return;
    const audio = audioRef.current;
    const timestamp = audio ? Math.floor(audio.currentTime) : 0;
    const activeId = currentResult?.id || viewHistory?.id;

    try {
      await axios.post(`${API_BASE}/api/comments/add`, {
        episode_id: activeId,
        username: username,
        text: commentText,
        timestamp_seconds: timestamp
      });
      setCommentText('');
      fetchComments(activeId);
    } catch (e) {
      console.error(e);
    }
  };

  const interrogateHosts = async () => {
    if (!interrogateQuery) return;
    const activeId = currentResult?.id || viewHistory?.id;
    const activeContext = currentResult?.script || viewHistory?.script;

    setLoading(true);
    setStatus("ROUTING QUERY...");

    try {
      const res = await axios.post(`${API_BASE}/api/interrogate`, {
        episode_id: activeId,
        query: interrogateQuery,
        context: activeContext
      });

      const newMessage = {
        role: 'user',
        text: interrogateQuery
      };

      const hostResponse = {
        role: 'hosts',
        text: res.data.response_text,
        factCheck: res.data.fact_check,
        audioUrl: res.data.audio_url
      };

      setChatHistory(prev => [...prev, newMessage, hostResponse]);
      setInterrogateQuery('');

      // Play response audio
      if (res.data.audio_url) {
        const audio = new Audio(API_BASE + res.data.audio_url);
        audio.play();
      }
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
        url: viewHistory.url
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
      <Sidebar
        setCurrentResult={setCurrentResult}
        setViewHistory={setViewHistory}
        setUrl={setUrl}
        persona={persona}
        setPersona={setPersona}
        depth={depth}
        setDepth={setDepth}
        guestUrl={guestUrl}
        setGuestUrl={setGuestUrl}
        insertAd={insertAd}
        setInsertAd={setInsertAd}
        improv={improv}
        setImprov={setImprov}
        isRecording={isRecording}
        audioBlob={audioBlob}
        startRecording={startRecording}
        stopRecording={stopRecording}
        history={history}
        handleHistoryView={handleHistoryView}
        viewHistory={viewHistory}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative">

        {/* News Bar Header */}
        <Header
          url={url}
          setUrl={setUrl}
          loading={loading}
          handleGenerate={handleGenerate}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-16 custom-scrollbar-light relative">

          {/* Tab Navigation */}
          {!currentResult && !viewHistory && !loading && (
            <div className="max-w-6xl mx-auto flex gap-8 mb-12 border-b border-black/10">
              <button
                onClick={() => setActiveTab('radar')}
                className={cn(
                  "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all",
                  activeTab === 'radar' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/40 hover:text-black"
                )}
              >
                Trending Radar
              </button>
              <button
                onClick={() => setActiveTab('circles')}
                className={cn(
                  "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2",
                  activeTab === 'circles' ? "text-[#ff4d00] border-b-2 border-[#ff4d00]" : "text-black/40 hover:text-black"
                )}
              >
                <Users className="w-3 h-3" /> Podcast Circles
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            {!currentResult && !viewHistory && !loading && activeTab === 'radar' && (
              <TrendingRadar
                trending={trending}
                playlist={playlist}
                setUrl={setUrl}
                handleGenerate={handleGenerate}
                addToPlaylist={addToPlaylist}
              />
            )}

            {/* Circles View */}
            {!currentResult && !viewHistory && !loading && activeTab === 'circles' && (
              <PodcastCircles />
            )}
          </AnimatePresence>

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
            <ResultView
              currentResult={currentResult}
              viewHistory={viewHistory}
              resultTab={resultTab}
              setResultTab={setResultTab}
              handleGenerateFromHistory={handleGenerateFromHistory}
              downloadAudio={downloadAudio}
              setActiveSource={setActiveSource}
              regenerateSegment={regenerateSegment}
              generateQuoteCard={generateQuoteCard}
              showNotes={showNotes}
              chapters={chapters}
              seekTo={seekTo}
              socialAssets={socialAssets}
              API_BASE={API_BASE}
              audioRef={audioRef}
              trailerUrl={trailerUrl}
              createTrailer={createTrailer}
              comments={comments}
              commentText={commentText}
              setCommentText={setCommentText}
              handlePostComment={handlePostComment}
              username={username}
              setUsername={setUsername}
              activeRightTab={activeRightTab}
              setActiveRightTab={setActiveRightTab}
              chatHistory={chatHistory}
              interrogateQuery={interrogateQuery}
              setInterrogateQuery={setInterrogateQuery}
              interrogateHosts={interrogateHosts}
              loading={loading}
              analytics={analytics}
            />
          )}
        </div>
      </main>

      <QuoteCardModal quoteImage={quoteImage} setQuoteImage={setQuoteImage} />
      <SourceArtifactModal activeSource={activeSource} setActiveSource={setActiveSource} />


      <style>{`
        .custom-scrollbar-light::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
      `}</style>
    </div >
  );
}
