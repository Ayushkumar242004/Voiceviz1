"use client"

import { useState, useEffect } from "react"
import { DataOverview } from "./data-overview"
import { DataTable } from "./data-table"
import { DataCharts } from "./data-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Database, Table2, BarChart3 } from "lucide-react"

// Sample data - replace with your actual data fetching logic
import { sampleData } from "./sample-data"

import Link from "next/link"; // Import Link for navigation

export default function DataVisualization() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      try {
        setTimeout(() => {
          setData(sampleData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-foreground">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Loader2 className="h-16 w-16 animate-spin text-primary absolute" />
            <div className="h-16 w-16 rounded-full border-4 border-primary/30 absolute"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium">Loading visualization data</p>
            <p className="text-muted-foreground">Preparing your insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md bg-card text-card-foreground border-border shadow-lg">
          <CardHeader className="bg-destructive/10 rounded-t-lg">
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription className="text-destructive/80">
              We encountered a problem while fetching your data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent animate-gradient-text">
            Data Visualization
          </span>
        </h1>
        <p className="text-muted-foreground">Analyze and visualize your data with interactive charts and tables</p>
      </div>

      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 ease-in-out flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            <span>Data Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 ease-in-out flex items-center gap-2"
          >
            <Table2 className="h-4 w-4" />
            <span>Table View</span>
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-200 ease-in-out flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Charts</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 fade-in">
          <DataOverview />
        </TabsContent>
        <TabsContent value="table" className="mt-6 fade-in">
          <DataTable />
        </TabsContent>
        <TabsContent value="charts" className="mt-6 fade-in">
          <DataCharts />
        </TabsContent>
      </Tabs>

      {/* Button to navigate to the query page */}
      <div className="flex justify-center mt-8">
        <Link href="/dashboard?tab=query">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-all">
          Check Another Visualization
          </button>
        </Link>
      </div>
    </div>
  );
}