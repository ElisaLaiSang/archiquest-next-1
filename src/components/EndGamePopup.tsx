import React, { useState, useEffect } from 'react';
import { generateImageFal } from '@/ai/fal';
import TextToSpeech from '@/components/TextToSpeech';

interface EndGamePopupProps {
onClose: () => void;
}

const EndGamePopup: React.FC<EndGamePopupProps> = ({ onClose }) => {
const [imageUrl, setImageUrl] = useState<string>('');
const [valuation, setValuation] = useState<string>('');

useEffect(() => {
    // Function to play audio when component mounts
    const playAudio = () => {
        const audio = new Audio('<https://cdn.pixabay.com/audio/2021/08/04/audio_7411377aba.mp3>');
        audio.play();
    };

    // Call playAudio function when component mounts
    playAudio();

    // Generate artwork and set valuation
    async function generateArtwork() {
        const description = `super size CONGRATULATIONS vacation Party for celebrating a day off work out our on the beach, all people head turn into goldfish head, be creatively funny.`;
        const imageUrl = await generateImageFal(description, "landscape_16_9");
        setImageUrl(imageUrl);
        setValuation('Priceless');
    }

    generateArtwork();
}, []);

const handleClose = () => {
    onClose();
};

return (
    <div className="fixed z-100 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 relative">
        <div className="max-w-screen-lg w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-lg text-gray-700 mb-4">YOU GOT A DAY OFF!</p>
                {imageUrl && (
                    <>
                        <div className="relative overflow-hidden rounded-lg mb-4">
                            <img className="w-full" src={imageUrl} alt="Certificate" />
                            <TextToSpeech text={valuation} showControls={false} autoPlay={false} />
                        </div>
                    </>
                )}
                <button className="block w-full px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600" onClick={handleClose}>Close</button>
            </div>
        </div>
    </div>
);

}
export default EndGamePopup;