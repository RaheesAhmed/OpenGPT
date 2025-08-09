import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { message, files, apiKey, model = "gpt-4o-mini" } = await request.json();

    // Validate required fields
    if (!message && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: "Message or files are required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI with user's API key
    const openai = new OpenAI({ apiKey });

    // Build the content array for the input
    const content: any[] = [];

    // Add text message if provided
    if (message && message.trim()) {
      content.push({
        type: "input_text",
        text: message.trim()
      });
    }

    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file: any) => {
        if (file.type?.startsWith('image/')) {
          // Handle image files
          content.push({
            type: "input_image",
            image_url: file.content // Base64 data URL
          });
        } else if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
          // Handle PDF files
          content.push({
            type: "input_file",
            file_url: file.content // Base64 data URL or file path
          });
        } else {
          // Handle other text files by adding their content as text
          content.push({
            type: "input_text",
            text: `File: ${file.name}\n\n${file.content}`
          });
        }
      });
    }

    // Create the response using the new OpenAI API
    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "user",
          content
        }
      ],
      tools: [{ type: "web_search_preview" }],
    });

    // Extract the text content from the new responses API structure
    let messageText = "No response received";
    
    if (response.output && response.output.length > 0) {
      const firstOutput = response.output[0];
      // Check if this is a message type output (not a tool call)
      if (firstOutput.type === "message" && "content" in firstOutput) {
        const messageOutput = firstOutput as any; // Type assertion to access content
        if (messageOutput.content && messageOutput.content.length > 0) {
          // Find the output_text content
          const textContent = messageOutput.content.find((item: any) => item.type === "output_text");
          if (textContent && textContent.text) {
            messageText = textContent.text;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: messageText,
      usage: response.usage
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    } else if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    } else if (error?.status === 400) {
      return NextResponse.json(
        { error: "Bad request: " + (error.message || "Invalid request format") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
