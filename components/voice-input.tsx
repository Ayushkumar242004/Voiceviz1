"use client"

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic,
  MicOff,
  Play,
  Loader2,
  FileAudio,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShowTable } from "@/components/show-tables";

export function VoiceInput({
  rawResponse,
  onRawResponseChange,
}: {
  rawResponse: string | null;
  onRawResponseChange: (newRawResponse: string) => void;
})  {
  
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [language, setLanguage] = useState("en");
  const [checking, setChecking] = useState(false);
  const [model, setModel] = useState("model_1");
  const [result, setResult] = useState<{
    isMalicious: boolean;
    message: string;
  } | null>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "ru", label: "Russian" },
    { code: "pt", label: "Portuguese" },
  ];



  useEffect(() => {
      if (typeof window !== "undefined") {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            // Permission granted, but we don't need to keep the stream open until recording
            stream.getTracks().forEach((track) => track.stop());
          })
          .catch((err) => {
            console.error("Microphone permission denied:", err);
            setError(
              "Microphone access denied. Please allow microphone access to use voice input."
            );
          });
      }
    }, []);

    const [check, setCheck] = useState(false);
   
  const checkSqlInjection = async (query: string) => {
    setChecking(true);
    try {
      const response = await fetch("https://m-s-973a.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model }),
      });
  
      const data = await response.json();
      console.log("SQL Injection API Response:", data);
  
      const isMalicious = data.prediction > 0.5;
      const message = isMalicious
        ? "⚠️ SQLi risk detected"
        : "✅ Query is safe";
  
      setResult({ isMalicious, message });

      if (isMalicious) {
        setCheck(true);
        window.alert("⚠️ WARNING: Using this query can be harmful to your database.");
      }
    } catch (err) {
      console.error("Error checking SQL injection:", err);
      setResult({ isMalicious: false, message: "Error during check" });
    } finally {
      setChecking(false);
    }
  };
  
    
  const handleStartRecording = async () => {
    setError(null);
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processAudioData();
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Failed to start recording. Please check your microphone permissions."
      );
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processAudioData = async () => {
    if (audioChunksRef.current.length === 0) {
      setError("No audio recorded. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Create audio blob and form data
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("language", language);

    
      // Send to your backend API
      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

        console.log("response",response);
      if (!response.ok) {
        throw new Error("Speech-to-text processing failed");
      }

      const data = await response.json();

      if (data.transcription) {
        setQuery(data.transcription);

        await convertToSQL(data.transcription, language);
      } else {
        setError(
          "Could not transcribe audio. Please try again or use text input."
        );
      }
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process audio. Please try again or use text input.");
    } finally {
      setIsProcessing(false);
    }
  };

  
  const convertToSQL = async (text: string, language: string) => {
    try {

      const tableResponse = localStorage.getItem("TableResponse");
      const response = await fetch("/api/text-to-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language,tableResponse }), // Include language here
      });

      if (!response.ok) {
        throw new Error("Text-to-SQL conversion failed");
      }

      const data = await response.json();

      if (data.sqlQuery) {
        setSqlQuery(data.sqlQuery);
        console.log(sqlQuery);
        toast({
          title: "Query generated",
          description: "Your voice has been converted to SQL successfully.",
        });
      } else {
        setError(
          "Could not generate SQL query. Please try again with a clearer request."
        );
      }
    } catch (err) {
      console.error("Error converting to SQL:", err);
      setError("Failed to convert text to SQL. Please try again.");
    }
  };

  const handleSubmitQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a query first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Fetch database connection details from localStorage
      const dbConnection = JSON.parse(
        localStorage.getItem("dbConnection") || "{}"
      );

      if (!dbConnection || !dbConnection.type || !dbConnection.host) {
        setError(
          "Database connection details are missing. Please connect to a database first."
        );
        return;
      }

      // Prepare the request body
      const requestBody = {
        ...dbConnection,
        query,
      };

      // Send the API request
      const response = await fetch(
        "http://localhost:3000/api/database/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Query executed",
          description: "Your query was executed successfully.",
        });

        onRawResponseChange(JSON.stringify(data, null, 2));

        console.log("rawResponse", rawResponse);

        localStorage.setItem("rawResponse", JSON.stringify(data, null, 2));
        // Log the response in the terminal

        localStorage.setItem("Query", query);
        window.location.href = "/dashboard/visualizations";

        // window.location.href = "http://localhost:3000/dashboard/visualizations";
      } else {
        setError(
          data.error ||
            "Failed to execute query. Please check your query and try again."
        );
      }
    } catch (err) {
      console.error("Error executing query:", err);
      setError(
        "An error occurred while executing the query. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    // Check file type
    if (
      !["audio/wav", "audio/mp3", "audio/mpeg", "audio/m4a"].includes(file.type)
    ) {
      setError("Unsupported file type. Please upload WAV, MP3, or M4A files.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      // Send to Google Speech-to-Text API
      const response = await fetch("/api/speech-to-text2", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Speech-to-text2 processing failed");
      }

      const data = await response.json();

      if (data.transcription) {
        setQuery(data.transcription);
        await convertToSQL(data.transcription, language);
      } else {
        setError(
          "Could not transcribe audio. Please try again or use text input."
        );
      }




    } catch (err) {
      console.error("Error processing audio file:", err);
      setError(
        "Failed to process audio file. Please try again or use text input."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const [showPopup, setShowPopup] = useState(false);
  const [hasDismissedPopup, setHasDismissedPopup] = useState(false);
  const [canRunQuery, setCanRunQuery] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const sensitiveKeywords = ['delete', 'drop', 'truncate'];

  const handleQueryChange = (e:any) => {
    const input = e.target.value;
    setQuery(input);
  
    const sensitiveKeywords = ['delete', 'drop', 'truncate', 'create','alter','insert','update','merge'];
    const containsSensitive = sensitiveKeywords.some(keyword =>
      input.toLowerCase().includes(keyword)
    );
  
    if (containsSensitive) {
      setShowPopup(true);
      setCanRunQuery(false); // temporarily disable
    } else {
      setShowPopup(false);
      setCanRunQuery(true);
      setShowWarning(false);
    }
  };
  
  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle>What Would You Like to Know?</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="voice">Voice Input</TabsTrigger>
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="file">Audio File</TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <div className="mb-4 w-full">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative mb-6">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${isRecording ? "bg-red-100 dark:bg-red-900/20 animate-pulse" : "bg-primary/10"}`}
                >
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="icon"
                    className="h-20 w-20 rounded-full"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-10 w-10 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="h-10 w-10" />
                    ) : (
                      <Mic className="h-10 w-10" />
                    )}
                  </Button>
                </div>
                {isRecording && (
                  <div className="absolute -bottom-2 left-0 right-0 text-center text-sm font-medium text-red-500">
                    Recording...
                  </div>
                )}
              </div>
              <p className="text-center text-muted-foreground mb-2">
                {isProcessing
                  ? "Processing your query..."
                  : isRecording
                    ? "Speak your query clearly..."
                    : "Press the microphone button and speak your query"}
              </p>
              {query && (
                <div className="mt-4 p-4 bg-muted rounded-md w-full">
                  <p className="font-medium">Recognized Query:</p>
                  <p className="text-muted-foreground">{query}</p>
                </div>
              )}
               {sqlQuery && (
                <div className="mt-4 p-4 bg-primary/10 rounded-md w-full">
                  <p className="font-medium">Generated SQL:</p>
                  <pre className="text-sm bg-muted p-2 rounded mt-2 overflow-x-auto">
                    {sqlQuery}
                  </pre>
                </div>
              )}

              
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
          <Textarea
        placeholder="Enter your SQL query here (e.g., 'Select * from users;')"
        className="min-h-[120px]"
        value={query}
        onChange={handleQueryChange}
      />

      {showWarning && (
        <p className="text-red-600 font-medium">Please change the query to enable execution.</p>
      )}
          <Button
  variant="outline"
  onClick={() => checkSqlInjection(query)}
  disabled={ checking}
  className="mb-4 w-full"
>
  {checking ? (
    <>
      <Loader2 className="animate-spin mr-2 h-4 w-4" />
      Checking...
    </>
  ) : result ? result.message : "Check SQL Injection"}
</Button>
          
          {showPopup && !hasDismissedPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div
      className="p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
      style={{ backgroundColor: "#09090B", border: "2px solid #8B43F1" }}
    >
      <h2 className="text-xl font-semibold text-red-600 mb-4">Sensitive Query Detected!</h2>
      <p className="mb-6 text-white">
        Are you sure you want to change the database? Once cancelled you cannot write any query that can update the database
      </p>
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setShowPopup(false);
            setHasDismissedPopup(true); // ✅ don't show again
            setCanRunQuery(false);
            setShowWarning(true);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setShowPopup(false);
            setCanRunQuery(true);
            setShowWarning(false);
          }}
        >
          Proceed
        </Button>
      </div>
    </div>
  </div>
)}

            {sqlQuery && (
              <div className="mt-4 p-4 bg-primary/10 rounded-md w-full">
                <p className="font-medium">Generated SQL:</p>
                <pre className="text-sm bg-muted p-2 rounded mt-2 overflow-x-auto">
                  {sqlQuery}
                </pre>
              </div>
            )}
             <Button
              className="w-full"
              onClick={handleSubmitQuery}
              disabled={!query.trim() || isProcessing||!canRunQuery ||check}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Query
                </>
              )}
            </Button>


          </TabsContent>

        
            
          

            {/* <ShowTable/> */}

          
            <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
              <FileAudio className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Drag and drop an audio file, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports MP3, WAV, M4A (Max 10MB)
              </p>
              <input
                type="file"
                id="audio-upload"
                className="hidden"
                accept="audio/wav,audio/mp3,audio/mpeg,audio/m4a"
                onChange={handleFileUpload}
                disabled={isProcessing }
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("audio-upload")?.click()}
                disabled={isProcessing}
              >
               
                  Browse Files
                
              </Button>
            </div>
           
            
            {query && (
                <div className="mt-4 p-4 bg-muted rounded-md w-full">
                  <p className="font-medium">Recognized Query:</p>
                  <p className="text-muted-foreground">{query}</p>
                </div>
              )}
               {sqlQuery && (
                <div className="mt-4 p-4 bg-primary/10 rounded-md w-full">
                  <p className="font-medium">Generated SQL:</p>
                  <pre className="text-sm bg-muted p-2 rounded mt-2 overflow-x-auto">
                    {sqlQuery}
                  </pre>
                </div>
              )}
             <Button
              className="w-full"
              onClick={handleSubmitQuery}
              disabled={!query.trim() || isProcessing||!canRunQuery}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Query
                </>
              )}
            </Button>

          </TabsContent>
          <ShowTable/>
        </Tabs>
      </CardContent>
    </Card>
  )
}

