import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SpeechClient, protos } from "@google-cloud/speech";
import * as fs from 'fs';
import * as path from 'path';

// Decode the base64 credentials from the environment variable
const googleCredentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!googleCredentialsBase64) {
  throw new Error("Google credentials are missing in environment variables");
}

// Decode the credentials
const googleCredentials = Buffer.from(googleCredentialsBase64, "base64").toString("utf-8");

// Write the decoded JSON to a temporary file (Google Cloud SDK expects a file)
const credentialsPath = path.join(__dirname, 'google-credentials.json');
fs.writeFileSync(credentialsPath, googleCredentials);

// Initialize the Google Speech client using the credentials file
let speechClient: SpeechClient;

try {
  speechClient = new SpeechClient({ keyFilename: credentialsPath });
} catch (error) {
  console.error("Error initializing Google Speech client:", error);
}

export async function POST(req: Request) {
  try {
    // Get the audio data from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const languageCode = formData.get("language") as string;
    console.log("languageCode", languageCode);

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert the file to a buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configure the request to Google Speech-to-Text
    const audio = {
      content: buffer.toString("base64"),
    };

    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: "WEBM_OPUS",
      languageCode: languageCode, // Dynamic language from frontend
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: audio,
      config: config,
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map((result: protos.google.cloud.speech.v1.ISpeechRecognitionResult) =>
        result.alternatives?.[0]?.transcript
      )
      .filter(Boolean)
      .join("\n");

    if (!transcription) {
      return NextResponse.json({ error: "No transcription available" }, { status: 400 });
    }

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json({ error: "Failed to process speech to text" }, { status: 500 });
  }
}
