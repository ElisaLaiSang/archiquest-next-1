"use client";
import Chart, { Location } from "@/components/Chart";
import { useState } from "react";

//Demo of generating a map of coordinates that can be selected
export default function MapPage() {
  const [mapDescription, setMapDescription] = useState<string>("");
  const [mapPrompt, setMapPrompt] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <input
            className="p-2 rounded-lg w-full"
            type="text"
            onChange={(e) => setMapDescription(e.target.value)}
            placeholder="What do you want to do?"
          />
          <button className="p-4" onClick={() => setMapPrompt(mapDescription)}>
            Create Map
          </button>
          <span className="text-xl">{selectedLocation?.description}</span>
          <Chart
            prompt={mapPrompt}
            onSelect={(location: Location) => setSelectedLocation(location)}
          />
        </div>
      </div>
    </main>
  );
}
