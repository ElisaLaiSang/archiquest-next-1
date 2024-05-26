import { getGroqCompletion } from "@/ai/groq";
import React, { useState, useEffect } from "react";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
import * as fal from "@fal-ai/serverless-client";
import { Excuse } from "@/app/undertheweather/page";


interface IncomingCallPopupProps {
  messageHistory:Excuse[];
  onClose: () => void; // Specify the type for onClose prop
  onMessage:(bossMessage:string, employeeMessage:string) =>void;
  setIsPopupCallTimerRunning: React.Dispatch<React.SetStateAction<boolean>>
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({messageHistory, onClose, onMessage, setIsPopupCallTimerRunning, }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [speakerText, setSpeakerText] = useState("");
  const [transcription, setTranscription] = useState("");
  
const handleTranscription = (transcription: string) => {
  //do whatever you want here
  setTranscription(transcription);
  onMessage(speakerText, transcription);
  getText();

};

  useEffect(() => {
    // Play the ringtone when the component mounts
    const ringtoneElement = document.getElementById("ringtone") as HTMLAudioElement;
    ringtoneElement.play();

    // Cleanup function to pause the ringtone when the component unmounts
    return () => {
      ringtoneElement.pause();
      ringtoneElement.currentTime = 0; // Reset the audio playback to the beginning
    };
  }, []);

  const getText = async () => {
    const text = await getGroqCompletion(`You are a sassy and creatively funny boss calling your employee who has not showed up for work, give a response based on the following description: ${transcription}. You have been on the call for ${callDuration} seconds, and the conversation is ${messageHistory}. You should get more and more irate as the call goes on. Do not include intro;employee name,number, and your tone.`, 50 );
    setSpeakerText(text);
}

  const handleAccept = () => {
    setIsAccepted(true);
    // Stop the ringtone
    const ringtoneElement = document.getElementById("ringtone") as HTMLAudioElement;
    ringtoneElement.pause();
    ringtoneElement.currentTime = 0;

    //immediately generate some speaker text 
     getText();
  };

  const handleDecline = () => {
    setIsAccepted(false);
    onClose(); // Close the popup
    setIsPopupCallTimerRunning(false); // Reset the popup call timer state
  };
  

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <audio id="ringtone" loop>
        <source src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_f3ad5c138e.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <audio id="callAudio">
        <source src="https://cdn.pixabay.com/audio/2022/03/13/audio_450e1adce3.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      {isAccepted ? (
        <div className="bg-white p-4 rounded-lg shadow-lg text-center h-64">
          <h2 className="text-xl font-bold mb-2">In Call</h2>
          <p className="text-gray-600 mb-2">Call Duration: {formatTime(callDuration)}</p>
          <div className="flex justify-center mt-4">
          <SpeechToText onTranscribed={handleTranscription}/>

          </div>
          <TextToSpeech text = {speakerText} showControls={false} autoPlay/>
          <div className="flex justify-center mt-4">
            <button
              className="bg-red-500 text-white py-2 px-4 rounded-full"
              onClick={onClose}
            >
              End Call
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-2">Incoming Call</h2>
          <p className="text-gray-600 mb-4">From: Boss</p>
          <div className="flex justify-around">
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-full"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded-full"
              onClick={() => {
                onClose(); // Call the onClose function to close the popup
                setIsPopupCallTimerRunning(false); // Reset the timer running state
              }}
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingCallPopup;