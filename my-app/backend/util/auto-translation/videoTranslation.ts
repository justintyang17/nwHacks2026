import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  SpeechToTextConvertRequestEntityDetection,
  SpeechToTextConvertResponse,
} from "@elevenlabs/elevenlabs-js/api";
import * as ffmpeg from "fluent-ffmpeg";



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
        
        const transcription : object = await this.elevenLabs.speechToText.convert({
            file: videoFile ,
            modelId: "scribe_v2"
        })
        if("languageCode" in transcription && "text" in transcription) {
            if (transcription["languageCode"] !== "eng" && typeof(transcription["text"]) === "string" ) {
                return transcription.text;
            } else {
                return transcription.text;
            }
        }
        return null;
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