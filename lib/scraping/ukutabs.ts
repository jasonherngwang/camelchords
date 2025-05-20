import * as cheerio from "cheerio";

export async function scrapeUkuTabs(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log("Raw html scrape: ", html)

    // UkuTabs content is enclosed in <pre class="qoate-code"> or similar
    const chordBlocks = $('pre.qoate-code, pre[class*="chords"]');

    if (chordBlocks.length === 0) {
      console.error("Could not find chord blocks on the page.");
      return null;
    }

    let chordProContent = "";

    chordBlocks.each((_, element) => {
      const $element = $(element);
      let currentLineContent = "";

      $element.contents().each((_, node) => {
        const $node = $(node);

        if (node.type === "tag") {
          if (node.name === "span" && $node.hasClass("cchrd")) {
            const $chordSpan = $node.find(".cch");
            const chord = $chordSpan.text().trim();
            if (chord) {
              // Add space only if the line has content and doesn't already end with space or bracket
              if (
                currentLineContent.length > 0 &&
                !/\s$|\]$/.test(currentLineContent)
              ) {
                currentLineContent += " ";
              }
              currentLineContent += `[${chord}]`;
            }
          } else if (node.name === "br") {
            // Handle explicit <br> tags as line breaks
            // Add the completed line if it has meaningful content
            const trimmedLine = currentLineContent.trim();
            if (trimmedLine) {
              chordProContent += trimmedLine + "\n";
            } else {
              // Preserve blank lines between sections if the original <pre> had them
              chordProContent += "\n";
            }
            currentLineContent = ""; // Reset for the next line
          }
          // *** Intentionally ignore other tags like other <span>, <a> etc. ***
          // This avoids grabbing potentially duplicate or unwanted text.
        } else if (node.type === "text") {
          // Append text node content
          // Replace newlines within the text node with spaces, then collapse multiple spaces
          let text = node.data.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");

          // Only add if it's not just whitespace
          if (text.trim().length > 0) {
            // Add space only if the line has content and doesn't already end with space or bracket
            if (
              currentLineContent.length > 0 &&
              !/\s$|\]$/.test(currentLineContent) &&
              !/^\s/.test(text)
            ) {
              currentLineContent += " ";
            }
            // Append the cleaned text, potentially trimming leading space if line was empty
            currentLineContent +=
              currentLineContent.length === 0 ? text.trimStart() : text;
          } else if (
            text.length > 0 &&
            currentLineContent.length > 0 &&
            !/\s$|\]$/.test(currentLineContent)
          ) {
            // If the text node was just space(s), add a single space for padding if needed
            currentLineContent += " ";
          }
        }
      });

      // Add any remaining content from the last line of the block
      const trimmedFinalLine = currentLineContent.trim();
      if (trimmedFinalLine) {
        chordProContent += trimmedFinalLine + "\n";
      }
      // Add separation between <pre> blocks if multiple exist
      chordProContent += "\n";
    });

    // Final cleanup: Remove leading/trailing whitespace and reduce multiple blank lines to max two
    chordProContent = chordProContent.trim().replace(/(\r?\n){3,}/g, "\n\n");

    return chordProContent; // Return the reconstructed ChordPro content
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}
