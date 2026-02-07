"use client";

// TODO: Import dependencies yang diperlukan
// import { motion } from "motion/react";
// import { ... } from "lucide-react";
import Image from "next/image";
import musicNote from "@/assets/image/MusicNote.png";
import play from "@/assets/icon/Play.png";
import repeat from "@/assets/icon/Repeat.png";
import shuffle from "@/assets/icon/Shuffle.png";
import skipBack from "@/assets/icon/SkipBack.png";
import skipForward from "@/assets/icon/SkipFoward.png";
import pause from "@/assets/icon/Pause.png";
import volume from "@/assets/icon/Volume.png";

export function MusicPlayer() {
  // TODO: Implementasikan state management untuk playing, paused, loading

  // TODO: Implementasikan handler untuk play/pause

  // TODO: Implementasikan komponen music player sesuai desain Figma
  // Struktur yang perlu dibuat:
  // - Container dengan background dan shadow animations
  // - Album artwork dengan rotation dan scale animations
  // - Equalizer bars dengan stagger effect
  // - Progress bar dengan fill animation
  // - Control buttons (play/pause, skip, volume)

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full h-35.5 flex gap-6">
        <div className="w-30 h-30 bg-linear-to-br from-primary-300 to-[#DB2777] rounded-xl flex items-center justify-center">
          <Image src={musicNote} alt="Album Art" className="w-18 h-auto" />
        </div>
        <div className="flex flex-col justify-between pt-6">
          <div className="">
            <p className="font-semibold text-[18px] text-neutral-100 leading-4 mb-2">
              Awesome Song Title
            </p>
            <p className="text-[14px] text-neutral-400  leading-7">
              Amazing Artist
            </p>
          </div>
          <div className="border-white border">bar</div>
        </div>
      </div>
      <div className="h-2 border border-white">progress bar</div>
      <div className="h-6 border border-white">time start time end</div>
      <div className="h-14 border border-white flex items-center justify-center gap-4">
        <Image
          src={shuffle}
          alt="Shuffle"
          className="w-9 h-auto cursor-pointer"
        />
        <Image
          src={skipBack}
          alt="Skip Back"
          className="w-9 h-auto cursor-pointer"
        />
        <div className="w-14 h-14 bg-primary-200 rounded-full flex justify-center items-center">
          <Image src={play} alt="Play" className="w-9 h-auto cursor-pointer" />
        </div>
        <Image
          src={skipForward}
          alt="Skip Forward"
          className="w-9 h-auto cursor-pointer"
        />
        <Image
          src={repeat}
          alt="Repeat"
          className="w-9 h-auto cursor-pointer"
        />
      </div>
      <div className="h-4 border border-white">
        <Image
          src={volume}
          alt="Repeat"
          className="w-4 h-auto cursor-pointer"
        />
        volume
      </div>
    </div>
  );
}
