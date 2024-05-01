import React, { useState } from 'react';

const SpeechRecognition: React.FC<{ onTranscript: (transcript: string) => void }> = ({ onTranscript }) => {
    const [isListening, setIsListening] = useState(false);

    const toggleListening = () => {
        setIsListening((prevIsListening) => !prevIsListening);
        if (!isListening) {
            startRecognition();
        }
    };

    const startRecognition = () => {
        // Your speech recognition logic here
        // Remember to call onTranscript when you get the transcript
    };

    return (
        <div>
            <button className="p-2 bg-gray-300 py-2 px-6 rounded mt-6 mr-3" onClick={toggleListening}>{isListening ? 'Stop' : 'Record'}</button>
        </div>
    );
};

export default SpeechRecognition;