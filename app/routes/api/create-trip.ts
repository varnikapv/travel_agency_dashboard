import {type ActionFunctionArgs, data} from "react-router";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {parseMarkdownToJson, parseTripData} from "~/lib/utils";
import {appwriteConfig, database} from "~/appwrite/client";
import {ID} from "appwrite";


export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const {
      country,
      numberOfDays,
      travelStyle,
      interests,
      budget,
      groupType,
      userId,
    } = await request.json();

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return data({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }
    if (!import.meta.env.VITE_UNSPLASH_ACCESS_KEY) {
      return data({ error: "Missing UNSPLASH_ACCESS_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const unsplashApiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const prompt = `
Create a ${numberOfDays}-day travel itinerary for ${country} with ${travelStyle} travel style, ${interests} interests, ${budget} budget, and ${groupType} group type.

Return ONLY valid JSON without markdown code blocks or explanations.

Required JSON structure:
{
  "name": "Descriptive trip title",
  "description": "Brief description (max 100 words)",
  "estimatedPrice": "$XXXX",
  "duration": ${numberOfDays},
  "budget": "${budget}",
  "travelStyle": "${travelStyle}",
  "country": "${country}",
  "interests": "${interests}",
  "groupType": "${groupType}",
  "bestTimeToVisit": ["Month 1", "Month 2", "Month 3"],
  "weatherInfo": ["Weather detail 1", "Weather detail 2"],
  "itinerary": [
    {
      "day": 1,
      "location": "City/Place name",
      "activities": [
        {
          "time": "9:00 AM",
          "description": "Activity description"
        },
        {
          "time": "12:00 PM",
          "description": "Activity description"
        }
      ]
    }
  ]
}

CRITICAL: Generate a COMPLETE itinerary array with ${numberOfDays} days. Each day MUST have 4-6 activities with specific times and descriptions. Do NOT return an empty itinerary array.
`;

    const textResult = await genAI
      .getGenerativeModel({ model: 'gemini-2.5-flash' })
      .generateContent(prompt);

    const raw = textResult.response.text();
    console.log("RAW GEMINI:", raw);

    let trip;
    try {
      // Try parsing as direct JSON first
      trip = JSON.parse(raw);
    } catch {
      // Fall back to markdown parser
      trip = parseMarkdownToJson(raw);
    }

    if (!trip) {
      return data({ error: "Failed to parse AI response" }, { status: 500 });
    }

    let imageUrls: string[] = [];
    try {
      const imageResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
      );
      const imageJson = await imageResponse.json();
      imageUrls = imageJson.results
        ?.slice(0, 3)
        .map((r: any) => r.urls?.regular)
        .filter(Boolean);
    } catch {}

    const result = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      ID.unique(),
      {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId,
      }
    );

    console.log('Trip created successfully with ID:', result.$id);
    return data({ id: result.$id }, { status: 200 });
  } catch (e) {
    console.error("Error generating travel plan:", e);
    return data(
      { error: e instanceof Error ? e.message : "Failed to generate trip" }, 
      { status: 500 }
    );
  }
};
