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
    <div className="font-mono p-4 md:p-10 text-3xl lg:text-5xl font-bold text-white">
      {formattedTime}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-cover bg-center p-5 md:p-5 lg:p-5 bg-sky-300">
      <div id="phoneBorder" className="w-full md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative h-[85vh] lg:h-[85vh] bg-cover lg:bg-contain" style={{backgroundImage: `url('/startPageImage.png')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat'  }}>
        <Clock/>
        <div className="flex flex-col font-mono text-xs md:text-sm lg:text-sm text-white bg-zinc-800 bg-opacity-65 rounded-lg p-2 m-4 mb-10">
          <p className="font-bold">Goal:</p>
          <p>Successfully convince your boss that you need the day off work</p>
            <div className="pt-4 pb-4">
              <p>1. Press the generate button to view possible excuses you can use.</p>
              <p>2. Select one or more tags to create an excuse or type in your own and SEND.</p>
              <p>3. Continue the conversation.</p>
            </div>
          <p>Best of luck!</p>
        </div>
          <div className="flex flex-col items-center mb-5">
            <p className="text-white text-xl lg:text-2xl font-mono">Boss Calling...</p>
          </div>
          <Link href="/undertheweather" className="">
            <button className="w-12 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16  rounded-full bg-red-500 text-white font-mono text-xs sm:text-sm md:text-base lg:text-l">
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