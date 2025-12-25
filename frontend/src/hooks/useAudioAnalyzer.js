import { useState, useEffect, useRef } from 'react';

export function useAudioAnalyzer(audioElement) {
    const [audioData, setAudioData] = useState(0);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!audioElement) return;

        // Initialize Audio Context interaction on first user play typically, 
        // but here we set it up. Browser auto-play policies might require a Resume.
        const audio = audioElement;

        const setupAnalyzer = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;

                try {
                    sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                } catch (e) {
                    // Already connected or error
                    console.warn("Audio Context connection issue:", e);
                }
            }
        };

        const animate = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average volume
            const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
            setAudioData(average);

            animationRef.current = requestAnimationFrame(animate);
        };

        const handlePlay = () => {
            setupAnalyzer();
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
            animate();
        };

        const handlePause = () => {
            cancelAnimationFrame(animationRef.current);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
            cancelAnimationFrame(animationRef.current);
            // Ideally close context if component unmounts, but usually fine to keep for SPA
        };
    }, [audioElement]);

    return audioData;
}
