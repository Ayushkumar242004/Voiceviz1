import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { SpeechClient, protos } from "@google-cloud/speech";

// Initialize the Google Speech client
let speechClient: SpeechClient;

try {
  speechClient = new SpeechClient(); // Automatically uses GOOGLE_APPLICATION_CREDENTIALS
} catch (error) {
  console.error("Error initializing Google Speech client:", error);
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the audio data from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate the audio file size (e.g., max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Audio file is too large" }, { status: 400 });
    }

    // Convert the file to a buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configure the request to Google Speech-to-Text
    const audio = {
      content: buffer.toString("base64"),
    };

    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: "WEBM_OPUS", // Update this if your audio format is different
      sampleRateHertz: 24000, // Set this to the correct sample rate of your audio file
      languageCode: "en-US",
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: audio,
      config: config,
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(request);

    if (!response || !response.results) {
      console.error("Invalid response from Speech-to-Text API:", response);
      return NextResponse.json({ error: "Invalid response from Speech-to-Text API" }, { status: 500 });
    }

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

    // Narrow the type of error
    if (error instanceof Error) {
      // Handle specific Google Speech API errors
      if ((error as any).code === 7) {
        return NextResponse.json({ error: "Permission denied. Check your API credentials." }, { status: 403 });
      } else if ((error as any).code === 3) {
        return NextResponse.json({ error: "Invalid audio format or configuration." }, { status: 400 });
      }

      return NextResponse.json({ error: error.message || "Failed to process speech to text" }, { status: 500 });
    }

    // Handle unknown error types
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}