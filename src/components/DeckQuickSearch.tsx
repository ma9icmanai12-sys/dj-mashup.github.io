import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DeckTrack } from '../types/dj';
import { POPULAR_TRACKS } from '../data/presets';
import { extractYouTubeId } from '../services/youtube';
import { searchYouTubeClient, normalizeDjSearchQuery } from '../services/youtubeSearch';
import { ScrollingSongTitle } from './ScrollingSongTitle';
import { Search, X, Youtube, Loader2, Music, Mic, Piano, Disc3, ExternalLink } from 'lucide-react';

interface DeckQuickSearchProps {
  deckId: 'A' | 'B';
  onLoadTrack: (track: DeckTrack) => void;
  accentColor: 'cyan' | 'orange';
  customTracks?: DeckTrack[];
}

export const DeckQuickSearch: React.FC<DeckQuickSearchProps> = ({
  deckId,
  onLoadTrack,
  accentColor,
  customTracks = [],
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [liveYtResults, setLiveYtResults] = useState<DeckTrack[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCyan = accentColor === 'cyan';
  const focusBorder = isCyan ? 'focus-within:border-cyan-400' : 'focus-within:border-amber-400';
  const accentText = isCyan ? 'text-cyan-400' : 'text-amber-400';
  const buttonBg = isCyan ? 'bg-cyan-500 hover:bg-cyan-400 text-black' : 'bg-amber-500 hover:bg-amber-400 text-black';

  const allTracks = useMemo(() => [...POPULAR_TRACKS, ...customTracks], [customTracks]);

  // Check if query contains a direct YouTube link or ID
  const youtubeId = useMemo(() => extractYouTubeId(query), [query]);

  // Instant local catalog matches (strict all-words matching)
  const localMatches = useMemo(() => {
    const cleanQ = normalizeDjSearchQuery(query).toLowerCase();
    if (!cleanQ) return allTracks.slice(0, 5);

    const words = cleanQ.split(/\s+/).filter(Boolean);
    return allTracks.filter(track => {
      const searchTarget = `${track.title} ${track.artist} ${track.genre || ''}`.toLowerCase();
      return words.every(word => searchTarget.includes(word));
    }).slice(0, 5);
  }, [query, allTracks]);

  // Debounced real YouTube search for multi-word queries
  useEffect(() => {
    const cleanQ = query.trim();
    if (!cleanQ || youtubeId) {
      setLiveYtResults([]);
      setIsSearchingYt(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Fast 220ms debounce for responsive typing & instant results
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearchingYt(true);
        const normalized = normalizeDjSearchQuery(cleanQ);
        const res = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            setLiveYtResults(data.results);
            return;
          }
        }
        const clientResults = await searchYouTubeClient(cleanQ, customTracks);
        setLiveYtResults(clientResults);
      } catch {
        const clientResults = await searchYouTubeClient(cleanQ, customTracks);
        setLiveYtResults(clientResults);
      } finally {
        setIsSearchingYt(false);
      }
    }, 220);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, youtubeId, customTracks]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectTrack = (track: DeckTrack) => {
    onLoadTrack(track);
    setQuery('');
    setIsOpen(false);
  };

  const handleLoadYouTube = (vidId: string) => {
    const newTrack: DeckTrack = {
      id: `custom-yt-${Date.now()}`,
      videoId: vidId,
      title: `YouTube Video (${vidId})`,
      artist: 'Online Video',
      thumbnailUrl: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
      duration: 240,
      bpm: 124,
      key: '8A / Am',
      genre: 'Custom YouTube',
      suggestedCue: 0,
    };
    onLoadTrack(newTrack);
    setQuery('');
    setIsOpen(false);
  };

  const handleSearchSubmit = async () => {
    if (youtubeId) {
      handleLoadYouTube(youtubeId);
      return;
    }

    const cleanQ = query.trim();
    if (!cleanQ) return;

    if (liveYtResults.length > 0) {
      handleSelectTrack(liveYtResults[0]);
      return;
    }

    // Immediate YouTube search on submit with full multi-word query
    setIsSearchingYt(true);
    try {
      const normalized = normalizeDjSearchQuery(cleanQ);
      const res = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          handleSelectTrack(data.results[0]);
          setIsSearchingYt(false);
          return;
        }
      }
    } catch {}

    if (localMatches.length > 0) {
      handleSelectTrack(localMatches[0]);
    }
    setIsSearchingYt(false);
  };

  // Helper to append stem modifiers (Instrumental, Accapella, Remix)
  const handleAppendModifier = (modifier: string) => {
    const base = query.trim().replace(/\b(instrumental|instuemtal|instumental|acapella|accapella|vocals?|remix)\b/gi, '').trim();
    const newQuery = base ? `${base} ${modifier}` : modifier;
    setQuery(newQuery);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs sm:max-w-md">
      {/* Search Input Bar with clickable Go button */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/90 border border-neutral-700 rounded-lg text-xs font-mono transition-all shadow-inner ${focusBorder}`}
      >
        <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Search track + instrumental / accapella..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-white placeholder-neutral-500 focus:outline-none text-xs font-mono py-0.5"
        />

        {isSearchingYt && (
          <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
        )}

        {query && !isSearchingYt && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="text-neutral-500 hover:text-white p-0.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={handleSearchSubmit}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all shrink-0 ${buttonBg}`}
          title="Search YouTube & Load"
        >
          GO
        </button>
      </div>

      {/* Dropdown Suggestions Menu: Expanded width so whole song titles are clearly readable & auto-scrolling */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:-left-28 sm:-right-28 mt-1.5 bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col gap-1 p-1.5 max-h-96 overflow-y-auto animate-fade-in">
          {/* Quick DJ Stem Modifier Filter Chips */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-900/90 rounded-lg border border-neutral-800 text-[10px] font-mono flex-wrap">
            <span className="text-neutral-500 font-bold shrink-0">STEM FILTERS:</span>
            <button
              onClick={() => handleAppendModifier('instrumental')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-semibold flex items-center gap-1 border border-neutral-700 transition-colors"
              title="Search for instrumental backing track"
            >
              <Piano className="w-2.5 h-2.5" />
              <span>+ Instrumental</span>
            </button>
            <button
              onClick={() => handleAppendModifier('accapella')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold flex items-center gap-1 border border-neutral-700 transition-colors"
              title="Search for isolated vocal accapella"
            >
              <Mic className="w-2.5 h-2.5" />
              <span>+ Accapella</span>
            </button>
            <button
              onClick={() => handleAppendModifier('remix')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-purple-300 font-semibold flex items-center gap-1 border border-neutral-700 transition-colors"
              title="Search for club remixes"
            >
              <Disc3 className="w-2.5 h-2.5" />
              <span>+ Remix</span>
            </button>
          </div>

          {/* Direct YouTube Video Link Match */}
          {youtubeId && (
            <button
              onClick={() => handleLoadYouTube(youtubeId)}
              className="flex items-center justify-between p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-left border border-red-500/50 text-xs font-mono transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Youtube className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">
                    Load YouTube Video: <strong className="text-red-400">{youtubeId}</strong>
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Mount directly into Deck {deckId}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-black bg-red-500 px-2.5 py-1 rounded uppercase shadow-sm">
                LOAD
              </span>
            </button>
          )}

          {/* Live YouTube Search Results Header */}
          {liveYtResults.length > 0 && (
            <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold border-b border-neutral-800 flex items-center justify-between">
              <span>Live YouTube Results (Full Titles Auto-Scroll)</span>
              <span>{liveYtResults.length} matches</span>
            </div>
          )}

          {/* Live YouTube Search Results with Auto-Scrolling Long Titles */}
          {liveYtResults.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-900/90 text-left transition-colors text-xs font-mono group border border-transparent hover:border-amber-500/40 gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img
                  src={track.thumbnailUrl}
                  alt={track.title}
                  className="w-11 h-11 rounded object-cover border border-neutral-800 shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  {/* AUTO-SCROLLING SONG TITLE: Allows seeing entire long title without cutoff */}
                  <ScrollingSongTitle
                    title={track.title}
                    autoScroll={true}
                    className="font-bold text-white group-hover:text-amber-300"
                  />

                  <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium text-neutral-300 truncate max-w-[140px]">{track.artist}</span>
                    <span>·</span>
                    <span className={accentText}>{track.bpm} BPM</span>
                    <span>·</span>
                    <span className="text-neutral-400">{track.key}</span>
                    {track.durationFormatted && (
                      <>
                        <span>·</span>
                        <span className="text-neutral-500">{track.durationFormatted}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border shrink-0 transition-all active:scale-95 shadow-sm ${
                  isCyan
                    ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}
              >
                LOAD DECK {deckId}
              </span>
            </button>
          ))}

          {/* Pre-saved Library Matches if no live YouTube results yet */}
          {liveYtResults.length === 0 && localMatches.length > 0 && (
            <>
              <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-800 flex items-center justify-between">
                <span>DJ Crate Library Matches</span>
              </div>
              {localMatches.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-900/90 text-left transition-colors text-xs font-mono group border border-transparent hover:border-neutral-700 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <ScrollingSongTitle
                        title={track.title}
                        autoScroll={true}
                        className="font-bold text-white group-hover:text-amber-300"
                      />
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {track.artist} · <span className={accentText}>{track.bpm} BPM</span> · <span>{track.key}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border shrink-0 ${
                      isCyan
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    LOAD {deckId}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Searching Status Indicator */}
          {isSearchingYt && (
            <div className="p-3 text-center flex items-center justify-center gap-2 text-xs font-mono text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching YouTube for "{query}"...</span>
            </div>
          )}

          {!isSearchingYt && liveYtResults.length === 0 && localMatches.length === 0 && !youtubeId && (
            <div className="p-3 text-center flex flex-col items-center gap-2 text-[11px] font-mono text-neutral-400">
              <Music className="w-5 h-5 text-neutral-600" />
              <span>Press ENTER or click GO to pull "{query}" directly from YouTube.</span>
              <button
                onClick={handleSearchSubmit}
                className="px-3 py-1 rounded text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 uppercase"
              >
                Search & Mount onto Deck {deckId}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
