"use client";

import { useState } from "react";
import { describeImagePrompt } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import ImageGallery from "@/components/ImageGallery";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal, generateVoice } from "@/ai/fal";

type Artwork = {
  description: string;
  imageUrl: string;
  critique: string;
  score: string;
};

//An example of making an art critic game

export default function UnderTheWeatherPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [message, setMessage] = useState<string>("Generate Excuse");
  const [score, setScore] = useState<string>("0");

  async function handleCreate() {
    setMessage("Generating Excuse...");

    // Get the player's name and special skill
    const playerName = document.getElementById("playerName") as HTMLInputElement | null;
    const playerSpecialSkill = document.getElementById("playerSpecialSkill") as HTMLInputElement | null;
  
    //generate the image description
    const description = await getGroqCompletion(
      `Describe the scenario that ${playerName} has told you about why they need the day off work using the following: ${keywords}.Take into consideration their ${playerSpecialSkill}.`,
      200,
      describeImagePrompt
    );

    //create the image
    const imageUrl = await generateImageFal(description, "landscape_16_9");

    setMessage("Assessing...");
    //generate a critique
    const critique = await getGroqCompletion(
      `The employee has given the following description: ${description}`,
      100,
      "As the employer, assess their reason. If it is plausible, say that it is a valid reason to take the day off work. If it is not plausible do not use the word valid."
    );

     // Determine if the critique is considered plausible
    const isPlausible = critique.toLowerCase().includes("valid"); // Adjust this logic as needed

     // Update the score based on the plausibility
     const newScore = isPlausible ? parseInt(score) + 1 : parseInt(score);

    setMessage("Result...");
    // Update the score state
    setScore(newScore.toString());

    //update the scenario object and add to our state to display it
    const newArtwork = {
      description,
      imageUrl,
      critique,
      score: newScore.toString(),

    };
    setArtworks([...artworks, newArtwork]);
    setSelectedArtwork(newArtwork);
    setMessage("Generate Excuse");


  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-200">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col">
          <TagCloud
            prompt="Your employee needs to take the day off due to unforseen events or sickness. Make it creative with a slight touch of unbelievability."
            totalTags={100}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
          />
          <button className="p-4" onClick={handleCreate}>
            {message}
          </button>
          {selectedArtwork && (
            <div className="flex flex-col pb-4">
              <span className="p-2">{selectedArtwork.description}</span>
              <span className="p-2">Assessment: {selectedArtwork.critique}</span>
              <span className="p-2">Day Streak: {selectedArtwork.score}</span>
              <img src={selectedArtwork.imageUrl} />
            </div>
          )}
<p className="text-center p-2">Journal</p>
          <ImageGallery
            images={artworks.map((a) => a.imageUrl)}
            handleClickImage={(id) => setSelectedArtwork(artworks[id])}
          />
        </div>
      </div>
    </main>
  );
}


