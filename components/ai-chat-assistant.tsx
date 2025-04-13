"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, X, Minimize, Maximize, Bot, Trash } from "lucide-react";

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today? Please select an option below:",
    },
  ])
  const filterGeminiResponse = (text: string): string => {
    return text
      .replace(/\*\*/g, "")                  // Remove all double asterisks (bold)
      .replace(/\*([^*]+)\*/g, "$1")         // Remove single asterisks used for italics/emphasis
      .replace(/^\s*\* /gm, "- ")            // Replace bullet `*` with dash `-`
      .replace(/\n{2,}/g, "\n")              // Collapse multiple newlines
      .replace(/[ \t]+\n/g, "\n")            // Trim trailing spaces before newlines
      .replace(/\n[ \t]+/g, "\n")            // Remove leading indentation after newlines
      .trim();                               // Trim whitespace
  };  

  const [showOptions, setShowOptions] = useState(true)

  const predefinedQuestions = [
    { question: "What is VoiceViz?", answer: "VoiceViz is a tool that helps you visualize and analyze voice data." },
    { question: "How do I upload data?", answer: "You can upload data by clicking on the 'Upload' button in the dashboard." },
    { question: "How do I interpret the results?", answer: "The results are displayed as graphs and charts. Hover over them for detailed insights." },
    { question: "Some other help", answer: null },
    { question: "End chat", answer: "Thank you for chatting with me. Have a great day!" },
  ]

  const handleOptionClick = (option: string) => {
    if (option === "Some other help") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: option },
        { role: "assistant", content: "Please type your query below, and I'll do my best to assist you." },
      ])
      setShowOptions(false)
    } else if (option === "End chat") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: option },
        { role: "assistant", content: "Thank you for chatting with me. Have a great day!" },
      ])
      setShowOptions(false)
    } else {
      const selectedAnswer = predefinedQuestions.find((q) => q.question === option)?.answer
      setMessages((prev) => [
        ...prev,
        { role: "user", content: option },
        { role: "assistant", content: selectedAnswer || "I'm sorry, I don't have an answer for that." },
        { role: "assistant", content: "Would you like to ask anything else? Select an option below or click 'End chat' to exit." },
      ])
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = { role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    try {
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: message+ " in 3 lines",
              },
            ],
          },
        ],
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!apiKey) {
        throw new Error("API key not defined in NEXT_PUBLIC_GEMINI_API_KEY")
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      const data = await response.json()
      console.log("Gemini raw response:", data)

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(data)}`)
      }

      let rawGeminiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I didn't understand that."
      rawGeminiReply= filterGeminiResponse(rawGeminiReply);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: rawGeminiReply },
        { role: "assistant", content: "Would you like to ask anything else? Select an option below or click 'End chat' to exit." },
      ])
      setShowOptions(true)
    } catch (error) {
      console.error("Gemini API Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong while contacting Gemini." },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
        <Bot className="h-5 w-5" />
        <span className="font-medium">AI Assistant</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          onClick={() => setIsMinimized(false)}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const handleClearMessages = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today? Please select an option below:",
      },
    ])
    setShowOptions(true)
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-lg border border-border/50">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClearMessages}
            title="Clear chat"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 h-80 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        ))}
        {showOptions && (
          <div className="flex flex-col gap-2 mt-4">
            {predefinedQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left"
                onClick={() => handleOptionClick(q.question)}
              >
                {q.question}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      {!showOptions && (
        <CardFooter className="p-3 pt-0">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="Type your query..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}