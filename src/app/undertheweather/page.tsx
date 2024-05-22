"use client";

import { useState, useEffect } from "react";
import { employerResponse, generateTagsPrompt, generateExcuse } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import ImageGallery from "@/components/ImageGallery";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal } from "@/ai/fal";
import Link from "next/link";
import IncomingCallPopup from "@/components/IncomingCallPopup"; // Import the new popup component

type Excuse = {
  description: string;
  imageUrl: string;
  critique: string;
  score: string;
};

export default function UnderTheWeatherPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [message, setMessage] = useState<string>("Send");
  const [score, setScore] = useState<string>("0");
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [delayedCritique, setDelayedCritique] = useState<string>("");
  const [tags, setTags] = useState<{ text: string; selected: boolean }[]>([]);
  const [messageHistory, setMessageHistory] = useState<Excuse[]>([]); // New state for message history
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameEndCount, setGameEndCount] = useState(0); // State variable to track the number of times the game has ended
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false); // New state for popup visibility


  useEffect(() => {
    const generateJobTitle = async () => {
      const generatedText = await getGroqCompletion("Generate a job title. Do not include any other comments. Limit to 3 words", 15);
      setJobTitle(generatedText);
    };

    const generateSkills = async () => {
      const generatedSkills = await getGroqCompletion(
        `Generate 3 comma separated words of skills based on ${skills}. `,
        15);
        setSkills(generatedSkills.split(',').map(skill => skill.trim()));
      };
    generateJobTitle();
    generateSkills();
  }, []);

  useEffect(() => {
    // Start the 15-second timer when the component mounts
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // Reset timer to 30 seconds
          setRemainingTime(30);
          // Call generateBossTimerResponse immediately after resetting the timer
          ;
          return 30; 
        }
      });
    }, 1000); // Update every second
  
    // Cleanup function to clear the timer when the component unmounts or timer is reset
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // When remaining time reaches 0, trigger the action
    if (remainingTime === 0) {
      generateBossTimerResponse();
    }
    if (remainingTime === 0) {
      setShowPopup(true); // Show the popup when the timer reaches 10 seconds
    }
  }, [remainingTime]);

  const generateBossTimerResponse = async () => {
    const generatedText = await getGroqCompletion("You are the employer and your employee is taking a while to reply to your message. Create a response questioning why they are taking so long. Sassy but professional. Make the message short and limited to 10 words. This communication is via SMS", 25);
    setMessageHistory(prevHistory => [...prevHistory, { description: generatedText, imageUrl: "", critique: "", score: "" }]);

    await generateTags(generatedText);
  };

  useEffect(() => {
    // Effect for delayed critique update
    if (delayedCritique !== "") {
      const timeout = setTimeout(() => {
        setMessageHistory((prevHistory) => {
          const lastExcuse = prevHistory[prevHistory.length - 1];
          if (lastExcuse) {
            return [
              ...prevHistory.slice(0, -1),
              { ...lastExcuse, critique: delayedCritique },
            ];
          } else {
            return prevHistory;
          }
        });
      }, 1500);

      // Cleanup function to clear the timeout
      return () => clearTimeout(timeout);
    }
  }, [delayedCritique]);

  // Function to handle generating tags
  const generateTags = async (lastMessageDescription = "") => {
    const prompt = lastMessageDescription
    ? `Generate 5 SMS responses following the description: "${lastMessageDescription}". The response should be from the perspective of the employee. Only generate the responses, no other explanation is required. The responses should be no longer than 5 words.`
    : `Generate only 5 excuses why you need to take the day off work. Give a mix of creative, unbelievable excuses and normal excuses. Only generate the excuses, no other explanation is required. The excuses should be no longer than 5 words.`;
    const tagString = await getGroqCompletion(
      prompt, 100, generateTagsPrompt);
    const tagOptions = tagString.split(".");
    const filteredTags = tagOptions
      .map((text) => text.trim())
      .filter((text) => text && !/\d/.test(text));
    const tagsWithSelectedState = filteredTags.map((text) => ({
      text,
      selected: false,
    }));

    setTags(tagsWithSelectedState);
  };

  // Function to handle message creation
  async function handleCreate() {
    // Deselect all tags
    const deselectedTags = tags.map(tag => ({ ...tag, selected: false }));
    setTags(deselectedTags);
  
    setMessage("...");

    setRemainingTime(30);
  
    // Check if it's the first time the function is called
    const isFirstTime = messageHistory.length === 0;

    const description = isFirstTime
    ? await getGroqCompletion(
        keywords === "Selected Keywords..."
          ? userInput
          : `Combine the ${keywords} to create a scenario for why do need to take the day off.`,
        75,
        generateExcuse,
      )
    : await getGroqCompletion(
      `Use the previous excuse "${messageHistory[messageHistory.length - 1].description}", the critique "${messageHistory[messageHistory.length - 1].critique}", and the tags "${keywords}" to generate a response to your boss' message. Keep it as a brief SMS response. Do not include quotation marks. The response should be no longer than 20 words. Do not include any other explanation other than the excuse.`,
      40,
      );

      const specialKeywords = ["here", "photo", "attached", "picture", "show", "proof"];
      const containsSpecialKeywords = specialKeywords.some(keyword => description.toLowerCase().includes(keyword));
    
      const critiquePrompt = containsSpecialKeywords
        ? `You are the employer, and your employee has provided you with proof. Approve of the day off but be a bit skeptical and funny. Communciation is via SMS. Limit to 30 words.`
        : `You are the employer, give a response based on the following description: ${description}. You are a bit sassy and don't easily believe your employer. Ask them a question and proof. Do not approve of the day off until you get proof. Communciation is via SMS. Limit to 30 words.`;
    
      const critique = await getGroqCompletion(critiquePrompt, 75);
    
    // Set the delayed critique value
    setDelayedCritique(critique);
  
    setMessage("Send");

    const shouldSendImage = !isFirstTime && (critique.toLowerCase().includes("proof") || critique.toLowerCase().includes("photo") || critique.toLowerCase().includes("send") || critique.toLowerCase().includes("show"));

    let imageUrl = "";
    let imageStyle = "";
  
    if (shouldSendImage) {
      // Determine the type of proof requested based on the critique
      if (critique.toLowerCase().includes("document") || critique.toLowerCase().includes("note")) {
        imageStyle = `The image should be a document or official proof related to the description: ${messageHistory[messageHistory.length - 1].description}. It should look like a scanned document or official form.`;
      } else {
        imageStyle = `The image should be taken as a very quick selfie based on the ${messageHistory[messageHistory.length - 1].description}.`;
      }
      

      // Generate the image if a valid image style is determined
      if (imageStyle !== "") {
        imageUrl = await generateImageFal(imageStyle, "landscape_16_9");
      }
    }

    const isPlausible = critique.toLowerCase().includes("valid");
    const newScore = isPlausible ? parseInt(score) + 1 : parseInt(score);
    setScore(newScore.toString());

    const newExcuse = {
      description,
      imageUrl,
      critique: "", // Initialize critique as an empty string
      score: newScore.toString(),
    };
  
    // Add the new excuse to the message history
    setMessageHistory((prevHistory) => [...prevHistory, newExcuse]);

    await generateTags(critique);
  }

  
  // Function to toggle audio
  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-sky-300 font-mono text-sm">
    {/* Render IncomingCallPopup if showPopup is true */}
    {showPopup && <IncomingCallPopup onClose={() => setShowPopup(false)} />}

      <div
        id="phoneBorder"
        className="w-3/4 md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center justify-between relative" 
      >
        <div className="w-full flex flex-col bg-white">
          <div
            id="messageHistory"
            className="lg:w-3/5 h-96 overflow-y-auto" // Add fixed height and overflow properties
            >
            {messageHistory.map((message, index) => (
              <div
                key={index}
                className="flex flex-col"
                style={{ maxWidth: "400px" }}
              >
                  <span className="rounded-lg p-2 bg-sky-500 m-4 ">
                    {message.description}
                  </span>
                  <img className="rounded-lg m-4" src={message.imageUrl} />
                <span className="rounded-lg p-2 bg-zinc-200 m-4">
                  {message.critique}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
          <p className="ml-4">Reply Time: {remainingTime} seconds</p>
        </div>
        <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white pb-3">
          <div className="flex w-full">
            {/* Text input for user prompt */}
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Say something quick..."
              className="ml-3 mt-6 p-2 rounded-lg bg-zinc-50 border border-black flex-1 mr-3"
            />
            <button
              className="p-2 bg-gray-300 py-2 px-6 rounded mt-6 mr-3"
              onClick={() => generateTags()}>
              Generate
            </button>
            <button
              className="p-2 bg-sky-500 py-2 px-6 rounded mt-6 mr-3"
              onClick={handleCreate}
              disabled={keywords === "Selected Keywords..." && userInput.trim() === ""}
            >
              {message}
            </button>
          </div>
        </div>

       <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
          {tags.length > 0 && (
          <TagCloud
            prompt={generateTagsPrompt}
            totalTags={100}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
            tags={tags}
          />
          )}
       </div>

        <div className="flex justify-between w-full items-center">
          <audio className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2023/08/07/audio_62460cb7bb.mp3?filename=prank-161170.mp3" controls autoPlay />

          <div className="flex justify-between">
            <div className="flex flex-col">
              <span className="p-2 text-white mt-4 mr-3">Day Streak: {score}</span>
            </div>

            <Link href="/">
              <button className="bg-gray-300 hover:bg-blue-700 text-black py-2 px-6 rounded mt-4">Restart</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}