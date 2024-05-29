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
  const [bossResponseTimer, setBossResponseTimer] = useState(20);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameEndCount, setGameEndCount] = useState(0); // State variable to track the number of times the game has ended
  const [showPopup, setShowPopup] = useState(false); // New state for popup visibility
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [bossTimerMessage, setBossTimerMessage] = useState('');
  const [popupCallTimer, setPopupCallTimer] = useState(0);
  const [isPopupCallTimerRunning, setIsPopupCallTimerRunning] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null); // Reference for the audio element

  const resetTimer = () => {
    setIsPopupCallTimerRunning(false);
    setShowPopup(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Restore volume
    }
  };
  
  useEffect(() => {
    const startPopupCallTimer = () => {
      const randomDelay = Math.floor(Math.random() * (25 - 20 + 1)) + 20;
      setPopupCallTimer(randomDelay);
      setIsPopupCallTimerRunning(true);
  
      const callTimer = setTimeout(() => {
        setShowPopup(true);
        if (audioRef.current) {
          audioRef.current.volume = 0.01; // Reduce volume
        }
        setIsPopupCallTimerRunning(false);
      }, randomDelay * 1000);
  
      return () => clearTimeout(callTimer);
    };
  
    startPopupCallTimer();
  }, []);

  useEffect(() => {
    const bossTimer = setInterval(() => {
      if (!isTimerPaused) {
        setBossResponseTimer(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            // Reset timer to 20 seconds
            return 20;
          }
        });
      }
    }, 1000); // Update every second

    return () => clearInterval(bossTimer);
  }, [isTimerPaused]); // Add isTimerPaused as a dependency

  // New useEffect to pause the timer when the popup appears
  useEffect(() => {
    if (showPopup) {
      setIsTimerPaused(true);
    }
  }, [showPopup]);

  // New useEffect to resume the timer when the popup disappears
  useEffect(() => {
    if (!showPopup) {
      setIsTimerPaused(false);
    }
  }, [showPopup]);

  useEffect(() => {
    // When remaining time reaches 0, trigger the action
    if (bossResponseTimer === 0) {
      generateBossTimerResponse();
    }
  }, [bossResponseTimer]);

  const messageHistoryString = messageHistory
  .map(({ employeeMessage, bossMessage }) => `Employee: ${employeeMessage}\nBoss: ${bossMessage}`)
  .join('\n\n');

  const generateBossTimerResponse = async () => {
    const generatedText = await getGroqCompletion(`You are the employer and your employee is taking a while to reply to your message. Based on the following message history:\n\n${messageHistoryString}\n\n. Question why they are taking so long to respond in a sassy, funny, and professional way. Make the message short and limited to 10 words. This communication is via SMS. Do not include any other explanation.`, 25);
  
    setBossTimerMessage(generatedText);
    setMessageHistory(prevHistory => [...prevHistory, { employeeMessage: "", imageUrl: "", bossMessage: generatedText, score: "" }]);
  
    await generateTags(generatedText);
  };

  // Function to handle generating tags
  const generateTags = async (messageHistory = "") => {
    setGenerateButton("...");
    const prompt = messageHistory
    ? `Generate a set of short SMS responses following: "${messageHistory}". Generate the responses like you are the employee. Only generate the responses, no other explanation is required. The responses must be short and brief. Keep the respond to five words. Add a bit of humour and wittyness to the responses.`
    : `Generate only 5 excuses why you need to take the day off work. Give a mix of creative, unbelievable excuses and normal excuses. Only generate the excuses, no other explanation is required. The excuses should be no longer than 5 words.`;
    const tagString = await getGroqCompletion(
      prompt, 100);
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
    setUserInput("");

    // Deselect all tags
    const deselectedTags = tags.map(tag => ({ ...tag, selected: false }));
    setTags(deselectedTags);
  
    setMessage("...");
  
    setBossResponseTimer(20);
  
    const isFirstTime = messageHistory.length === 0;
  
    let prompt;

    if (isFirstTime) {
      prompt = userInput.trim() !== ""
        ? `${userInput} ${keywords === "Selected Keywords..." ? "" : `Combine the ${keywords} to create a scenario for why you need to take the day off.`}`
        : `Combine the ${keywords} to create a scenario for why you need to take the day off. Do not include any other explanation or instructions. Refer to the boss as "boss", do not use their name. You must keep the SMS to 2 sentences max. For example: "Sorry, my cat caught the flu and has made me sick. I'll have to take the day off." Do not include the word count in your response.`;
    } else {
      prompt = `The boss has sent the following message: "${messageHistory[messageHistory.length - 1].bossMessage}". ${userInput.trim() !== "" ? `Your response: "${userInput}". ` : ""} Based on the message, create a response that also incorporates the tags "${keywords}". Keep it as a brief SMS response. The response should be short. Do not include any other explanation or instructions. You must keep the SMS to one sentence. Do not include the boss' name, refer to them as "boss". Do not include the word count in your response.`;
    }
    
    const employeeMessage = await getGroqCompletion(prompt, 50);
  
    const specialKeywords = ["here", "photo", "attached", "picture", "show", "proof"];
    const containsSpecialKeywords = specialKeywords.some(keyword => employeeMessage.toLowerCase().includes(keyword));
  
    const bossMessagePrompt = containsSpecialKeywords
      ? `You are the employer, and your employee has provided you with proof. Approve of the day off with a brief, skeptical, and funny response. Communication is via SMS, so keep your response concise. You do not need to mention the employee's name.`
      : `You are the employer, give a response based on the following description: ${employeeMessage}. You are a bit sassy and don't easily believe your employer. Ask them a question and proof. Do not approve of the day off until you are convinced your employee is telling the truth. Communication is via SMS, so keep your response concise and brief. Do not include any other explanation or instructions. You do not need to mention the employee's name. You must keep the SMS to 2 sentences max.`;
  
    const bossMessage = await getGroqCompletion(bossMessagePrompt, 50);

    const isExcuseValid = (bossMessage: string) => {
      const validationKeywords = ['approve', 'valid', 'granted', 'accepted', 'off'];
      return validationKeywords.some(keyword => bossMessage.toLowerCase().includes(keyword));
    };
  
    const isValid = isExcuseValid(bossMessage);
  
    if (isValid) {
      setScore(prevScore => (parseInt(prevScore) + 1).toString());
    }
  
    setMessage("Send");
  
    const shouldSendImage = messageHistory.length > 0
    ? await getGroqCompletion(
        `The boss sent the following message: "${messageHistory[messageHistory.length - 1].bossMessage}". Based on this message, should the employee send a selfie photo or a document/scanned note to support their excuse? Respond with either "Selfie" or "Document" only.`,
        2, // Set a low max_tokens value to allow only "Selfie" or "Document" as the response
      )
    : "No";
  
  const imageType = shouldSendImage.trim().toLowerCase();
  
  let imageUrl = "";
  let imageStyle = "";
  
  if (imageType === "selfie") {
    imageStyle = `The image should be taken as a very quick phone selfie based on the ${messageHistory[messageHistory.length - 1].employeeMessage}.`;
  } else if (imageType === "document") {
    imageStyle = `The image should be a realistic-looking doctor's note or document related to the ${messageHistory[messageHistory.length - 1].employeeMessage}.`;
  }
  
  if (imageStyle !== "") {
    imageUrl = await generateImageFal(imageStyle, "landscape_16_9");
    // Store generated image URL
    setImageUrls(prevUrls => [...prevUrls, imageUrl]);
  }
  
  const newExcuse = {
    employeeMessage,
    imageUrl: imageType === "selfie" || imageType === "document" ? imageUrl : "",
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
    {showPopup && (
      <IncomingCallPopup
        messageHistory={messageHistory}
        onMessage={handleMessage}
        onClose={resetTimer}
        setIsPopupCallTimerRunning={setIsPopupCallTimerRunning}
      />
    )}
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
          <div className="flex w-full mt-3">
            {/* Text input for user prompt */}
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Say something quick..."
              className="ml-3 p-2 rounded-lg bg-zinc-50 border border-black flex-1 mr-2"  style={{ flex: '1 1 auto', minWidth: '0' }}
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
            totalTags={100}
            handleSelect={(tags) => setKeywords(tags.join(", "))}
            tags={tags}
          />
          )}
       </div>

      <div className="bg-white pt-2">
       {isGalleryVisible && (
              <>
                <p className="flex - flex-col items-center p-2">Photo Gallery</p>
                <div id="imageGallery" className="grid grid-cols-3 gap-4 p-2">
                  {/* Render generated images */}
                  {imageUrls.map((url, index) => (
                    <img key={index} className="rounded-lg" src={url} alt={`Generated Image ${index}`} />
                  ))}
                </div>
              </>
            )}
      </div>

        <div className="flex justify-between w-full items-center">
        <audio ref={audioRef} className="p-2 mt-2" src="https://cdn.pixabay.com/download/audio/2023/08/07/audio_62460cb7bb.mp3?filename=prank-161170.mp3" controls autoPlay />

          <div className="flex justify-between">
            <button 
              className="p-2 bg-gray-300 px-2 rounded mr-3 hover:shadow mt-4"
              onClick={() => setIsGalleryVisible(!isGalleryVisible)}
            >
              {isGalleryVisible ? 'Photos' : 'Photos'}
            </button>

            <Link href="/">
              <button className="bg-gray-300 hover:bg-blue-700 text-black py-2 px-2 rounded mt-4">Restart</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}