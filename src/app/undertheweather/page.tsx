"use client";

import { useState } from "react";
import { describeImagePrompt, generateTagsPrompt } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import ImageGallery from "@/components/ImageGallery";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal} from "@/ai/fal";
import Link from "next/link";
import SpeechRecognition from '@/components/SpeechRecognition';

  const handleTranscript = (transcript: string) => {
      console.log('Transcript:', transcript);
      // Call your function to process the transcript here
  };

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
  const [message, setMessage] = useState<string>("Send");
  const [score, setScore] = useState<string>("0");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userInput, setUserInput] = useState("");

  async function handleCreate() {
    setMessage("...");

    setIsTyping(true); // Set isTyping to true before generating content

    //generate the image description
    const description = await getGroqCompletion(
      keywords === "Selected Keywords..." ? userInput : `Combine the ${keywords} to create a scenario for why your employee said they cant come to work today. Make it make sense`,
      200,
      describeImagePrompt
    );

    setIsTyping(false); // Set isTyping back to false after generating content

    //create the image
    const imageUrl = await generateImageFal(description, "landscape_16_9");

    setMessage("...");
    //generate a critique
    const critique = await getGroqCompletion(
      `The employee has given the following description: ${description}`,
      100,
      "As the employer, assess their reason. If the reason is plausible, give them a day of leave."
    );

     // Determine if the critique is considered plausible
    const isPlausible = critique.toLowerCase().includes("valid"); // Adjust this logic as needed

     // Update the score based on the plausibility
     const newScore = isPlausible ? parseInt(score) + 1 : parseInt(score);

    setMessage("Sent");

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
    setMessage("Send");

  }

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-300 font-mono text-sm" >
      <div id="phoneBorder" className="w-3/4 md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative">
      
      <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
        <div>
          {selectedArtwork && (
            <div className="flex flex-col pb-4">
              <span className="p-2">{selectedArtwork.description}</span>
              <span className="p-2">Assessment: {selectedArtwork.critique}</span>
              <span className="p-2">Day Streak: {selectedArtwork.score}</span>
              <img src={selectedArtwork.imageUrl} />
            </div>
          )}
        </div>
      </div>

      <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
      {isTyping && <div>Boss is typing...</div>}
      </div>

      <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
        <div className="flex w-full">
          {/* Text input for user prompt */}
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Message"
            className="ml-3 mt-6 p-2 rounded-lg bg-zinc-50 border border-black flex-1 mr-3"
          />
          <SpeechRecognition onTranscript={handleTranscript} />
          <button
            className="p-2 bg-gray-300 py-2 px-6 rounded mt-6 mr-3"
            onClick={handleCreate}
            disabled={keywords === "Selected Keywords..." && userInput.trim() === ""}
          >
            {message}
          </button>
        </div>
      </div>

      <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
        <div className="mt-3 flex flex-col">
          <TagCloud
            prompt={generateTagsPrompt}
            totalTags={100}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
          />      
        </div>
      </div>

      <div className="flex justify-between w-full items-center">
      {/* Audio player */}
      <audio className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2022/11/15/audio_dd883ed7eb.mp3" controls autoPlay/>
      
    <div className="flex justify-between">
      <div className="flex flex-col">
        <span className="p-2 text-white mt-4 mr-3">Day Streak: {score}</span>
      </div>

        
      <Link href="/">
        <button className="bg-gray-300 hover:bg-blue-700 text-black py-2 px-6 rounded mt-4">
          Go back
        </button>
      </Link>
    </div>

      </div>
      
      </div>
    </main>
  );
}


