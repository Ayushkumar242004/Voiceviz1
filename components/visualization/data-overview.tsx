import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Key, FileType, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ColumnTypes = Record<string, string>;

export function DataOverview() {
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const [totalColumns, setTotalColumns] = useState<number | null>(null);
  const [primaryKey, setPrimaryKey] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnTypes, setColumnTypes] = useState<ColumnTypes>({});

  useEffect(() => {
    const rawResponse = localStorage.getItem("rawResponse");
    
    if (rawResponse) {
      try {
        const parsedResponse = JSON.parse(rawResponse);
const data = parsedResponse.data;
       
        if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
          
          return;
        }

        const entries = data.length;
        
        const columnNames = Object.keys(data[0]);

        const columnCount = columnNames.length;
        
        const detectedColumnTypes: ColumnTypes = columnNames.reduce((acc: ColumnTypes, column: string) => {
          const sampleValue = (data[0] as Record<string, unknown>)[column];
          let type: string;

          if (sampleValue === null) type = "null";
          else if (Array.isArray(sampleValue)) type = "array";
          else type = typeof sampleValue;

          acc[column] = type;
          return acc;
        }, {});

        setTotalEntries(entries);
        setTotalColumns(columnCount);
        setColumns(columnNames);
        setColumnTypes(detectedColumnTypes);
        setPrimaryKey(columnNames.length > 0 ? columnNames[0] : null);
      } catch (error) {
        console.error("Error parsing rawResponse from localStorage:", error);
      }
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border shadow-lg card-hover">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Dataset Summary
            </CardTitle>
            <CardDescription>Overview of the dataset structure and size</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 bg-muted/20 p-4 rounded-lg transition-all hover:bg-muted/30">
                <h3 className="text-sm font-medium text-muted-foreground">Total Entries</h3>
                <p className="text-3xl font-bold text-primary">{totalEntries ?? "N/A"}</p>
                <p className="text-xs text-muted-foreground">Rows in dataset</p>
              </div>
              <div className="space-y-2 bg-muted/20 p-4 rounded-lg transition-all hover:bg-muted/30">
                <h3 className="text-sm font-medium text-muted-foreground">Total Columns</h3>
                <p className="text-3xl font-bold text-primary">{totalColumns ?? "N/A"}</p>
                <p className="text-xs text-muted-foreground">Fields per entry</p>
              </div>
              {primaryKey && (
                <div className="col-span-2 space-y-2 bg-muted/20 p-4 rounded-lg transition-all hover:bg-muted/30">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Primary Key
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The unique identifier for each record</p>
                      </TooltipContent>
                    </Tooltip>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <span className="font-medium text-lg">{primaryKey}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-lg card-hover">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5 text-primary" />
              Column Details
            </CardTitle>
            <CardDescription>Information about each column in the dataset</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-h-[300px] overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Key</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column, index) => (
                    <TableRow key={column} className={`table-row-hover ${index % 2 === 0 ? "bg-muted/10" : ""}`}>
                      <TableCell className="font-medium">{column}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/20 hover:bg-muted/30 transition-colors">
                          {columnTypes[column] ?? "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {column === primaryKey && (
                          <Badge className="bg-primary text-primary-foreground badge-pulse">Primary</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}