import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { SpeechToTextConvertRequestEntityDetection, SpeechToTextConvertResponse } from "@elevenlabs/elevenlabs-js/api";
import dotenv from 'dotenv';
import * as ffmpeg from 'fluent-ffmpeg';



export class videoTranscription{

    /*
    videoTranscription class

    methods:
        - innit
        - video transcription
        - transcription translation

    */

    private elevenLabs : ElevenLabsClient;

    public constructor() {
        this.elevenLabs = new ElevenLabsClient({
            apiKey: process.env.apikey
        })
    }

    public async transcribe(videoFile : File) {
        
        const transcription : object = await this.elevenLabs.speechToText.convert({
            file: videoFile ,
            modelId: "scribe_v2"
        })
        if("languageCode" in transcription && "text" in transcription) {
            if (transcription["languageCode"] !== "eng" && typeof(transcription["text"]) === "string" ) {
                return transcription.text; //add translation !!!!!!
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
            targetLang: "eng",
        })

        return dubbed;


    }

    


}