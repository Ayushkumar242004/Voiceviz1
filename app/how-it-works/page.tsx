import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Database, LineChart, FileText, BrainCircuit } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      title: "Connect Your Database",
      description:
        "Begin by securely connecting your preferred database to the platform. Currently, our application supports MySQL and PostgreSQL database.",
      icon: Database,
    },
    {
      title: "Speak or Upload a Audio File",
      description: "Start by using your microphone to ask a question or upload a pre-recorded audio file. Our system supports both real-time and file-based input.",
      icon: Mic,
    },
    {
      title: "AI Translates Voice to SQL Query",
      description: "Our AI-powered engine listens to your query and converts it into an accurate SQL command using natural language processing.",
      icon: Database,
    },
    {
      title: "Execute Query and Retrieve Data",
      description: "The SQL query is executed on your connected database to fetch relevant data in real time.",
      icon: Database,
    },
    {
      title: "Generate Visualizations Instantly",
      description: "Your data is automatically turned into meaningful charts or graphs—bar charts, line graphs, pie charts—based on the context of your query.",
      icon: LineChart,
    },
    {
      title: "Download Reports & Dig Deeper",
      description: "Export your findings in a comprehensive report format, or continue the conversation by asking follow-up questions for more insights.",
      icon: FileText,
    },
  ]

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset>
        <main className="p-6 max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">How It Works</h1>
            <p className="text-muted-foreground text-lg">
            Turn voice commands into powerful data stories in just a few simple steps.            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="border border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    <step.icon size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Step {index + 1}: {step.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <BrainCircuit className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">AI-Powered Technology</h2>
            </div>
            <p className="text-muted-foreground">
              VoiceViz leverages cutting-edge natural language processing and deep learning models to understand your voice
              inputs, convert them into SQL queries, and generate interactive data visualizations. The more you use it, the smarter
              it gets—continuously learning from your queries to provide faster and more precise results over time.
            </p>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}

