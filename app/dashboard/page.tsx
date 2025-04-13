"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "../../components/app-sidebar"
import { VoiceInput } from "../../components/voice-input"
import { TableDesc } from "../../components/table-desc"
import { SidebarInset } from "../../components/ui/sidebar"
import { motion } from "framer-motion"
import { DatabaseConnection } from "@/components/database-connection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Astronaut3D } from "@/components/astronaut3D";
import { AIChatAssistant } from "@/components/ai-chat-assistant"

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "connect"
  const [dbConnected, setDbConnected] = useState(false)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userName = users.length > 0 ? users[0].name : "User";
  const [activeTab, setActiveTab] = useState("connect");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    // Check if database is connected
    const checkConnection = () => {
      const dbConnection = localStorage.getItem("dbConnection")
      setDbConnected(!!dbConnection)
    }

    checkConnection() // Initial check

    // Keep checking every 2 seconds for any update
    const interval = setInterval(checkConnection, 2000)

    // Clean up interval on unmount
    return () => clearInterval(interval)

    if (!searchParams.get("tab")) {
      router.replace("/dashboard?tab=connect")
    }
  
  }, [status, router, searchParams])

  const handleTabChange = (value: string) => {
    router.push(`/dashboard?tab=${value}`)
  }
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-4">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
                <div>
               <h1 className="text-3xl font-bold">Dashboard</h1>
               <div className="flex items-center gap-1 pt-1">
     <span className={`w-3 h-3 rounded-full ${dbConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
     <span className="text-sm font-medium text-muted-foreground">
       {dbConnected ? 'Connected' : 'Not Connected'}
     </span>
   </div>
               <p className="text-muted-foreground pt-1">
                 Welcome back, {userName}! Convert your voice to SQL queries and visualize your data.
               </p>
             </div>
             
          
          </motion.div>
  
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="connect">Database Connection</TabsTrigger>
              <TabsTrigger value="query">
                Voice to SQL
              </TabsTrigger>
            </TabsList>
  
            <TabsContent value="connect">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <DatabaseConnection />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-muted/30 p-6 rounded-lg border border-border/50"
                >

                {/* Add the Astronaut3D component */}
                <div className="absolute bottom-[10em] right-10 transform -translate-x-1/2">
                  <Astronaut3D />
                </div>

                  <h2 className="text-xl font-semibold mb-4">Why Connect Your Database?</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                        1
                      </span>
                      <span>Securely connect to MySQL, PostgreSQL, or MongoDB databases</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                        2
                      </span>
                      <span>Convert natural language and voice to SQL queries specific to your schema</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                        3
                      </span>
                      <span>Visualize your actual data with charts and graphs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                        4
                      </span>
                      <span>Your credentials are encrypted and stored securely</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </TabsContent>
  
            <TabsContent value="query">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  className="flex-1 flex flex-col gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <VoiceInput rawResponse={rawResponse} onRawResponseChange={setRawResponse} />
                </motion.div>
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <TableDesc />
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
      <AIChatAssistant />
    </div>
  )
}


