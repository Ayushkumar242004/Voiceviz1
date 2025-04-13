"use client"

import { useEffect, useState } from "react"
import JSZip from "jszip"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, BarChart3 } from "lucide-react"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DataCharts() {
  const [images, setImages] = useState<string[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shouldPromptQuery, setShouldPromptQuery] = useState(false)
  const [reportNotes, setReportNotes] = useState(""); // New state for user input


   useEffect(() => {
    const rawResponse = localStorage.getItem("rawResponse")
    if (!rawResponse) {
      setShouldPromptQuery(true)
      return
    }
    
    const fetchAndUnzipImages = async () => {
      try {
        const parsedResponse = JSON.parse(rawResponse)
        const data = parsedResponse.data

        if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
          setError("Invalid data format.")
          return
        }

        setLoading(true)
        setShouldPromptQuery(false)

        const res = await fetch("http://127.0.0.1:8000/generate-graphs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        })

        if (!res.ok) {
          throw new Error("Failed to fetch ZIP file.")
        }

        const zipBlob = await res.blob()
        const zip = await JSZip.loadAsync(zipBlob)

        const imagePromises = Object.keys(zip.files)
          .filter((fileName) => fileName.match(/\.(png|jpe?g|gif)$/i))
          .map(async (fileName) => {
            const fileData = await zip.files[fileName].async("blob")
            return URL.createObjectURL(fileData)
          })

        const imageUrls = await Promise.all(imagePromises)
        setImages(imageUrls)

        const txtFile = Object.keys(zip.files).find(name => name.endsWith(".txt"))
        if (txtFile) {
          const summaryText = await zip.files[txtFile].async("text")
          setSummary(summaryText)
        }

        if (imageUrls.length === 0 && !txtFile) {
          setError("No images or summary found in the ZIP file.")
        } else {
          setError(null)
        }
      } catch (err: any) {
        console.error("Image unzip error:", err)
        setImages([])
        setSummary(null)
        setError("Failed to extract data from ZIP.")
      } finally {
        setLoading(false)
      }
    }

    fetchAndUnzipImages()
  }, [])


  const handleDownloadReport = async () => {
    const rawResponse = localStorage.getItem("rawResponse")
  
    if (!rawResponse) {
      alert("No raw response found. Please run a query first.")
      return
    }
  
    try {
      const parsed = JSON.parse(rawResponse)
      const res = await fetch("http://127.0.0.1:8000/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: parsed.data,
          notes: reportNotes || "", // Ensure it's defined
        }),
      })
  
      if (!res.ok) {
        throw new Error("Failed to generate report.")
      }
  
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "business_report.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Report download failed:", error)
      alert("Failed to download report. Please try again.")
    }
  }
  

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-border max-w-4xl mx-auto mt-8">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Chart Visualization
              </CardTitle>
              <CardDescription>
                These charts are AI-generated based on your uploaded data.
              </CardDescription>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
  <input
    type="text"
    value={reportNotes}
    onChange={(e) => setReportNotes(e.target.value)}
    placeholder="Any specific things you want in the report"
    className="border border-gray-300 rounded-md p-2 w-full sm:w-96 text-sm"
  />
  <Button
    variant="default"
    className="text-white w-full sm:w-auto"
    onClick={handleDownloadReport}
  >
    Download Report
  </Button>
</div>

            </div>
            <div>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/50 backdrop-blur-sm border-muted hover:bg-muted/30"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>These charts are automatically generated from the raw data using AI.</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-wrap justify-center items-center gap-4">
          {shouldPromptQuery && <p className="text-muted-foreground">Run Query</p>}
          {loading && <p className="text-muted-foreground">Generating charts...</p>}
          {error && images.length === 0 && <p className="text-red-500">{error}</p>}
          {images.length > 0 &&
            images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Generated Chart ${idx + 1}`}
                className="w-full sm:w-[95%] lg:w-[1000px] max-h-[700px] object-contain rounded-xl border shadow-lg"
              />
            ))}

          {summary && (
            <div className="w-full mt-6 p-4 bg-muted rounded-xl border">
              <h3 className="text-lg font-semibold mb-2 text-primary">AI Analysis</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}