"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Import aset gambar dan icon
import musicNote from "@/assets/image/MusicNote.png";
import playIcon from "@/assets/icon/Play.png";
import repeatIcon from "@/assets/icon/Repeat.png";
import shuffleIcon from "@/assets/icon/Shuffle.png";
import skipBackIcon from "@/assets/icon/SkipBack.png";
import skipForwardIcon from "@/assets/icon/SkipFoward.png";
import pauseIcon from "@/assets/icon/Pause.png";
import volumeIcon from "@/assets/icon/Volume.png";

// Data lagu yang akan dimainkan
const PLAYLIST = [
  {
    title: "Beautiful Things",
    artist: "Benson Boone",
    src: "/Beautiful Things.mp3",
  },
  { title: "Viva La Vida", artist: "Coldplay", src: "/Viva La Vida.mp3" },
  {
    title: "You're Beautiful",
    artist: "James Blunt",
    src: "/You're Beautiful.mp3",
  },
  {
    title: "What Makes You Beautiful",
    artist: "John Buckley",
    src: "/What Makes You Beautiful.mp3",
  },
];

// Definisi tipe status player
type PlayerState = "playing" | "paused" | "loading";

// Komponen kecil untuk memunculkan teks saat icon di-hover
const Tooltip = ({ text }: { text: string }) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-700 text-white text-[10px] rounded pointer-events-none whitespace-nowrap z-50"
  >
    {text}
  </motion.span>
);

