import { getGroqCompletion } from "@/ai/groq";
import React, { useState, useEffect } from "react";
import TextToSpeech from "./TextToSpeech";

interface IncomingCallPopupProps {
  onClose: () => void; // Specify the type for onClose prop
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({ onClose }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [speakerText, setSpeakerText] = useState("");
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

  useEffect( () => {
    if (isAccepted) {
      // Start the call timer
      const getText = async () => {
        const text = await getGroqCompletion(`Pretend you are calling an employee who has not showed up for work. You have been on the call for ${callDuration} seconds, and should get more and more irate as the call goes on.`, 32);
        setSpeakerText(text);
    }

      const timer = setInterval(() => {
        setCallDuration((prevDuration) => prevDuration + 1);
      }, 1000);

      const speechTimer = setInterval(() => {
        getText();
      }, 8000);
      

      // Play the call audio when the call is accepted
     // const callAudioElement = document.getElementById("callAudio") as HTMLAudioElement;
     // callAudioElement.play();
        
        
      // Cleanup function to clear the timer and stop the call audio
      return () => {
        clearInterval(timer);
        clearInterval(speechTimer);
        //callAudioElement.pause();
        //callAudioElement.currentTime = 0; // Reset the audio playback to the beginning
      };
    }
  }, [isAccepted]);

  const handleAccept = () => {
    setIsAccepted(true);
    // Stop the ringtone
    const ringtoneElement = document.getElementById("ringtone") as HTMLAudioElement;
    ringtoneElement.pause();
    ringtoneElement.currentTime = 0;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="fixed bottom-0 right-0 m-8">
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
          <div className="grid grid-cols-3 gap-4">
            <button className="rounded-full bg-gray-300 p-2">Mute</button>
            <button className="rounded-full bg-gray-300 p-2">Keypad</button>
            <button className="rounded-full bg-gray-300 p-2">Audio</button>
            <button className="rounded-full bg-gray-300 p-2">Add Call</button>
            <button className="rounded-full bg-gray-300 p-2">FaceTime</button>
            <button className="rounded-full bg-gray-300 p-2">Contacts</button>
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
          <p className="text-gray-600 mb-4">From: Boss Gwyy</p>
          <div className="flex justify-around">
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-full"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded-full"
              onClick={onClose}
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