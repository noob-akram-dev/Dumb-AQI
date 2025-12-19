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
      'A list of 3 very short, relatable examples of the AQI impact, like "Basically smoked: 2 cigarettes".',
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
  prompt: `You are a witty and relatable environmental assistant. Your mission is to translate Air Quality Index (AQI) numbers into easy-to-understand comparisons that make the impact crystal clear.

  Location: {{location}}
  AQI: {{aqi}}

  Generate 3 short, punchy, and relatable examples of the AQI's impact. These should be scientific yet easy to grasp.

  Use these three categories for your comparisons:
  1.  "Cigarettes smoked (24hrs): X cigarettes" - Calculate based on research that shows AQI correlation to cigarette equivalents
  2.  "Reduced life expectancy: X hours/days per year" - Based on WHO air pollution health impact data
  3.  "Equivalent to: [relatable scenario]" - Like "Standing behind a running car for X minutes" or "Burning X candles in a closed room" or "Living near a busy highway"

  Be accurate with the values based on actual AQI health impacts. Use realistic numbers. For low AQI (0-50), use minimal impacts. For high AQI (300+), show severe impacts.

  Keep it punchy and clear. The goal is to make the air quality impact instantly understandable.
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
