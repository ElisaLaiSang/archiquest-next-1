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

export default function ArtcriticPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [message, setMessage] = useState<string>("Generate Excuse");
  const [critiqueAudio, setCritiqueAudio] = useState<string>("");

  async function handleCreate() {
    setMessage("Generating Excuse...");
    //generate the image description
    const description = await getGroqCompletion(
      `Describe the scenario that your employee has told you about why they need the day off work using the following: ${keywords}.`,
      150,
      describeImagePrompt
    );

    //create the image
    const imageUrl = await generateImageFal(description, "landscape_16_9");

    setMessage("Assessing...");
    //generate a critique
    const critique = await getGroqCompletion(
      `The employee has given the following description: ${description}`,
      100,
      "As the employer, assess the plausibility of their reason."
    );

    setMessage("Result...");
    //generate a score
    const score = await getGroqCompletion(
      `The scenario is described as follows: ${description}. It was critiqued as follows: ${critique}`,
      4,
      "Increase score by 1 if the reason is plausible. Only display score number."
    );

    //update the scenario object and add to our state to display it
    const newArtwork = {
      description,
      imageUrl,
      critique,
      score,
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
            prompt="Excuse to take a day off work. Make it creative with a slight touch of unbelievability. The image created will be in a cartoon style."
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
              <span className="p-2">Score: {selectedArtwork.score}</span>
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
