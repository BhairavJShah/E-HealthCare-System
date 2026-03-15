"use client";

import { useEffect, useState } from "react";
import { pipeline, TextGenerationPipeline } from "@xenova/transformers";

let healthAssistant: TextGenerationPipeline | null = null;

export function useHealthAI() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initAI() {
      if (!healthAssistant) {
        setLoading(true);
        // Using a tiny model that fits in browser memory
        // 'Xenova/gpt-2' or 'Xenova/LaMini-GPT-124M' are good candidates
        try {
          healthAssistant = await pipeline("text-generation", "Xenova/LaMini-GPT-124M") as TextGenerationPipeline;
          setReady(true);
        } catch (error) {
          console.error("AI Initialization failed:", error);
        }
        setLoading(false);
      } else {
        setReady(true);
      }
    }
    initAI();
  }, []);

  const askHealthQuestion = async (input: string) => {
    if (!healthAssistant) return "AI is still loading...";
    
    // Add health context to the prompt
    const prompt = `Health Assistant: Answer the following medical question briefly and provide a disclaimer that this is not professional medical advice.\n\nUser: ${input}\nAssistant:`;
    
    const output = await healthAssistant(prompt, {
      max_new_tokens: 100,
      temperature: 0.7,
    });

    if (Array.isArray(output)) {
      return (output[0] as any).generated_text.replace(prompt, "").trim();
    }
    return "I am unable to process that request right now.";
  };

  return { ready, loading, askHealthQuestion };
}
