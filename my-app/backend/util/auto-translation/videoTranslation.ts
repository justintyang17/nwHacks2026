import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

import * as ffmpeg from "fluent-ffmpeg";
import { DoDubbingResponse, SpeechToTextConvertRequestEntityDetection, SpeechToTextConvertResponse } from "@elevenlabs/elevenlabs-js/api";
import dotenv from 'dotenv';

interface dubbedFile {
    dubbingId: string,
    expected_duration_sec: number
}

export class videoTranscription {

    /*
    videoTranscription class

    methods:
        - innit
        - video transcription
        - transcription translation

    */

    private elevenLabs: ElevenLabsClient;

    public constructor() {
        this.elevenLabs = new ElevenLabsClient({
            // Next.js will load ELEVENLABS_API_KEY from .env.local
            apiKey: process.env.ELEVENLABS_API_KEY,
        });
    }

    public async transcribe(videoFile : File) {
        
        const dubbed: DoDubbingResponse = await this.elevenLabs.dubbing.create({
            file: videoFile ,
            targetLang: "en"
        })
        while (true) {
            const { status } = await this.elevenLabs.dubbing.get(
                dubbed.dubbingId
              );
              if (status === "dubbed") {
                const dubbedFile = await this.elevenLabs.dubbing.transcripts.get(
                    dubbed.dubbingId,
                    "en",
                    "srt"
                )
                console.log(dubbedFile);
                return(dubbedFile);
              } else {
                console.log("Audio is still being dubbed...");
              }
              // Wait 5 seconds between checks
             await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    

    public translateCaption(caption : string) {
        
    }

    public async dubAudio(videFile: File) {
        const dubbed : object = await this.elevenLabs.dubbing.create({
            file: videFile,
            targetLang: "en",
        })
        if ("dubbing_id" in dubbed && "language_code" in dubbed && "srt" in dubbed) {
            const transcript = this.elevenLabs.dubbing.transcripts.get(dubbed["dubbing_id"] as string , dubbed["language_code"] as string, "srt")
            return transcript;
        }

        


    }

    
}