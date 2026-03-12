import { categorizeWithAI } from "./geminiCategorizer.util.js";

export const matchExpenseWindow = async (note, windows) => {

  // ---- STEP 1: Normal Loop (unchanged) ----

  const text = note.toLowerCase();

  for (const window of windows) {

    for (const label of window.labels) {

      if (text.includes(label.toLowerCase())) {
        return window;
      }

    }
  }

  // ---- STEP 2: AI Categorization ----

  try {

    const aiResult = await categorizeWithAI(note, windows);
    console.log("AI Result:", aiResult);

    if (!aiResult || aiResult === "DEFAULT") {
      return null;
    }

    const matchedWindow = windows.find(
      w => aiResult.toLowerCase().includes(w.name.toLowerCase())
    );

    return matchedWindow || null;

  } catch (error) {

    console.error("AI categorization failed:", error);
    return null;

  }

};