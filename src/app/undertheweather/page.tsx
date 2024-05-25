"use client";

import { useState, useEffect, useRef } from "react";
import { employerResponse, generateTagsPrompt, generateExcuse } from "@/ai/prompts";
import TagCloud from "@/components/TagCloud";
import { getGroqCompletion } from "@/ai/groq";
import { generateImageFal } from "@/ai/fal";
import Link from "next/link";
import IncomingCallPopup from "@/components/IncomingCallPopup"; // Import the new popup component
import { BossTimerMessage } from "@/components/BossTimerMessage";

export type Excuse = {
  employeeMessage: string;
  imageUrl: string;
  bossMessage: string;
  score: string;
};

export default function UnderTheWeatherPage() {
  const [keywords, setKeywords] = useState<string>("Selected Keywords...");
  const [message, setMessage] = useState<string>("Send");
  const [generateButton, setGenerateButton] = useState<string>("Generate");
  const [score, setScore] = useState<string>("0");
  const [userInput, setUserInput] = useState("");
  const [tags, setTags] = useState<{ text: string; selected: boolean }[]>([]);
  const [messageHistory, setMessageHistory] = useState<Excuse[]>([]); // New state for message history
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bossResponseTimer, setBossResponseTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameEndCount, setGameEndCount] = useState(0); // State variable to track the number of times the game has ended
  const [showPopup, setShowPopup] = useState(false); // New state for popup visibility
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [bossTimerMessage, setBossTimerMessage] = useState('');

  // Initialize the audioRef with an instance of the Audio object
  const audioRef = useRef(new Audio('https://cdn.pixabay.com/download/audio/2023/08/07/audio_62460cb7bb.mp3?filename=prank-161170.mp3'));

  useEffect(() => {
    if (showPopup) {
      audioRef.current.pause(); // Pause the audio when the popup is shown
    } else {``
      audioRef.current.play(); // Resume the audio when the popup is closed
    }
  }, [showPopup]);

  useEffect(() => {
    // Start the 15-second timer when the component mounts
    const bossTimer = setInterval(() => {
      setBossResponseTimer((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // Reset timer to 30 seconds
          setBossResponseTimer(30);
          // Call generateBossTimerResponse immediately after resetting the timer
          ;
          return 30; 
        }
      });
    }, 1000); // Update every second
  
    // Cleanup function to clear the timer when the component unmounts or timer is reset
    return () => clearInterval(bossTimer);
  }, []);

  useEffect(() => {
    // When remaining time reaches 0, trigger the action
    if (bossResponseTimer === 0) {
      generateBossTimerResponse();
    }
    if (bossResponseTimer === 0) {
      setShowPopup(true); // Show the popup when the timer reaches 10 seconds
    }
  }, [bossResponseTimer]);

  const generateBossTimerResponse = async () => {
    const messageHistoryString = messageHistory
      .map(({ employeeMessage, bossMessage }) => `Employee: ${employeeMessage}\nBoss: ${bossMessage}`)
      .join('\n\n');
  
    const generatedText = await getGroqCompletion(`You are the employer and your employee is taking a while to reply to your message. Based on the following message history:\n\n${messageHistoryString}\n\nQuestion why they are taking so long to respond in a sassy, funny, and professional way. Make the message short and limited to 10 words. This communication is via SMS. Do not include any other explanation.`, 25);
  
    setBossTimerMessage(generatedText);
    setMessageHistory(prevHistory => [...prevHistory, { employeeMessage: "", imageUrl: "", bossMessage: generatedText, score: "" }]);
  
    await generateTags(generatedText);
  };

  // Function to handle generating tags
  const generateTags = async (messageHistory = "") => {
    setGenerateButton("...");
    const prompt = messageHistory
    ? `Generate 5 SMS responses following the description: "${messageHistory}". The response should be from the perspective of the employee. Only generate the responses, no other explanation is required. The responses should be no longer than 5 words.`
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
    setGenerateButton("Generate");
  };

  // Function to handle message creation
  async function handleCreate() {
    // Deselect all tags
    const deselectedTags = tags.map(tag => ({ ...tag, selected: false }));
    setTags(deselectedTags);
  
    setMessage("...");
  
    setBossResponseTimer(30);
  
    const isFirstTime = messageHistory.length === 0;
  
    const employeeMessage = isFirstTime
      ? await getGroqCompletion(
          keywords === "Selected Keywords..."
            ? userInput
            : `Combine the ${keywords} to create a scenario for why do need to take the day off. Do not include any other explanation or instructions. You do not need to mention your boss' name.`,
          75,
          generateExcuse,
        )
      : await getGroqCompletion(
        `Use the previous excuse "${messageHistory[messageHistory.length - 1].employeeMessage}", the boss message "${messageHistory[messageHistory.length - 1].bossMessage}", and the tags "${keywords}" to generate a response to your boss' message. Keep it as a brief SMS response. The response should be short. Do not include any other explanation or instructions.`,
        40,
        );
  
    const specialKeywords = ["here", "photo", "attached", "picture", "show", "proof"];
    const containsSpecialKeywords = specialKeywords.some(keyword => employeeMessage.toLowerCase().includes(keyword));
  
    const bossMessagePrompt = containsSpecialKeywords
      ? `You are the employer, and your employee has provided you with proof. Approve of the day off with a brief, skeptical, and funny response. Communication is via SMS, so keep your response concise. You do not need to mention the employee's name.`
      : `You are the employer, give a response based on the following description: ${employeeMessage}. You are a bit sassy and don't easily believe your employer. Ask them a question and proof. Do not approve of the day off until you are convinced your employee is telling the truth. Communication is via SMS, so keep your response concise and brief. Do not include any other explanation or instructions. You do not need to mention the employee's name.`;
  
    const bossMessage = await getGroqCompletion(bossMessagePrompt, 75);
  
    const isExcuseValid = (bossMessage: string) => {
      const validationKeywords = ['approve', 'valid', 'granted', 'accepted', 'off'];
      return validationKeywords.some(keyword => bossMessage.toLowerCase().includes(keyword));
    };
  
    const isValid = isExcuseValid(bossMessage);
  
    if (isValid) {
      setScore(prevScore => (parseInt(prevScore) + 1).toString());
    }
  
    setMessage("Send");
  
    const shouldSendImage = !isFirstTime;
  
    let imageUrl = "";
    let imageStyle = "";
  
    if (shouldSendImage) {
      imageStyle = bossMessage.toLowerCase().includes("document") || bossMessage.toLowerCase().includes("note")
        ? `The image should be a document or official proof related to the description: ${messageHistory[messageHistory.length - 1].employeeMessage}. It should look like a scanned document or official form.`
        : `The image should be taken as a very quick phone selfie based on the ${messageHistory[messageHistory.length - 1].employeeMessage}.`;
  
      if (imageStyle !== "") {
        imageUrl = await generateImageFal(imageStyle, "landscape_16_9");
        // Store generated image URL
        setImageUrls(prevUrls => [...prevUrls, imageUrl]);
      }
    }
  
    const newExcuse = {
      employeeMessage,
      imageUrl: shouldSendImage ? imageUrl : "", // Only set imageUrl if shouldSendImage is true
      bossMessage,
      score,
    };
  
    setMessageHistory(prevHistory => [...prevHistory, newExcuse]);
  
    await generateTags(bossMessage);
  }

  
  // Function to toggle audio
  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMessage = (bossMessage:string, employeeMessage:string)=>{

    const newExcuse = {
      employeeMessage,
      imageUrl:  "", // Only set imageUrl if shouldSendImage is true
      bossMessage,
      score,
    };
  
    setMessageHistory(prevHistory => [...prevHistory, newExcuse]);

  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-sky-300 font-mono text-xs lg:text-sm p-5">
    
    {/* Render IncomingCallPopup if showPopup is true */}
    {showPopup && <IncomingCallPopup messageHistory = {messageHistory} onMessage = {handleMessage} onClose={() => setShowPopup(false)} />}
    
      <div
        id="phoneBorder"
        className="w-full md:w-1/2 lg:w-3/6 bg-zinc-700 border border-zinc-700 border-16 rounded-lg flex flex-col items-center relative" 
      >
        <div className="w-full flex flex-col bg-white justify-between">
          <div id="messageHistory" className="lg:w-5/5 h-96 overflow-y-auto">
            {messageHistory.map((message, index) => (
              <div key={index} className="flex flex-col" style={{ maxWidth: '400px' }}>
                {message.employeeMessage && (
                  <span className="rounded-lg p-2 bg-sky-500 m-4">{message.employeeMessage}</span>
                )}
                <img className="rounded-lg m-4" src={message.imageUrl} />
                {message.bossMessage && !message.employeeMessage && (
                  <BossTimerMessage message={message.bossMessage} />
                )}
                {message.bossMessage && message.employeeMessage && (
                  <span className="rounded-lg p-2 bg-zinc-200 m-4">{message.bossMessage}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 max-w-3xl w-full items-center justify-between lg:flex bg-white">
          <p className="ml-4">Reply Time: {bossResponseTimer} seconds</p>
        </div>
        <div className="z-10 max-w-3xl w-full bg-white pb-3">
          <div className="flex w-full flex-wrap mt-3">
            {/* Text input for user prompt */}
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Say something quick..."
              className="ml-3 p-2 rounded-lg bg-zinc-50 border border-black flex-1 mr-2"
            />
            <button
              className="py-2 bg-gray-300 px-2 rounded mr-2 hover:shadow"
              onClick={() => generateTags()}>
              {generateButton}
            </button>
            <button
              className="p-2 bg-sky-500 px-2 rounded mr-3 hover:shadow"
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
          <audio className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2023/08/07/audio_62460cb7bb.mp3?filename=prank-161170.mp3" controls autoPlay ref={audioRef}/>

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