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

  return (
    <div className="font-mono p-10 text-5xl font-bold text-white">
      {formattedTime}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-cover bg-center bg-sky-300">
      <div id="phoneBorder" className="w-3/4 md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative" style={{ height: '45vw', backgroundImage: `url('/startPageImage.png')` }}>
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
      </div>
    </main>
  );
}
