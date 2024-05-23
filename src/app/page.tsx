"use client";

import Link from "next/link";
import { useState } from "react";
import React, {useEffect } from "react";


function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalID);
  }, []); // Empty dependency array ensures effect runs only once on component mount

  const formattedTime = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div className="font-mono p-10 text-5xl font-bold text-white">
      {formattedTime}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-cover bg-center p-5 bg-sky-300">
      <div id="phoneBorder" className="w-full md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative h-[75vh] lg:h-[85vh] bg-cover lg:bg-contain" style={{backgroundImage: `url('/startPageImage.png')` }}>
        <Clock/>
          <div className="flex flex-col items-center">
            <p className="text-white text-2xl font-mono">Boss Gwyllim</p>
            <p className="text-white text-l italic font-mono">...</p>
          </div>
          <Link href="/undertheweather" className="mb-10">
            <button className="w-16 h-16 rounded-full bg-red-500 text-white font-mono text-sm">
              START
            </button>
          </Link>
          <div className="flex justify-between w-full items-center">
          <audio className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_f3ad5c138e.mp3" autoPlay preload="auto"/>

          </div>
      </div>
    </main>
  );
}