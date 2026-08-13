import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '../../stores/usePlayerStore';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Bookmark,
  Sparkles,
  Flame,
  Check,
  ChevronUp,
} from 'lucide-react';

export const Module5SmartVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    currentVideo,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    quality,
    setQuality,
    bookmarks,
    addBookmark,
    seekTo,
  } = usePlayerStore();

  const [isMuted, setIsMuted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bookmarkInput, setBookmarkInput] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  // Initialize HLS.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(currentVideo.hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentVideo.hlsUrl;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [currentVideo]);

  // Sync Video Element State
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Sync Speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const nextTime = Math.max(0, Math.min(videoRef.current.duration || 1000, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const handleSeekSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    seekTo(time);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkInput.trim()) return;
    addBookmark(bookmarkInput);
    setBookmarkInput('');
    setShowBookmarkModal(false);
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Main Video Container Shell */}
      <div
        ref={containerRef}
        className="relative rounded-3xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl group glow-cyan"
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          className="w-full aspect-video object-cover cursor-pointer"
          poster={currentVideo.thumbnail}
        />

        {/* Heatmap Overlay Bar on Hover */}
        {showHeatmap && currentVideo.heatmaps && (
          <div className="absolute bottom-16 left-4 right-4 h-6 opacity-0 group-hover:opacity-100 transition-all pointer-events-none flex items-end gap-1 px-2">
            {currentVideo.heatmaps.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-cyan-500/60 to-purple-500/80 rounded-t"
                style={{ height: `${val}%` }}
                title={`Segment Retention ${val}%`}
              />
            ))}
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 opacity-95 group-hover:opacity-100 transition space-y-2">
          {/* Seek Slider with Chapter Markers */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={currentVideo.durationSeconds}
              value={currentTime}
              onChange={handleSeekSlider}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {/* Chapter Pins along Timeline */}
            {currentVideo.chapters.map((ch, idx) => {
              const posPercent = (ch.time / currentVideo.durationSeconds) * 100;
              return (
                <div
                  key={idx}
                  onClick={() => seekTo(ch.time)}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 hover:scale-150 cursor-pointer border border-white transition"
                  style={{ left: `${posPercent}%` }}
                  title={`${ch.formattedTime} - ${ch.title}`}
                />
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs text-slate-200">
            {/* Left Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-300" />}
              </button>

              <button onClick={() => skipTime(-10)} className="text-slate-400 hover:text-slate-200 p-1" title="Skip 10s back">
                <RotateCcw className="w-4 h-4" />
              </button>

              <button onClick={() => skipTime(10)} className="text-slate-400 hover:text-slate-200 p-1" title="Skip 10s forward">
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="font-mono text-slate-300">
                {formatSec(currentTime)} / {currentVideo.duration}
              </div>
            </div>

            {/* Right Settings Controls */}
            <div className="flex items-center gap-3">
              {/* Bookmark Button */}
              <button
                onClick={() => setShowBookmarkModal(!showBookmarkModal)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-cyan-950 border border-slate-700 flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" /> Pin Marker
              </button>

              {/* Speed Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs"
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-8 w-24 rounded-xl bg-slate-900 border border-slate-800 p-1 z-50 shadow-xl">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2, 2.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setPlaybackSpeed(s);
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between ${
                          playbackSpeed === s ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{s}x</span>
                        {playbackSpeed === s && <Check className="w-3 h-3 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality */}
              <button
                onClick={() => setQuality(quality === '1080p' ? '720p' : '1080p')}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-[11px]"
              >
                {quality}
              </button>

              {/* Mute */}
              <button onClick={() => setIsMuted(!isMuted)} className="p-1 text-slate-400 hover:text-slate-200">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-1 text-slate-400 hover:text-slate-200">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bookmark Pin Modal */}
      {showBookmarkModal && (
        <form onSubmit={handleSaveBookmark} className="p-4 rounded-2xl glass-panel border border-cyan-500/30 flex items-center gap-3">
          <input
            type="text"
            value={bookmarkInput}
            onChange={(e) => setBookmarkInput(e.target.value)}
            placeholder={`Add bookmark note for timestamp ${formatSec(currentTime)}...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition"
          >
            Save Pin
          </button>
        </form>
      )}

      {/* Video Details & Chapter Pins Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chapters */}
        <div className="md:col-span-2 p-5 rounded-2xl glass-panel space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Interactive Chapter Markers
          </h3>
          <div className="space-y-2">
            {currentVideo.chapters.map((ch, idx) => (
              <div
                key={idx}
                onClick={() => seekTo(ch.time)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                    {ch.formattedTime}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">{ch.title}</div>
                    <div className="text-[11px] text-slate-400">{ch.summary}</div>
                  </div>
                </div>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
            ))}
          </div>
        </div>

        {/* User Bookmark Pins */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" /> Saved Timestamp Pins
          </h3>
          <div className="space-y-2">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => seekTo(bm.time)}
                className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                  <span className="font-mono">{formatSec(bm.time)}</span>
                  <span className="text-[10px] text-slate-400">{bm.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{bm.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
