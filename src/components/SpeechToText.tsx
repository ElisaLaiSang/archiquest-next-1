"use client";
import React, { useState, useEffect } from "react";
import * as fal from "@fal-ai/serverless-client"; 

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function SpeechToText() {
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcription, setTranscription] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => {
    // Prompt the user for permission to use the mic
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }

    enableStream();

    // Cleanup function to stop the media stream
    return () => {
      mediaRecorder &&
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      setIsRecording(true);
      mediaRecorder.start();
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;
    }
  };

  const stopRecording = async () => {
    mediaRecorder && mediaRecorder.stop();
    setIsRecording(false);
    if (!blob) return;
    console.log("converting blob to uri");
    const dataURI = await convertBlobToBase64(blob);
    console.log("got uri, getting transcription");
    const transcribeAudio = (await fal.run("fal-ai/whisper", {
      input: {
        audio_url: dataURI,
      },
    })) as any;
    console.log(transcribeAudio);
    setTranscription(transcribeAudio.text);
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    if (event.data.size > 0) {
      const audioBlob = new Blob([event.data], { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setBlob(audioBlob);
      setAudioURL(url);
    }
  };

  const handleStop = async () => {
    mediaRecorder?.stream.getTracks().forEach((track) => track.stop()); // Stop the track to release the microphone
  };

  return (
    <div className="p-4 w-full flex flex-col gap-4">
      <button
        className="bg-white p-2 rounded"
        onClick={startRecording}
        disabled={isRecording}
      >
        Start Recording
      </button>
      <button
        className="bg-white p-2 rounded"
        onClick={stopRecording}
        disabled={!isRecording}
      >
        Stop Recording
      </button>
      <span>{transcription}</span>
      <audio src={audioURL} controls />
    </div>
  );
}

function convertBlobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // The result attribute contains the data as a base64 encoded string
      resolve(reader.result);
    };
    console.log("reading file");
    reader.readAsDataURL(blob);
  });
}