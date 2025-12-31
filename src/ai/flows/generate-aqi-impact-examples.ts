"use server";
/**
 * @fileOverview Generates relatable examples of the impact of the current AQI.
 *
 * - generateAqiImpactExamples - A function that handles the generation of AQI impact examples.
 * - GenerateAqiImpactExamplesInput - The input type for the generateAqiImpactExamples function.
 * - GenerateAqiImpactExamplesOutput - The return type for the generateAqiImpactExamples function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateAqiImpactExamplesInputSchema = z.object({
  aqi: z.number().describe("The current Air Quality Index (AQI)."),
  location: z.string().describe("The location for which the AQI is reported."),
});
export type GenerateAqiImpactExamplesInput = z.infer<
  typeof GenerateAqiImpactExamplesInputSchema
>;

const GenerateAqiImpactExamplesOutputSchema = z.object({
  examples: z
    .array(z.string())
    .describe(
      'A list of 4 short, relatable examples of the AQI impact with India-specific comparisons and a practical health tip.',
    ),
});
export type GenerateAqiImpactExamplesOutput = z.infer<
  typeof GenerateAqiImpactExamplesOutputSchema
>;

export async function generateAqiImpactExamples(
  input: GenerateAqiImpactExamplesInput,
): Promise<GenerateAqiImpactExamplesOutput> {
  return generateAqiImpactExamplesFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateAqiImpactExamplesPrompt",
  input: { schema: GenerateAqiImpactExamplesInputSchema },
  output: { schema: GenerateAqiImpactExamplesOutputSchema },
  prompt: `You are a witty, relatable Indian environmental assistant. Your mission is to translate Air Quality Index (AQI) numbers into easy-to-understand comparisons that Indians can instantly relate to.

  Location: {{location}}
  AQI: {{aqi}}

  Generate 4 short, punchy, and relatable examples of the AQI's impact. Make them feel REAL to everyday Indian life.

  Use these categories (pick 4 that fit best for this AQI level):

  🚬 CIGARETTE EQUIVALENT:
  - "Cigarettes breathed today: X cigarettes" - Based on research showing PM2.5 to cigarette equivalents

  ⏰ HEALTH IMPACT:
  - "Life expectancy reduced: X hours/days per year of exposure" - Based on WHO data

  🇮🇳 INDIAN LIFE COMPARISONS (use at least 2 of these):
  - "Like standing behind an auto-rickshaw in traffic for X minutes"
  - "Similar to being at a Diwali night with crackers for X hours"
  - "Like cooking on a wood chulha in a closed kitchen"
  - "Equivalent to being at a busy construction site for X hours"
  - "Like walking through a crowded bus stand during peak hours"
  - "Similar to standing near a garbage burning site"
  - "Like being in Mumbai/Delhi traffic during rush hour"
  - "Equivalent to sitting near an idling truck for X minutes"

  💡 PRACTICAL TIP (always include one):
  - For AQI 0-50: "Perfect for morning jog or outdoor yoga!"
  - For AQI 51-100: "Sensitive people should limit outdoor exercise"
  - For AQI 101-150: "Consider wearing a mask if going out for long"
  - For AQI 151-200: "Kids and elderly should stay indoors"
  - For AQI 201-300: "Everyone should wear N95 mask outdoors"
  - For AQI 300+: "Avoid going outside. Keep windows closed!"

  RULES:
  - Be scientifically accurate but conversational
  - Use realistic numbers based on actual AQI health research
  - For low AQI (0-50), show positive impacts, be encouraging
  - For moderate AQI (51-100), be cautiously optimistic
  - For unhealthy AQI (150+), be direct about health risks
  - Keep each example under 15 words
  - Make it feel personal and impactful, not preachy
  `,
});

const generateAqiImpactExamplesFlow = ai.defineFlow(
  {
    name: "generateAqiImpactExamplesFlow",
    inputSchema: GenerateAqiImpactExamplesInputSchema,
    outputSchema: GenerateAqiImpactExamplesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
