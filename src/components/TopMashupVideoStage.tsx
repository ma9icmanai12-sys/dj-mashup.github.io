import React, { useState, useEffect } from 'react';
import { DeckTrack } from '../types/dj';
import { getCurrentLyricLine, TRACK_LYRICS } from '../data/lyrics';
import {
  Maximize2,
  Sparkles,
  Subtitles,
  Split,
  Edit3,
  X,
  Play,
  Pause,
  Repeat,
  Sliders,
  Layers,
  Ghost,
  Camera,
  Film,
  Mic,
  Tv,
  Check,
} from 'lucide-react';
import { ScrollingSongTitle } from './ScrollingSongTitle';

interface TopMashupVideoStageProps {
  trackA: DeckTrack | null;
  trackB: DeckTrack | null;
  currentTimeA: number;
  currentTimeB: number;
  isPlayingA: boolean;
  isPlayingB: boolean;
  bpmA: number;
  bpmB: number;
  crossfader: number; // -1 (Deck A) to +1 (Deck B)
  onCrossfaderChange: (val: number) => void;
  loopAActive: boolean;
  loopBActive: boolean;
  onPlayPauseA?: () => void;
  onPlayPauseB?: () => void;
  onPlayPauseBoth?: () => void;
  onSyncBpm?: () => void;
  isWindowBackground?: boolean;
  onToggleWindowBackground?: () => void;
}

export type BlendVisualMode = 'screen' | 'ghost' | 'alpha' | 'side-by-side' | 'focus-a' | 'focus-b';

