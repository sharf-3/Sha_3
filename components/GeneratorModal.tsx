import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Niche, GeneratedScript } from '../types';
import { X, Wand2, Loader2, Copy, Check, Sparkles, BrainCircuit, Video, Play, Pause, Film, Scissors, Layers, PlayCircle, PauseCircle, SkipForward, Settings2, Download } from 'lucide-react';
import { generateFacelessScript, generateVideoClip } from '../services/geminiService';

interface GeneratorModalProps {
  niche: Niche;
  onClose: () => void;
}

interface ClipSettings {
  trimStart: number;
  trimEnd: number; // 0 means full duration
  transition: 'none' | 'fade';
  duration: number; // Real duration from metadata
}

const MiniVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(time);
    }
  };
  
  const formatTime = (secs: number) => {
     const m = Math.floor(secs / 60);
     const s = Math.floor(secs % 60);
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black aspect-[9/16]">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />
      
      {/* Play Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group/play"
          onClick={togglePlay}
        >
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full group-hover/play:bg-brand-500 transition-colors">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full shadow-lg pointer-events-none z-10">
          <Check className="w-3 h-3 text-black" />
      </div>

      {/* Controls Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={togglePlay} className="text-white hover:text-brand-400 shrink-0">
           {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-2.5 
            [&::-webkit-slider-thumb]:h-2.5 
            [&::-webkit-slider-thumb]:bg-brand-400 
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-webkit-slider-thumb]:transition-transform"
        />
        
        <span className="text-[9px] font-mono text-slate-300 w-6 text-right shrink-0">
           {formatTime(progress)}
        </span>
      </div>
    </div>
  );
};

export const GeneratorModal: React.FC<GeneratorModalProps> = ({ niche, onClose }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Video generation state
  const [generatingVideoIndex, setGeneratingVideoIndex] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<number, string>>({});

  // Editor / Studio State
  const [activeTab, setActiveTab] = useState<'script' | 'studio'>('script');
  const [clipSettings, setClipSettings] = useState<Record<number, ClipSettings>>({});
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const editorVideoRef = useRef<HTMLVideoElement>(null);
  const sequenceTimeoutRef = useRef<number | null>(null);

  const LOADING_STEPS = useMemo(() => [
    { text: "Analyzing viral patterns...", subtext: `Scanning top performing ${niche.title} content` },
    { text: "Crafting the hook...", subtext: "Writing the first 3 seconds to grab attention" },
    { text: "Designing visuals...", subtext: "Selecting faceless stock footage cues" },
    { text: "Writing script...", subtext: "Composing the voiceover narrative" },
    { text: "Optimizing hashtags...", subtext: "Selecting tags for maximum reach" },
  ], [niche.title]);

  const handleClose = () => {
    // Cleanup object URLs to prevent memory leaks
    Object.values(videoUrls).forEach(url => URL.revokeObjectURL(url));
    setIsClosing(true);
  };

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  useEffect(() => {
    if (isGenerating) {
      setLoadingStep(0);
      const interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => window.clearInterval(interval);
    }
  }, [isGenerating, LOADING_STEPS]);

  // Initialize clip settings when result generates
  useEffect(() => {
    if (result) {
      const initial: Record<number, ClipSettings> = {};
      result.segments.forEach((_, i) => {
        initial[i] = { trimStart: 0, trimEnd: 0, transition: 'none', duration: 0 };
      });
      setClipSettings(initial);
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setVideoUrls({});
    setActiveTab('script');
    try {
      const data = await generateFacelessScript(niche.title, topic);
      setResult(data);
    } catch (e) {
      alert('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (index: number, prompt: string) => {
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey && (window as any).aistudio.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setGeneratingVideoIndex(index);
    try {
      const videoUrl = await generateVideoClip(prompt);
      setVideoUrls(prev => ({ ...prev, [index]: videoUrl }));
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('Requested entity was not found') && (window as any).aistudio) {
        alert("API Key issue detected. Please select your API key again.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert('Failed to generate video clip. Please try again later.');
      }
    } finally {
      setGeneratingVideoIndex(null);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `TITLE: ${result.title}\n\nCAPTION: ${result.caption}\n\nSCRIPT:\n${result.segments.map(s => `[${s.duration}] Visual: ${s.visualCue}\nAudio: ${s.audioScript}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Video Editor Logic ---

  const handleMetadataLoaded = (index: number, duration: number) => {
    setClipSettings(prev => {
      // Only update if duration was 0 (not set yet)
      if (prev[index]?.duration === 0) {
        return {
          ...prev,
          [index]: { ...prev[index], duration: duration, trimEnd: duration }
        };
      }
      return prev;
    });
  };

  const playSequence = () => {
    if (!result) return;
    // Find first available video
    const firstIndex = result.segments.findIndex((_, i) => videoUrls[i]);
    if (firstIndex === -1) return;

    setCurrentSequenceIndex(firstIndex);
    setIsPlayingSequence(true);
    setIsTransitioning(false);
  };

  const stopSequence = () => {
    setIsPlayingSequence(false);
    setIsTransitioning(false);
    if (editorVideoRef.current) {
      editorVideoRef.current.pause();
    }
  };

  // Sequence Engine
  useEffect(() => {
    if (!isPlayingSequence || !editorVideoRef.current || !result) return;

    const videoEl = editorVideoRef.current;
    const settings = clipSettings[currentSequenceIndex];
    const url = videoUrls[currentSequenceIndex];

    if (!url || !settings) {
      // Skip to next if current is invalid
      const nextIndex = currentSequenceIndex + 1;
      if (nextIndex < result.segments.length) {
        setCurrentSequenceIndex(nextIndex);
      } else {
        stopSequence();
      }
      return;
    }

    // Setup current clip
    videoEl.src = url;
    videoEl.currentTime = settings.trimStart;
    
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Playback prevented:", error);
            stopSequence();
        });
    }

    // Watch for trim end
    const checkTime = () => {
      if (!isPlayingSequence) return;
      
      // Calculate effective end time
      const endTime = settings.trimEnd > 0 ? settings.trimEnd : videoEl.duration;
      
      // Transition timing (0.5s before end if fade)
      const transitionTime = settings.transition === 'fade' ? 0.5 : 0;
      
      // Check if we should start transition visual
      if (settings.transition === 'fade' && videoEl.currentTime >= endTime - transitionTime) {
        setIsTransitioning(true);
      }

      // Check if clip finished
      if (videoEl.currentTime >= endTime) {
        // Move to next
        let nextIndex = currentSequenceIndex + 1;
        // Find next available
        while(nextIndex < result.segments.length && !videoUrls[nextIndex]) {
           nextIndex++;
        }

        if (nextIndex < result.segments.length) {
          // Perform switch
          if (settings.transition === 'fade') {
             // Wait for fade out to finish visually? 
             // Since we handle isTransitioning via CSS opacity, we can just switch
             // But to be smooth, we might want to pause briefly?
             // For simplicity in this MVP, we switch immediately and reset transition state
          }
          setCurrentSequenceIndex(nextIndex);
          setIsTransitioning(false); // Reset transition for new clip fade-in (if we wanted fade in)
        } else {
          // End of sequence
          stopSequence();
        }
      } else {
        sequenceTimeoutRef.current = requestAnimationFrame(checkTime);
      }
    };

    sequenceTimeoutRef.current = requestAnimationFrame(checkTime);

    return () => {
      if (sequenceTimeoutRef.current) cancelAnimationFrame(sequenceTimeoutRef.current);
    };
  }, [currentSequenceIndex, isPlayingSequence, videoUrls]); // Intentionally omitted clipSettings to avoid restart on edit

  return (
    <div 
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-5xl bg-dark-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[90vh] overflow-hidden ${isClosing ? 'animate-zoom-out' : 'animate-slide-up'}`}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-dark-900 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Create {niche.title} Content</h2>
              <p className="text-sm text-slate-400">Powered by Gemini 2.5 & Veo</p>
            </div>
            
            {/* Tabs */}
            {!isGenerating && result && (
              <div className="flex p-1 bg-dark-800 rounded-lg border border-white/10 ml-6">
                <button
                  onClick={() => setActiveTab('script')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'script' 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" />
                  Script
                </button>
                <button
                  onClick={() => setActiveTab('studio')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'studio' 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  Studio
                  {Object.keys(videoUrls).length > 0 && (
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </button>
              </div>
            )}
          </div>
          
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden relative">
          {isGenerating ? (
             <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
               {/* Loading Visual */}
               <div className="relative">
                 <div className={`absolute inset-0 bg-gradient-to-r ${niche.gradient} opacity-20 blur-[40px] rounded-full animate-pulse`} />
                 <div className="w-24 h-24 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center relative shadow-xl overflow-hidden">
                    <div className="absolute inset-0 rounded-full border-t-2 border-brand-500 animate-spin" />
                    <div className="relative z-10 transition-all duration-500 transform">
                      {loadingStep === 0 && <BrainCircuit className="w-10 h-10 text-brand-400 animate-pulse" />}
                      {loadingStep === 1 && <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />}
                      {loadingStep >= 2 && <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />}
                    </div>
                 </div>
               </div>
               
               {/* Text Steps */}
               <div className="text-center space-y-3 max-w-sm mx-auto">
                 <h3 className="text-2xl font-bold text-white animate-slide-up" key={`text-${loadingStep}`}>
                   {LOADING_STEPS[loadingStep].text}
                 </h3>
                 <p className="text-slate-400 text-sm animate-slide-up" key={`subtext-${loadingStep}`}>
                   {LOADING_STEPS[loadingStep].subtext}
                 </p>
               </div>

               {/* Progress Indicator */}
               <div className="flex flex-col gap-4 w-64">
                 <div className="flex justify-between gap-1">
                   {LOADING_STEPS.map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= loadingStep ? 'flex-1 bg-brand-500' : 'flex-1 bg-dark-700'}`} />
                   ))}
                 </div>
               </div>
            </div>
          ) : !result ? (
            // Initial Prompt Input
            <div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    What is your video topic?
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., How to bake sourdough bread for beginners..."
                    className="w-full h-40 bg-dark-800 border border-white/10 rounded-xl p-6 text-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none shadow-inner"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white text-lg transition-all ${
                    !topic.trim()
                      ? 'bg-dark-800 text-slate-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${niche.gradient} hover:opacity-90 shadow-lg hover:shadow-brand-500/20 hover:scale-[1.02]`
                  }`}
                >
                  <Wand2 className="w-6 h-6" />
                  Generate Script
                </button>
                
                <div className="bg-brand-900/20 border border-brand-500/20 rounded-xl p-4 flex gap-4 items-start">
                  <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-brand-400 text-sm font-bold mb-1">Pro Tip</h4>
                    <p className="text-brand-100/60 text-sm">
                      Be specific with your topic for better visual cues. Gemini will create a viral hook and script structure tailored to {niche.title}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'script' ? (
            // Script View
            <div className="h-full overflow-y-auto p-6 custom-scrollbar animate-fade-in">
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Generated Strategy</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Title Idea</span>
                    <p className="mt-2 text-white font-medium">{result.title}</p>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">The Hook (0-3s)</span>
                    <p className="mt-2 text-white font-medium">{result.hook}</p>
                  </div>
                </div>

                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400">
                      <tr>
                        <th className="p-4 font-medium w-16">Time</th>
                        <th className="p-4 font-medium w-[30%]">Visual Cue</th>
                        <th className="p-4 font-medium w-[35%]">Audio Script</th>
                        <th className="p-4 font-medium w-[25%]">Preview Clip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-dark-800/50">
                      {result.segments.map((segment, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 text-brand-400 font-mono">{segment.duration}</td>
                          <td className="p-4 text-slate-300">{segment.visualCue}</td>
                          <td className="p-4 text-slate-400 italic">"{segment.audioScript}"</td>
                          <td className="p-4">
                            {videoUrls[i] ? (
                              <MiniVideoPlayer src={videoUrls[i]} />
                            ) : generatingVideoIndex === i ? (
                              <div className="flex flex-col items-center justify-center h-32 bg-black/20 rounded-lg border border-white/5 animate-pulse">
                                 <Loader2 className="w-6 h-6 text-brand-400 animate-spin mb-2" />
                                 <span className="text-xs text-slate-500 font-medium">Creating...</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGenerateVideo(i, segment.visualCue)}
                                className="w-full flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/20 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group"
                              >
                                <Video className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
                                <span className="text-xs font-medium text-slate-500 group-hover:text-brand-300">Generate Clip</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Studio View
            <div className="h-full flex flex-col md:flex-row animate-fade-in">
               {/* Left: Preview Player */}
               <div className="w-full md:w-5/12 bg-black/40 border-r border-white/5 flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-4 bg-dots relative overflow-hidden">
                    <div className="relative aspect-[9/16] h-[85%] max-h-[600px] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                        {/* Transition Overlay */}
                        <div 
                           className={`absolute inset-0 bg-black z-20 pointer-events-none transition-opacity duration-500 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
                        />
                        
                        <video
                          ref={editorVideoRef}
                          className="w-full h-full object-cover"
                          playsInline
                          onEnded={() => {
                              if (!isPlayingSequence) {
                                 setIsPlayingSequence(false);
                              }
                          }}
                        />
                        
                        {/* Play Overlay if stopped */}
                        {!isPlayingSequence && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                              <button 
                                 onClick={playSequence}
                                 disabled={Object.keys(videoUrls).length === 0}
                                 className="p-4 rounded-full bg-white/10 hover:bg-brand-500 text-white transition-all hover:scale-110 disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:scale-100"
                              >
                                 <Play className="w-8 h-8 fill-current" />
                              </button>
                           </div>
                        )}
                        
                        {/* Controls Overlay */}
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-30">
                           <div className="flex items-center justify-center gap-4">
                              <button onClick={playSequence} className="text-white hover:text-brand-400">
                                {isPlayingSequence ? <PauseCircle className="w-8 h-8" /> : <PlayCircle className="w-8 h-8" />}
                              </button>
                              <div className="text-xs text-slate-300 font-mono">
                                {isPlayingSequence ? `Clip ${currentSequenceIndex + 1}` : 'Ready'}
                              </div>
                           </div>
                        </div>
                    </div>
                  </div>
                  <div className="p-4 bg-dark-900 border-t border-white/5">
                     <button 
                       disabled={Object.keys(videoUrls).length === 0}
                       onClick={playSequence}
                       className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isPlayingSequence ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                       {isPlayingSequence ? 'Playing Sequence...' : 'Preview Full Video'}
                     </button>
                  </div>
               </div>

               {/* Right: Timeline Editor */}
               <div className="w-full md:w-7/12 flex flex-col h-full bg-dark-800/50">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                     <h3 className="font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-400" />
                        Timeline Editor
                     </h3>
                     <span className="text-xs text-slate-500">
                        {Object.keys(videoUrls).length} / {result.segments.length} Clips Ready
                     </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                     {result.segments.map((segment, i) => (
                       <div 
                         key={i} 
                         className={`relative rounded-xl border transition-all duration-300 ${
                           currentSequenceIndex === i && isPlayingSequence 
                             ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
                             : 'bg-dark-800 border-white/5 hover:border-white/10'
                         }`}
                       >
                         <div className="flex gap-4 p-3">
                            {/* Thumbnail / Status */}
                            <div className="w-24 shrink-0">
                               {videoUrls[i] ? (
                                 <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black group">
                                    <video 
                                      src={videoUrls[i]} 
                                      className="w-full h-full object-cover"
                                      onLoadedMetadata={(e) => handleMetadataLoaded(i, e.currentTarget.duration)}
                                    />
                                    <button 
                                       onClick={() => {
                                         if (editorVideoRef.current) {
                                            editorVideoRef.current.src = videoUrls[i];
                                            editorVideoRef.current.play();
                                            setIsPlayingSequence(false);
                                            setCurrentSequenceIndex(i);
                                         }
                                       }}
                                       className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <Play className="w-6 h-6 text-white fill-current" />
                                    </button>
                                 </div>
                               ) : (
                                 <button
                                   onClick={() => handleGenerateVideo(i, segment.visualCue)}
                                   className="w-full h-full bg-white/5 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-brand-500/5 hover:border-brand-500/30 transition-all"
                                 >
                                    {generatingVideoIndex === i ? (
                                       <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                                    ) : (
                                       <Sparkles className="w-5 h-5 text-slate-500" />
                                    )}
                                    <span className="text-[10px] text-slate-500 font-medium">Create</span>
                                 </button>
                               )}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 flex flex-col justify-between py-1">
                               <div className="flex justify-between items-start">
                                  <div>
                                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scene {i + 1}</span>
                                     <p className="text-sm text-slate-200 line-clamp-1" title={segment.visualCue}>{segment.visualCue}</p>
                                  </div>
                                  <div className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">
                                    {clipSettings[i]?.duration ? `${clipSettings[i].duration.toFixed(1)}s` : segment.duration}
                                  </div>
                               </div>

                               {videoUrls[i] && (
                                 <div className="grid grid-cols-3 gap-3 mt-3">
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                                          <Scissors className="w-3 h-3" /> Start
                                       </label>
                                       <input 
                                          type="number" 
                                          step="0.1"
                                          min="0"
                                          max={clipSettings[i]?.duration || 10}
                                          value={clipSettings[i]?.trimStart || 0}
                                          onChange={(e) => setClipSettings(prev => ({
                                             ...prev,
                                             [i]: { ...prev[i], trimStart: parseFloat(e.target.value) }
                                          }))}
                                          className="w-full bg-dark-950 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-500 outline-none"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                                          <Scissors className="w-3 h-3 transform rotate-180" /> End
                                       </label>
                                       <input 
                                          type="number" 
                                          step="0.1"
                                          min="0"
                                          max={clipSettings[i]?.duration || 10}
                                          value={clipSettings[i]?.trimEnd || clipSettings[i]?.duration || 0}
                                          onChange={(e) => setClipSettings(prev => ({
                                             ...prev,
                                             [i]: { ...prev[i], trimEnd: parseFloat(e.target.value) }
                                          }))}
                                          className="w-full bg-dark-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-500 outline-none"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                                          <Settings2 className="w-3 h-3" /> Transition
                                       </label>
                                       <select 
                                          value={clipSettings[i]?.transition || 'none'}
                                          onChange={(e) => setClipSettings(prev => ({
                                             ...prev,
                                             [i]: { ...prev[i], transition: e.target.value as any }
                                          }))}
                                          className="w-full bg-dark-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-500 outline-none appearance-none"
                                       >
                                          <option value="none">None (Cut)</option>
                                          <option value="fade">Fade Black</option>
                                       </select>
                                    </div>
                                 </div>
                               )}
                            </div>
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};