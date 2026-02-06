import { MusicPlayer } from "@/components/MusicPlayer";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-16">
      <div className=" w-125 h-87.5 bg-[#0F0F0F] rounded-2xl shadow-lg shadow-black/25 p-4 border">
        <MusicPlayer />
      </div>
    </div>
  );
}
