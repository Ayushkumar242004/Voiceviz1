import { useState , useEffect} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
import  {TableDesc} from "./table-desc";

const formSchema = z.object({
  type: z.string().min(1, { message: "Please select a database type." }),
  host: z.string().min(1, { message: "Host is required." }),
  port: z.string().optional(),
  database: z.string().min(1, { message: "Database name is required." }),
  username: z.string().optional(),
  password: z.string().optional(),
});

export function ShowTable() {
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query] = useState("SELECT TABLE_NAME,COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, ORDINAL_POSITION;");
  const [queryPostgres] = useState("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;");
  const [developerMode, setDeveloperMode] = useState(false); // Toggle state for developer mode

  const dbConnection = JSON.parse(localStorage.getItem("dbConnection") || "{}");
  const [tableNames, setTableNames] = useState<string[]>([]);

  function cleanGeminiJsonResponse(responseText: string): string {
    // First, try to extract JSON from between ```json and ```
    const jsonBlockMatch = responseText.match(/```json([\s\S]*?)```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      return jsonBlockMatch[1].trim();
    }
  
    // If no ```json markers found, try extracting between ``` only
    const genericBlockMatch = responseText.match(/```([\s\S]*?)```/);
    if (genericBlockMatch && genericBlockMatch[1]) {
      return genericBlockMatch[1].trim();
    }
  
    // If no code blocks found at all, try to find the first {...} in the text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0].trim();
    }
  
    // If all else fails, return the original text and hope it's valid JSON
    return responseText.trim();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: dbConnection.type || "",
      host: dbConnection.host || "",
      port: dbConnection.port || "",
      database: dbConnection.database || "",
      username: dbConnection.username || "",
      password: dbConnection.password || "",
    },
  });

  useEffect(() => {
    if (rawResponse) {
      const extractedTables = extractTableNames(rawResponse);
      setTableNames(extractedTables);
    }
  }, [rawResponse]);
  const extractTableNames = (text: string): string[] => {
    const tableNames: string[] = [];
    const regex = /"TABLE_NAME"\s*:\s*"([^"]+)"/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        tableNames.push(match[1]);
      }
    }
    
    // Remove duplicates
    return [...new Set(tableNames)];
  };

  const onConnect = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/database/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setIsConnected(true);
        toast({
          title: "Connection successful",
          description: "Your database has been connected successfully.",
        });

        localStorage.setItem("dbConnection", JSON.stringify(values));
        return true;
      } else {
        toast({
          title: "Connection failed",
          description: data.error || "Failed to connect to database.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An error occurred while connecting to the database.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const ExecuteShow = async () => {
    if (!query.trim()) {
      setError("Please enter a query first.");
      return;
    }
  
    setIsProcessing(true);
    setError(null);
  
    try {
      const dbConnection = JSON.parse(localStorage.getItem("dbConnection") || "{}");
  
      if (!dbConnection?.type || !dbConnection?.host) {
        setError("Missing DB connection details.");
        return;
      }
  
      const bodyPayload = {
        ...dbConnection,
        query: dbConnection.type?.toLowerCase() === "mysql" ? query : queryPostgres,
      };
  
      // Fetch table and column data from the database
      const response = await fetch("/api/database/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast({ title: "Query executed", description: "Successfully fetched data." });
  
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Return ONLY raw JSON (without any markdown or code block formatting) with this exact structure, adding a one liner description of the each column:
                      {
                        "success": boolean,
                        "data": [
                          {
                            "TABLE_NAME": string,
                            "COLUMN_NAME": string,
                            "DESCRIPTION": string
                          }
                        ]
                      }
                      
                      Here is the data to format:
                      ${JSON.stringify(data)}`
                    }
                  ]
                }
              ]
            })
          }
        );
        
        const geminiData = await geminiResponse.json();
        
        if (geminiResponse.ok) {
          const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          const cleanJson = cleanGeminiJsonResponse(responseText);
          
          try {
            const parsedData = JSON.parse(cleanJson);
            setRawResponse(JSON.stringify(parsedData, null, 2)); // Pretty-printed for display
            localStorage.setItem("tableDescriptions", cleanJson); // Store the clean version
          } catch (e) {
            console.error("Failed to parse cleaned JSON:", e);
            setError("Failed to parse table descriptions.");
          }
        } else {
          setError("Failed to get descriptions from Gemini.");
        }} else {
        setError(data.error || "Failed to execute query.");
      }
    } catch (err) {
      setError("Error executing query. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const handleManualLoad = async () => {
    setIsLoading(true);
    const success = await onConnect(form.getValues());
    if (success) {
      await ExecuteShow();
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Show Tables</CardTitle>
        <div className="flex items-center gap-4">
          <span>Developer Mode</span>
          <Switch
            checked={developerMode}
            onCheckedChange={(checked) => setDeveloperMode(checked)}
          />
          <Button
            onClick={handleManualLoad}
            disabled={isLoading || isSubmitting || isProcessing}
          >
            {isLoading || isSubmitting || isProcessing ? "Loading..." : "Load Tables"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-auto border p-2 bg-gray-900">
          {isLoading || isSubmitting || isProcessing ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-6 w-6 animate-spin text-white">
                <Loader />
              </div>
            </div>
          ) : developerMode ? (
            rawResponse ? (
              <div>
                <pre className="text-sm text-white whitespace-pre-wrap">
                  {rawResponse}
                </pre>
                <div className="mt-4 p-4 bg-gray-800 rounded">
                  <h3 className="font-bold text-white mb-2">Extracted Table Names:</h3>
                  <ul className="list-disc pl-5 text-white">
                    {tableNames.map((table, index) => (
                      <li key={index}>{table}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data available.</p>
            )
          ) : tableNames.length > 0 ? (
            <div className="text-white">
              <h3 className="font-bold mb-2">Available Tables:</h3>
              <ul className="list-disc pl-5">
                {tableNames.map((table, index) => (
                  <li key={index}>{table}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tables found.</p>
          )}
        </div>
        
      </CardContent>
    </Card>

  );
}