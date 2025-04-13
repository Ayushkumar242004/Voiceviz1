"use client";
import { useEffect, useState } from "react";

interface Field {
  name: string;
  DESCRIPTION: string;
}

interface TableData {
  name: string;
  fields: Field[];
}

interface RawTableData {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DESCRIPTION: string; // Note the uppercase field name
}

export function TableDesc() {
  const [databaseTables, setDatabaseTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("tableDescriptions");
      if (!storedData) {
        throw new Error("No table data found in localStorage");
      }

      const parsedData: { success: boolean; data: RawTableData[] } = JSON.parse(storedData);
      
      if (!parsedData.success || !parsedData.data) {
        throw new Error("Invalid data format in localStorage");
      }

      // Transform the raw data into our TableData format
      const tablesMap: Record<string, Field[]> = {};

      parsedData.data.forEach((item) => {
        if (!tablesMap[item.TABLE_NAME]) {
          tablesMap[item.TABLE_NAME] = [];
        }
        tablesMap[item.TABLE_NAME].push({
          name: item.COLUMN_NAME,
          DESCRIPTION: item.DESCRIPTION // Using the correct field name
        });
      });

      const transformedData: TableData[] = Object.entries(tablesMap).map(([name, fields]) => ({
        name,
        fields
      }));

      setDatabaseTables(transformedData);
      setSelectedTable(transformedData[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load table data");
      }
    }, []);

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const table = databaseTables.find((t) => t.name === e.target.value);
    setSelectedTable(table || null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border-l-4 border-red-500 p-4">
          <h2 className="text-xl font-bold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {databaseTables.length === 0 ? "No tables found" : "Loading..."}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-semibold text-2xl text-white">Tables Description</h1>
        <div className="mb-6 mt-3 text-white flex">
          <select
            id="table-select"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white text-gray-800"
            value={selectedTable.name}
            onChange={handleTableChange}
          >
            {databaseTables.map((table) => (
              <option key={table.name} value={table.name}>
                {table.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-purple-700 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-white">{selectedTable.name}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-100 text-purple-800 font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                    Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedTable.fields.map((field, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {field.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {field.DESCRIPTION}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}