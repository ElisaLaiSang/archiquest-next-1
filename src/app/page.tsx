"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [playerName, setPlayerName] = useState(""); // Initialize playerName state


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-cover bg-center" style={{ backgroundImage: `url('/startPageImage.png')` }}>
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-between font-mono text-sm lg:flex">
        <Link href="/undertheweather" className="mb-3 text-white">Play Under the Weather </Link>
        <input 
          id="playerName" 
          type="text" 
          className="p-2 rounded-lg mb-3" 
          placeholder="Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)} // Update playerName state onChange
        ></input>
        <p className="p-20 text-white">Instructions: Craft an excuse to take the day off work. Select and drag the given prompts into a order you believe will be convincing enough to get a day off work.</p>
      </div>
    </main>
  );
}