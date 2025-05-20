import { NextRequest, NextResponse } from "next/server";
import { scrapeUkuTabs } from "@/lib/scraping/ukutabs";
import { _formatChordProWithAI } from "@/lib/actions/library";
import { getUser } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  let rawScrapedContent: string | null = null;
  let urlToScrape: string | null = null;

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    urlToScrape = body.url;

    if (!urlToScrape || typeof urlToScrape !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(urlToScrape);
    } catch (_) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    console.log(`Scraping URL: ${urlToScrape}`);
    rawScrapedContent = await scrapeUkuTabs(urlToScrape);

    if (rawScrapedContent === null) {
      return NextResponse.json(
        { error: "Failed to scrape raw content from the provided URL." },
        { status: 500 }
      );
    }

    console.log("Formatting scraped content with AI...");
    const formatResult = await _formatChordProWithAI(rawScrapedContent);

    if (formatResult.error || !formatResult.data) {
      console.error("AI Formatting Error:", formatResult.error);
      return NextResponse.json(
        { error: formatResult.error || "AI formatting failed unexpectedly." },
        { status: 500 }
      );
    }

    const formattedContent = formatResult.data;

    console.log("Scraping and formatting successful.");

    return new NextResponse(formattedContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[API_SCRAPE_ERROR]", error);
    if (error instanceof SyntaxError && !rawScrapedContent) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with a "url" field.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "An unexpected error occurred during the scrape/format process.",
      },
      { status: 500 }
    );
  }
}