export function MusicPlayer() {
  // State untuk menyimpan status pemutar dan data lagu
  const [status, setStatus] = useState<PlayerState>("paused");
  const [currentIndex, setCurrentIndex] = useState(0); // Indeks lagu aktif
  const [progress, setProgress] = useState(0); // Persentase bar progress (0-100)
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [bars, setBars] = useState([20, 20, 20, 20, 20]); // Tinggi bar visualizer (random/data audio)
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Ref digunakan untuk mengakses elemen DOM atau menyimpan nilai tanpa render ulang
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const currentSong = PLAYLIST[currentIndex];

  // Mengubah detik (angka) menjadi format menit:detik (teks)
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Menyiapkan Web Audio API untuk visualizer (hanya jalan sekali saat play)
  const initVisualizer = () => {
    if (!audioRef.current || audioContextRef.current) return;
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 64; // Menentukan resolusi data audio
    analyserRef.current = analyser;
    audioContextRef.current = ctx;
  };

  // Fungsi untuk menggerakkan bar visualizer sesuai frekuensi audio
  const runAnimation = () => {
    if (analyserRef.current && status === "playing") {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Mengambil beberapa sampel data frekuensi untuk diubah jadi tinggi bar (%)
      const newBars = [
        Math.max(20, (dataArray[2] / 255) * 100),
        Math.max(20, (dataArray[5] / 255) * 100),
        Math.max(20, (dataArray[8] / 255) * 100),
        Math.max(20, (dataArray[11] / 255) * 100),
        Math.max(20, (dataArray[14] / 255) * 100),
      ];
      setBars(newBars);
      animationRef.current = requestAnimationFrame(runAnimation);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    const wasPlaying = status === "playing";
    setStatus("loading");
    setProgress(0);
    setCurrentTime("0:00");

    const loadingTimer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current
            .play()
            .then(() => setStatus("playing"))
            .catch(() => setStatus("paused"));
        } else {
          setStatus("paused");
        }
      }
    }, 500); // Durasi loading 0.5 detik

    return () => clearTimeout(loadingTimer);
  }, [currentIndex]);

  // Mengatur jalannya animasi visualizer berdasarkan status playing
  useEffect(() => {
    if (status === "playing") {
      animationRef.current = requestAnimationFrame(runAnimation);
    } else {
      setBars([20, 20, 20, 20, 20]); // Reset bar ke tinggi minimal saat pause
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status]);

  // Fungsi Play/Pause
  const handleTogglePlay = () => {
    if (!audioRef.current || status === "loading") return;
    initVisualizer();
    if (status === "playing") {
      audioRef.current.pause();
      setStatus("paused");
    } else {
      audioRef.current.play();
      setStatus("playing");
    }
  };

  // Fungsi ganti lagu (Next/Prev) dengan logika Shuffle
  const handleSkip = (direction: "next" | "prev") => {
    if (status === "loading") return;
    if (isShuffle && direction === "next") {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * PLAYLIST.length);
      } while (randomIndex === currentIndex && PLAYLIST.length > 1);
      setCurrentIndex(randomIndex);
    } else if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
    }
  };

  return (
    <div
      className={`w-125 h-87.5 bg-[#0F0F0F] rounded-2xl p-4 transition-all duration-500 ease-in-out relative ${
        status === "playing"
          ? "shadow-[10px_10px_30px_-12px_rgba(124,58,237,0.2)]"
          : "shadow-[10px_10px_30px_-12px_rgba(0,0,0,0.6)]"
      }`}
    >
      <div className="w-full h-full flex flex-col gap-4">
        {/* Elemen Audio (Hidden) */}
        <audio
          ref={audioRef}
          src={currentSong.src}
          crossOrigin="anonymous"
          onTimeUpdate={() => {
            if (audioRef.current && status !== "loading") {
              const cur = audioRef.current.currentTime;
              const dur = audioRef.current.duration;
              setProgress((cur / (dur || 1)) * 100);
              setCurrentTime(formatTime(cur));
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(formatTime(audioRef.current.duration));
            }
          }}
          onEnded={() => {
            if (isRepeat) {
              audioRef.current?.play();
            } else {
              handleSkip("next");
            }
          }}
        />

        {/* Bagian Atas: Cover dan Informasi Lagu */}
        <div className="w-full h-35.5 flex gap-6">
          <div
            className={`w-30 h-30 rounded-xl flex items-center justify-center relative bg-linear-to-br from-primary-300 to-[#DB2777] transition-all duration-500
            ${status === "playing" ? "shadow-[0_0_25px_rgba(124,58,237,0.4)]" : ""}
            ${status === "loading" ? "scale-95 opacity-50 blur-[2px]" : "scale-100 opacity-100"}`}
          >
            <Image src={musicNote} alt="Album Art" className="w-18 h-auto" />
            {status === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between pt-6 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: status === "loading" ? 0.3 : 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-semibold text-[18px] text-neutral-100 leading-4 mb-2 truncate">
                  {currentSong.title}
                </p>
                <p className="text-[14px] text-neutral-400 leading-7">
                  {currentSong.artist}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Bar Visualizer Mini */}
            <div className="flex items-end gap-1 h-8">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: status === "loading" ? "10%" : `${h}%` }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className="w-1.5 bg-primary-200 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bagian Tengah: Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden relative">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary-200"
              transition={{ type: "tween", ease: "linear" }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-neutral-500 font-medium">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Bagian Bawah: Tombol Navigasi */}
        <div className="h-14 flex items-center justify-center gap-8">
          <div
            className="relative"
            onMouseEnter={() => setHoveredControl("shuffle")}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <Image
              src={shuffleIcon}
              alt="Shuffle"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`w-6 h-auto cursor-pointer transition-all duration-300 ${isShuffle ? "opacity-100 scale-110 brightness-125" : "opacity-40 hover:opacity-60"}`}
            />
            {hoveredControl === "shuffle" && <Tooltip text="Shuffle" />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredControl("prev")}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSkip("prev")}
              disabled={status === "loading"}
            >
              <Image
                src={skipBackIcon}
                alt="Back"
                className={`w-7 h-auto cursor-pointer ${status === "loading" ? "opacity-20" : ""}`}
              />
            </motion.button>
            {hoveredControl === "prev" && <Tooltip text="Previous" />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredControl("play")}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <motion.button
              onClick={handleTogglePlay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={status === "loading"}
              className={`w-14 h-14 rounded-full flex justify-center items-center transition-colors shadow-lg
                ${status === "loading" ? "bg-neutral-800" : "bg-primary-200 shadow-primary-500/20"}`}
            >
              <Image
                src={status === "playing" ? pauseIcon : playIcon}
                alt="Toggle"
                className={`w-6 h-auto cursor-pointer ${status === "loading" ? "opacity-0" : "opacity-100"}`}
              />
              {status === "loading" && (
                <div className="absolute w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
            </motion.button>
            {hoveredControl === "play" && (
              <Tooltip text={status === "playing" ? "Pause" : "Play"} />
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredControl("next")}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSkip("next")}
              disabled={status === "loading"}
            >
              <Image
                src={skipForwardIcon}
                alt="Next"
                className={`w-7 h-auto cursor-pointer ${status === "loading" ? "opacity-20" : ""}`}
              />
            </motion.button>
            {hoveredControl === "next" && <Tooltip text="Next" />}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setHoveredControl("repeat")}
            onMouseLeave={() => setHoveredControl(null)}
          >
            <Image
              src={repeatIcon}
              alt="Repeat"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`w-6 h-auto cursor-pointer transition-all duration-300 ${isRepeat ? "opacity-100 scale-110 brightness-125" : "opacity-40 hover:opacity-60"}`}
            />
            {hoveredControl === "repeat" && <Tooltip text="Repeat" />}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mt-2 group">
          <div className="relative flex items-center">
            <Image
              src={volumeIcon}
              alt="Volume"
              onClick={toggleMute}
              className={`w-4 h-auto cursor-pointer transition-opacity ${isMuted ? "opacity-20" : "opacity-60 hover:opacity-100"}`}
            />
            {isMuted && (
              <div className="absolute top-1/2 left-0 w-4 h-[1.5px] bg-red-500 rotate-45 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              setIsMuted(v === 0);
              if (audioRef.current) {
                audioRef.current.volume = v;
                audioRef.current.muted = v === 0;
              }
            }}
            className="flex-1 h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-primary-200"
          />
        </div>
      </div>
    </div>
  );
}
