import { config } from "../../config/env.js";

export const categorizeWithAI = async (note, windows) => {
  try {

    const windowData = windows.map(w => ({
      name: w.name,
      labels: w.labels
    }));

    const prompt = `
        You are categorizing a financial transaction.

        Transaction note:
        "${note}"

        Available expense windows:
        ${JSON.stringify(windowData)}

        Return ONLY the window name that best matches or related to the note indirectly.
        `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.openrouter.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",   // optional
        "X-OpenRouter-Title": "Expense Categorizer" // optional
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content?.trim();

    console.log("AI Result:", result);

    return result || "DEFAULT";

  } catch (error) {
    console.log("AI categorization failed:", error.message);
    return "DEFAULT";
  }
};