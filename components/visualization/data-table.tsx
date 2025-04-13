"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SortAsc, SortDesc, Table2, Download, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DataTable() {
  const [data, setData] = useState<any[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("rawResponse")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        const data = parsedData.data;
        // Ensure parsedData is an array
        if (Array.isArray(data)) {
          setData(data)
        } else {
          console.error("rawResponse is not an array:", parsedData)
          setData([]) // Set an empty array if data is invalid
        }
      } else {
        setData([]) // Default to an empty array if nothing is in localStorage
      }
    } catch (error) {
      console.error("Error parsing rawResponse from localStorage:", error)
      setData([]) // Avoid crashing by setting a fallback
    }
  }, [])
  
  // Extract column headers
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const valueA = a[sortColumn]
    const valueB = b[sortColumn]

    if (valueA === valueB) return 0
    if (valueA === null) return 1
    if (valueB === null) return -1

    const comparison = valueA < valueB ? -1 : 1
    return sortDirection === "asc" ? comparison : -comparison
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  // Get table name
  const tableName = columns.length > 0 ? columns[0].split("_")[0].toUpperCase() + " Data" : "Dataset"


  
  return (
    <TooltipProvider>
      <Card className="shadow-lg border-border">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full sm:w-[200px] bg-background/50 backdrop-blur-sm border-muted"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                />
              </div>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1) // Reset to first page when changing page size
                }}
              >
                <SelectTrigger className="w-[100px] bg-background/50 backdrop-blur-sm border-muted">
                  <SelectValue placeholder="10 entries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 entries</SelectItem>
                  <SelectItem value="10">10 entries</SelectItem>
                  <SelectItem value="15">15 entries</SelectItem>
                  <SelectItem value="25">25 entries</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-background/50 backdrop-blur-sm border-muted hover:bg-muted/30"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>
               
              </div>
            </div>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                {columns.map((column) => (
                  <TableHead key={column}>
                    <Button variant="ghost" size="sm" onClick={() => handleSort(column)}>
                      {column}
                      {sortColumn === column ? (
                        sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )
                      ) : (
                        <SortAsc className="h-4 w-4 opacity-30" />
                      )}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {row[column] ?? <span className="text-muted-foreground italic">null</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage - 2 + i
                if (totalPages <= 5) pageNum = i + 1
                else if (currentPage <= 3) pageNum = i + 1
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}

              <PaginationItem>
                <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
