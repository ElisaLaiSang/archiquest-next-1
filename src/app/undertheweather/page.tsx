"use client";

import { useState, useEffect } from "react";
import { employerResponse, generateTagsPrompt, generateExcuse } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import ImageGallery from "@/components/ImageGallery";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal } from "@/ai/fal";
import Link from "next/link";

type Excuse = {
  description: string;
  imageUrl: string;
  critique: string;
  score: string;
};

// An example of making an excuse critic game

export default function UnderTheWeatherPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [selectedExcuse, setSelectedExcuse] = useState<Excuse | null>(null);
  const [message, setMessage] = useState<string>("Send");
  const [score, setScore] = useState<string>("0");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userInput, setUserInput] = useState("");

  // Temporary state for holding the critique with delay
  const [delayedCritique, setDelayedCritique] = useState<string>("");

  useEffect(() => {
    if (delayedCritique !== "") {
      // After 3 seconds delay, update the selectedExcuse's critique
      const timeout = setTimeout(() => {
        setSelectedExcuse((prevExcuse) => ({
          ...prevExcuse!,
          critique: delayedCritique,
        }));
      }, 3000);

      // Cleanup function to clear the timeout
      return () => clearTimeout(timeout);
    }
  }, [delayedCritique]);

  async function handleCreate() {
    setMessage("...");

    setIsTyping(true); // Set isTyping to true before generating content

    // Generate the image description
    const description = await getGroqCompletion(
      keywords === "Selected Keywords..."
        ? userInput
        : `Combine the ${keywords} to create a scenario for why do need to take the day off. Do not include quotation marks.`,
        75,
      generateExcuse
    );

    setIsTyping(false); // Set isTyping back to false after generating content

    // Create the image
    const imageStyle = `The image should be taken as a very quick selfie based on the ${description}. It might look a bit blurred.`
    const imageUrl = await generateImageFal(imageStyle, "landscape_16_9");

    setMessage("...");

    // Generate an excuse
    const critique = await getGroqCompletion(
      `You are the employer, give a response based on the following description: ${description}. Ask your employee questions to get more information and get them to explain the situation further. Add a bit of sass. Limit your response to under 50 words.`,
      100
    );

    // Set the delayed critique state
    setDelayedCritique(critique);

    setMessage("Sent");

    // Update the score based on the plausibility
    const isPlausible = critique.toLowerCase().includes("valid"); // Adjust this logic as needed
    const newScore = isPlausible ? parseInt(score) + 1 : parseInt(score);
    setScore(newScore.toString());

    // Update the excuse object and add to our state to display it
    const newExcuse = {
      description,
      imageUrl,
      critique: "", // Initially set critique to empty string
      score: newScore.toString(),
    };
    setExcuses([...excuses, newExcuse]);

    // Set the selected excuse immediately without the critique
    setSelectedExcuse(newExcuse);

    setMessage("Send");
  }

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-300 font-mono text-sm">
      <div
        id="phoneBorder"
        className="w-3/4 md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative"
      >
        <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white flex flex-col">
          <div>
            {selectedExcuse && (
              <div className="flex flex-col pb-4" style={{ maxWidth: "300px" }}>
                <span className="rounded-lg p-2 bg-sky-500 m-4 ">{selectedExcuse.description}</span>
                <img className="rounded-lg m-4" src={selectedExcuse.imageUrl} />
              </div>
            )}
          </div>
          <div className="flex flex-col pb-4" style={{ maxWidth: "300px" }}>
            {selectedExcuse && (
                <span className="rounded-lg p-2 bg-gray-200 p-2 m-4">{selectedExcuse.critique}</span>
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
          <audio className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2022/11/15/audio_dd883ed7eb.mp3" controls autoPlay />

          <div className="flex justify-between">
            <div className="flex flex-col">
              <span className="p-2 text-white mt-4 mr-3">Day Streak: {score}</span>
            </div>

            <Link href="/">
              <button className="bg-gray-300 hover:bg-blue-700 text-black py-2 px-6 rounded mt-4">Go back</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}