import { useEffect, useState } from "react";

type AuraModel =
  | "aura-asteria-en"
  | "aura-luna-en"
  | "aura-stella-en"
  | "aura-athena-en"
  | "aura-hera-en"
  | "aura-orion-en"
  | "aura-arcas-en"
  | "aura-perseus-en"
  | "aura-angus-en"
  | "aura-orpheus-en"
  | "aura-helios-en"
  | "aura-zeus-en";

export default function TextToSpeech({
  text,
  model = "aura-athena-en",
  showControls,
  autoPlay,
}: {
  text: string;
  model?: AuraModel;
  showControls: boolean;
  autoPlay: boolean;
}) {
  const [audioURL, setAudioURL] = useState<string>("");

  useEffect(() => {
    const generateAudio = async () => {
      console.log("generatingAudio");
      const response = await fetch("/api/deepgram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model: model,
        }),
      });
      if (!response.body) return;
      const audioUrl = await getAudioUrl(response.body);
      setAudioURL(audioUrl);
    };
    if (text !== "") generateAudio();
  }, [text]);

  if (!audioURL) return <div>Loading...</div>;
  return (
    <audio
      className="w-full p-2"
      src={audioURL}
      controls={showControls}
      autoPlay={autoPlay}
    />
  );
}

const getAudioUrl = async (response: ReadableStream<Uint8Array>) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  const blob = new Blob([buffer], { type: "audio/wav" });
  // Generate a URL from the Blob
  return URL.createObjectURL(blob);
};