export const TopMashupVideoStage: React.FC<TopMashupVideoStageProps> = ({
  trackA,
  trackB,
  currentTimeA,
  currentTimeB,
  isPlayingA,
  isPlayingB,
  bpmA,
  bpmB,
  crossfader,
  onCrossfaderChange,
  loopAActive,
  loopBActive,
  onPlayPauseA,
  onPlayPauseB,
  onPlayPauseBoth,
  onSyncBpm,
  isWindowBackground = true,
  onToggleWindowBackground,
}) => {
  // Default to 'screen' with camera effect and FILL AREA so both videos fill the entire screen area together!
  const [blendMode, setBlendMode] = useState<BlendVisualMode>('screen');
  const [cameraEffect, setCameraEffect] = useState<boolean>(true);
  const [fillArea, setFillArea] = useState<boolean>(true); // Fills area edge-to-edge without black bars
  const [stageHeight, setStageHeight] = useState<'standard' | 'tall'>('tall');
  const [showCc, setShowCc] = useState<boolean>(true);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [customLyricInput, setCustomLyricInput] = useState('');
  const [activeInteractiveDeck, setActiveInteractiveDeck] = useState<'both' | 'A' | 'B'>('both');

  // Center audio spectrum simulation
  const [audioWaves, setAudioWaves] = useState<number[]>([40, 65, 80, 55, 70, 90, 60, 45]);

  useEffect(() => {
    if (!isPlayingA && !isPlayingB) return;
    const interval = setInterval(() => {
      setAudioWaves([
        isPlayingA ? 35 + Math.random() * 55 : 12,
        isPlayingA ? 50 + Math.random() * 50 : 12,
        (isPlayingA || isPlayingB) ? 55 + Math.random() * 45 : 18,
        (isPlayingA || isPlayingB) ? 70 + Math.random() * 30 : 18,
        (isPlayingA || isPlayingB) ? 60 + Math.random() * 40 : 18,
        isPlayingB ? 50 + Math.random() * 50 : 12,
        isPlayingB ? 40 + Math.random() * 55 : 12,
        isPlayingB ? 30 + Math.random() * 45 : 10,
      ]);
    }, 85);
    return () => clearInterval(interval);
  }, [isPlayingA, isPlayingB]);

  // Video blend calculation based on crossfader position (-1 to +1)
  const pos = (crossfader + 1) / 2; // 0 (Deck A full) to 1 (Deck B full)
  const weightA = Math.round((1 - pos) * 100);
  const weightB = Math.round(pos * 100);

  // Identify whichever track is the Accapella / Vocal stem
  const isDeckBAccapella = /acapella|accapella|vocal/i.test(trackB?.title || '');
  const isDeckAAccapella = /acapella|accapella|vocal/i.test(trackA?.title || '');
  const accapellaTrack = isDeckBAccapella ? trackB : isDeckAAccapella ? trackA : trackB || trackA;
  const accapellaTime = isDeckBAccapella ? currentTimeB : isDeckAAccapella ? currentTimeA : currentTimeB;
  const accapellaDeckId = isDeckBAccapella ? 'B' : isDeckAAccapella ? 'A' : 'B';

  // CC Accapella Lyrics resolution (matches by ID or title keyword)
  const activeLyric = accapellaTrack
    ? getCurrentLyricLine(accapellaTrack.videoId, accapellaTime, accapellaTrack.title)
    : null;

  const toggleFullscreen = () => {
    const el = document.getElementById('top-mashup-stage');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSaveCustomLyrics = () => {
    if (!accapellaTrack || !accapellaTrack.videoId) return;

    const lines = customLyricInput
      .split('\n')
      .filter(Boolean)
      .map((line, idx) => ({
        time: idx * 4,
        text: line.trim(),
      }));

    TRACK_LYRICS[accapellaTrack.videoId] = lines;
    setIsLyricsModalOpen(false);
  };

  const isBothPlaying = isPlayingA && isPlayingB;

  return (
    <section
      id="top-mashup-stage"
      className="w-full bg-neutral-900/95 border-2 border-neutral-800 rounded-2xl p-2.5 sm:p-4 shadow-2xl flex flex-col gap-3 backdrop-blur-md relative overflow-hidden"
    >
      {/* Top Bar: Play Both Master Control, Camera Screen Mode, Fill Area, & Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800/80 pb-2.5 gap-2.5">
        {/* Left: Stage Title & Live Master Play Both button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-white shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlayingA || isPlayingB ? 'bg-red-500 animate-ping' : 'bg-neutral-600'
              }`}
            />
            <span>MASHUP VIDEO SCREEN</span>
          </div>

          {/* Master Transport: PLAY BOTH AT SAME TIME */}
          {onPlayPauseBoth && (
            <button
              onClick={onPlayPauseBoth}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase transition-all shadow-md active:scale-95 ${
                isBothPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 ring-2 ring-amber-400/50'
                  : isPlayingA || isPlayingB
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              }`}
              title="Play or Pause BOTH YouTube videos simultaneously in the same screen area"
            >
              {isBothPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>PAUSE BOTH</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-300" />
                  <span>PLAY BOTH VIDEOS</span>
                </>
              )}
            </button>
          )}

          {/* Individual Mini Play Toggles for Deck A and Deck B */}
          <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            {onPlayPauseA && (
              <button
                onClick={onPlayPauseA}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  isPlayingA ? 'bg-cyan-500 text-black' : 'text-cyan-400 hover:bg-neutral-900'
                }`}
                title="Play/Pause Deck A"
              >
                {isPlayingA ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>A</span>
              </button>
            )}

            {onPlayPauseB && (
              <button
                onClick={onPlayPauseB}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  isPlayingB ? 'bg-amber-500 text-black' : 'text-amber-400 hover:bg-neutral-900'
                }`}
                title="Play/Pause Deck B"
              >
                {isPlayingB ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>B</span>
              </button>
            )}

            {onSyncBpm && (
              <button
                onClick={onSyncBpm}
                className="px-2 py-1 rounded text-[10px] font-mono font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                title="Sync BPM Tempo Between Both Decks"
              >
                SYNC
              </button>
            )}
          </div>
        </div>

        {/* Right: Same-Area Screen Effect Blend Mode Switcher & Extras */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono">
            {/* Screen Blend: Primary Same Area Mode */}
            <button
              onClick={() => setBlendMode('screen')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                blendMode === 'screen'
                  ? 'bg-amber-500 text-black font-black shadow-sm ring-1 ring-amber-400/50'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Screen Effect: Both videos play superimposed in the same area with additive lighting blend"
            >
              <Sparkles className="w-3 h-3" />
              <span>SCREEN EFFECT</span>
            </button>

            {/* Ghost / 50-50 Overlay */}
            <button
              onClick={() => setBlendMode('ghost')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                blendMode === 'ghost' ? 'bg-neutral-800 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Ghost Overlay: Both videos play superimposed in the same area with 50/50 transparency"
            >
              <Ghost className="w-3 h-3" />
              <span>GHOST</span>
            </button>

            {/* Crossfader Alpha Dissolve */}
            <button
              onClick={() => setBlendMode('alpha')}
              className={`px-2 py-1 rounded transition-colors ${
                blendMode === 'alpha' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Alpha Dissolve: Crossfader smoothly mixes both videos in the same area"
            >
              DISSOLVE
            </button>

            {/* Side by side alternate */}
            <button
              onClick={() => setBlendMode('side-by-side')}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                blendMode === 'side-by-side' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Side-by-Side Split Screen"
            >
              <Split className="w-3 h-3" />
              <span>SPLIT</span>
            </button>
          </div>

          {/* Camera Viewfinder Effect Toggle */}
          <button
            onClick={() => setCameraEffect(!cameraEffect)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 shadow-sm ${
              cameraEffect
                ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-red-500/20'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
            }`}
            title="Toggle Cinematic Camera Viewfinder & Lens Effects"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>CAMERA FX</span>
          </button>

          {/* Video Fill Area Toggle */}
          <button
            onClick={() => setFillArea(!fillArea)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 shadow-sm ${
              fillArea
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-cyan-500/20'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
            }`}
            title="Fill Area: Scales videos to fill 100% of the screen area without black bars"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{fillArea ? 'FILL AREA ON' : 'FIT 16:9'}</span>
          </button>

          {/* Whole Window Background Toggle */}
          {onToggleWindowBackground && (
            <button
              onClick={onToggleWindowBackground}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 shadow-sm ${
                isWindowBackground
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-purple-500/20'
                  : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
              }`}
              title="Toggle Full Window Background Video Fill across the whole application"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>WINDOW BG</span>
            </button>
          )}

          {/* CC for Accapella Toggle Button */}
          <button
            onClick={() => setShowCc(!showCc)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 shadow-sm ${
              showCc
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-emerald-500/20'
                : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
            }`}
            title="Toggle Closed Captions (CC) for Accapella lyrics stream on video"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>LYRICS ON</span>
          </button>

          {/* Edit Lyrics / Custom CC Button */}
          <button
            onClick={() => setIsLyricsModalOpen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
            title="Edit / Paste Custom Accapella Lyrics"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
            title="Toggle Fullscreen Stage"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Presentation Stage: BOTH VIDEOS SUPERIMPOSED IN THE EXACT SAME AREA FILLING 100% */}
      <div
        className={`w-full relative rounded-xl overflow-hidden bg-black border-2 border-neutral-800 shadow-2xl flex items-center justify-center select-none group transition-all duration-300 ${
          stageHeight === 'tall' ? 'h-84 sm:h-96 md:h-[460px] lg:h-[520px]' : 'aspect-video sm:h-80 md:h-96'
        }`}
      >
        {/* Real YouTube Players Layer: Both positioned with absolute inset-0 (NO relative conflict!) */}
        <div
          className={`w-full h-full ${
            blendMode === 'side-by-side' ? 'grid grid-cols-2 gap-2 p-1 bg-black relative' : 'relative overflow-hidden'
          }`}
        >
          {/* DECK A REAL YOUTUBE PLAYER CONTAINER (Base Layer - 100% Width & Height) */}
          <div
            className={`overflow-hidden rounded-lg bg-black transition-all duration-200 ${
              blendMode === 'side-by-side'
                ? 'w-full h-full border border-cyan-500/40 relative'
                : blendMode === 'focus-a'
                ? 'absolute inset-0 z-20 w-full h-full'
                : blendMode === 'focus-b'
                ? 'absolute inset-0 z-0 opacity-0 pointer-events-none w-full h-full'
                : 'absolute inset-0 z-10 w-full h-full flex items-center justify-center' // Exact same area!
            }`}
            style={{
              opacity: blendMode === 'alpha' ? Math.max(0.1, 1 - pos) : 1,
            }}
          >
            {/* The Real YouTube Player for Deck A - Scaled to fill area edge-to-edge */}
            <div
              id="deck-a-player"
              className={`w-full h-full pointer-events-auto transition-transform duration-300 ${
                fillArea && blendMode !== 'side-by-side' ? 'scale-[1.28]' : 'scale-100'
              }`}
            />

            {/* Deck A HUD Banner */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black tracking-wider uppercase bg-black/85 backdrop-blur border border-cyan-500/60 text-cyan-400 shadow-md">
                DECK A {isPlayingA ? '· LIVE' : '· IDLE'}
              </span>
              {loopAActive && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/85 border border-purple-500/60 text-purple-300 shadow-md">
                  LOOP ON
                </span>
              )}
            </div>

            {/* Deck A Bottom Track Info Tag */}
            <div className="absolute bottom-3 left-3 max-w-[40%] z-30 pointer-events-none bg-black/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-cyan-500/40 text-[10px] font-mono shadow-lg">
              <div className="text-white font-bold truncate">
                {trackA ? trackA.title : 'Deck A Empty'}
              </div>
              <div className="text-cyan-400 font-semibold mt-0.5">
                {bpmA.toFixed(1)} BPM
              </div>
            </div>
          </div>

          {/* DECK B REAL YOUTUBE PLAYER CONTAINER (Superimposed in the EXACT SAME AREA with Screen Effect) */}
          <div
            className={`overflow-hidden rounded-lg bg-black transition-all duration-200 ${
              blendMode === 'side-by-side'
                ? 'w-full h-full border border-amber-500/40 relative'
                : blendMode === 'focus-b'
                ? 'absolute inset-0 z-20 w-full h-full'
                : blendMode === 'focus-a'
                ? 'absolute inset-0 z-0 opacity-0 pointer-events-none w-full h-full'
                : 'absolute inset-0 z-20 w-full h-full flex items-center justify-center' // Exact same area!
            }`}
            style={{
              opacity:
                blendMode === 'alpha'
                  ? Math.max(0.1, pos)
                  : blendMode === 'screen'
                  ? 0.95 // High visibility for both video feeds!
                  : blendMode === 'ghost'
                  ? 0.7 // Balanced ghost overlay
                  : 1,
              mixBlendMode:
                blendMode === 'screen'
                  ? 'screen'
                  : blendMode === 'ghost'
                  ? 'plus-lighter'
                  : 'normal',
              pointerEvents: activeInteractiveDeck === 'B' || activeInteractiveDeck === 'both' ? 'auto' : 'none',
            }}
          >
            {/* The Real YouTube Player for Deck B - Scaled to fill area edge-to-edge */}
            <div
              id="deck-b-player"
              className={`w-full h-full pointer-events-auto transition-transform duration-300 ${
                fillArea && blendMode !== 'side-by-side' ? 'scale-[1.28]' : 'scale-100'
              }`}
            />

            {/* Deck B HUD Banner */}
            <div className="absolute top-3 right-3 z-30 pointer-events-none flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black tracking-wider uppercase bg-black/85 backdrop-blur border border-amber-500/60 text-amber-400 shadow-md">
                DECK B {isPlayingB ? '· LIVE' : '· IDLE'}
              </span>
              {loopBActive && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/85 border border-purple-500/60 text-purple-300 shadow-md">
                  LOOP ON
                </span>
              )}
            </div>

            {/* Deck B Bottom Track Info Tag */}
            <div className="absolute bottom-3 right-3 max-w-[40%] z-30 pointer-events-none bg-black/85 backdrop-blur px-2.5 py-1.5 rounded-lg border border-amber-500/40 text-[10px] font-mono text-right shadow-lg">
              <div className="text-white font-bold truncate">
                {trackB ? trackB.title : 'Deck B Empty'}
              </div>
              <div className="text-amber-400 font-semibold mt-0.5">
                {bpmB.toFixed(1)} BPM
              </div>
            </div>
          </div>
        </div>

        {/* CINEMATIC CAMERA SCREEN EFFECT OVERLAY */}
        {cameraEffect && blendMode !== 'side-by-side' && (
          <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
            {/* Camera Viewfinder Corners */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-red-500/80" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-red-500/80" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-red-500/80" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-red-500/80" />

            {/* Camera HUD Data */}
            <div className="absolute top-4 left-14 flex items-center gap-2.5 text-[10px] font-mono font-bold text-red-500 tracking-wider bg-black/70 backdrop-blur px-2.5 py-1 rounded-md border border-red-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>REC ● 4K 60FPS</span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-200">SHUTTER 1/120</span>
              <span className="text-neutral-200">ISO 400</span>
              <span className="text-amber-400">CAMERA SCREEN BLEND</span>
            </div>

            {/* Center Focus Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center opacity-35">
              <div className="w-14 h-14 border border-white/50 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white/70 rounded-full" />
              </div>
            </div>

            {/* Scanlines / Film Grain effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%)] bg-[length:100%_4px] opacity-35 pointer-events-none" />

            {/* Cinematic Lens Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
          </div>
        )}

        {/* Center Live Reactive Audio Spectrum & Blend Balance Bridge */}
        <div className="absolute top-3 inset-x-0 flex items-center justify-center gap-1 pointer-events-none z-30">
          <div className="bg-black/85 backdrop-blur px-3.5 py-1.5 rounded-full border border-neutral-800 flex items-center gap-2.5 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              A: {weightA}%
            </span>
            <div className="flex items-end gap-1 h-3.5">
              {audioWaves.map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    i < 3 ? 'bg-cyan-400' : i < 5 ? 'bg-amber-400' : 'bg-orange-400'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              B: {weightB}%
            </span>

            {/* Same Area Indicator Pill */}
            <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {blendMode === 'screen' ? 'SCREEN BLEND' : blendMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ACCAPELLA ON-VIDEO LYRICS HUD: Prominent, glowing karaoke subtitles on the video */}
        {showCc && (
          <div className="absolute bottom-10 inset-x-4 sm:inset-x-12 z-35 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            {/* Accapella Track Indicator Header */}
            <div className="flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-black/90 backdrop-blur-md border border-amber-500/60 shadow-2xl">
              <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-300">
                DECK {accapellaDeckId} ACCAPELLA VOCAL · {accapellaTrack ? `${accapellaTrack.artist} - ${accapellaTrack.title}` : 'Live Acapella'}
              </span>
              <button
                onClick={() => setIsLyricsModalOpen(true)}
                className="pointer-events-auto text-[10px] text-cyan-400 hover:text-cyan-200 underline ml-1 font-mono font-bold"
              >
                [Edit / Paste Lyrics]
              </button>
            </div>

            {/* Large Cinematic Karaoke Lyric Subtitle Directly on Video */}
            {activeLyric ? (
              <div className="bg-black/85 backdrop-blur-md px-6 sm:px-8 py-3.5 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center max-w-4xl transition-all">
                <p className="text-xl sm:text-2xl md:text-3xl font-mono font-black text-white tracking-wide drop-shadow-[0_2px_14px_rgba(245,158,11,0.95)]">
                  "{activeLyric}"
                </p>
              </div>
            ) : (
              <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-neutral-800 text-center max-w-xl text-xs font-mono text-neutral-300 shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>♪ [Acapella Vocals Streaming · Synced Live Stems] ♪</span>
              </div>
            )}
          </div>
        )}

        {/* Interactive Click Focus Switcher (Floating at bottom center) */}
        {blendMode !== 'side-by-side' && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-auto z-40">
            <div className="bg-black/85 backdrop-blur px-2.5 py-1 rounded-lg border border-neutral-800 flex items-center gap-1.5 text-[10px] font-mono shadow-md">
              <span className="text-neutral-500 font-bold px-0.5">CLICK FOCUS:</span>
              <button
                onClick={() => setActiveInteractiveDeck('both')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeInteractiveDeck === 'both' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
                title="Both videos active in same area"
              >
                Both
              </button>
              <button
                onClick={() => setActiveInteractiveDeck('A')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeInteractiveDeck === 'A' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-400 hover:text-cyan-200'
                }`}
                title="Focus Deck A"
              >
                Deck A
              </button>
              <button
                onClick={() => setActiveInteractiveDeck('B')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeInteractiveDeck === 'B' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400 hover:text-amber-200'
                }`}
                title="Focus Deck B"
              >
                Deck B
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Lyrics / Accapella Editor Modal */}
      {isLyricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  Accapella Lyrics Synchronizer
                </h3>
              </div>
              <button
                onClick={() => setIsLyricsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Paste song lyrics or rap verses below (one line per bar). The subtitle HUD will display them across the video screen in real time!
            </p>

            <textarea
              rows={8}
              value={customLyricInput}
              onChange={(e) => setCustomLyricInput(e.target.value)}
              placeholder="Verse 1:&#10;Line 1 lyrics...&#10;Line 2 lyrics...&#10;Chorus hook..."
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsLyricsModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-mono text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomLyrics}
                className="px-4 py-1.5 rounded text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black uppercase transition-colors"
              >
                Save Lyrics to Video
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
