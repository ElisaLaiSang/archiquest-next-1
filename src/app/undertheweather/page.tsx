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
      `Describe the reason selected by the employee: ${keywords}`,
      150,
      describeImagePrompt
    );

    //create the image
    const imageUrl = await generateImageFal(description, "landscape_16_9");

    setMessage("Assessing...");
    //generate a critique
    const critique = await getGroqCompletion(
      `The employee has given the following description for why they can't come to work: ${description}`,
      150,
      "As the employer, assess the plausibility of their reason."
    );

    setMessage("Scoring artwork...");
    //generate a score
    const score = await getGroqCompletion(
      `The player selected a excuse for taking the day off day based on the following: ${description}. It was critiqued as follows: ${critique}`,
      4,
      "If the reason is plausible, increase the score by 1. Only display the number."
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
              <span>{selectedArtwork.description}</span>
              <span>Score: {selectedArtwork.score}</span>
              <img src={selectedArtwork.imageUrl} />
            </div>
          )}

          <ImageGallery
            images={artworks.map((a) => a.imageUrl)}
            handleClickImage={(id) => setSelectedArtwork(artworks[id])}
          />
        </div>
      </div>
    </main>
  );
}
