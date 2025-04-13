import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, databaseType = "mysql", language = "English" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

  
    // Build Gemini prompt with language included
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `The following query is written in ${language}.Keep it in that language only, but then convert it into a strict SQL query in English for a ${databaseType} database:\n\n"${text}"\n\nReturn only the SQL query without any explanation or markdown or any special character or bullet points asterisks. Autocomplete the query if it's incomplete.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseBody = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", responseBody);

    if (!response.ok) {
      console.error("Gemini API error:", responseBody);
      throw new Error(`Gemini API request failed: ${responseBody}`);
    }

    const data = JSON.parse(responseBody);

    const sqlQuery = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!sqlQuery) {
      console.error("Invalid response structure:", data);
      return NextResponse.json({ error: "Failed to generate SQL query" }, { status: 500 });
    }

    return NextResponse.json({ sqlQuery });
  } catch (error) {
    console.error("Text-to-SQL error:", error);
    return NextResponse.json({ error: "Failed to convert text to SQL" }, { status: 500 });
  }
}
