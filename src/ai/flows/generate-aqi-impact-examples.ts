'use server';
/**
 * @fileOverview Generates relatable examples of the impact of the current AQI.
 *
 * - generateAqiImpactExamples - A function that handles the generation of AQI impact examples.
 * - GenerateAqiImpactExamplesInput - The input type for the generateAqiImpactExamples function.
 * - GenerateAqiImpactExamplesOutput - The return type for the generateAqiImpactExamples function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAqiImpactExamplesInputSchema = z.object({
  aqi: z.number().describe('The current Air Quality Index (AQI).'),
  location: z.string().describe('The location for which the AQI is reported.'),
});
export type GenerateAqiImpactExamplesInput = z.infer<typeof GenerateAqiImpactExamplesInputSchema>;

const GenerateAqiImpactExamplesOutputSchema = z.object({
  examples: z
    .array(z.string())
    .describe(
      'A list of 3 very short, relatable examples of the AQI impact, like "Basically smoked: 2 cigarettes".'
    ),
});
export type GenerateAqiImpactExamplesOutput = z.infer<typeof GenerateAqiImpactExamplesOutputSchema>;

export async function generateAqiImpactExamples(
  input: GenerateAqiImpactExamplesInput
): Promise<GenerateAqiImpactExamplesOutput> {
  return generateAqiImpactExamplesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAqiImpactExamplesPrompt',
  input: {schema: GenerateAqiImpactExamplesInputSchema},
  output: {schema: GenerateAqiImpactExamplesOutputSchema},
  prompt: `You are a witty and slightly sassy environmental bot. Your mission is to translate boring Air Quality Index (AQI) numbers into shockingly relatable comparisons that make people pay attention.

  Location: {{location}}
  AQI: {{aqi}}

  Generate 3 extremely short, punchy, and easy-to-understand examples of the AQI's impact. Format them like "Category: Value".

  Think outside the box! Instead of just "cigarettes", how about:
  - "Basically smoked: X cigarettes."
  - "Like licking a bus exhaust for: Y minutes."
  - "Your lungs are working like they're: Z years older."

  Be creative, be memorable, but keep it very short. The goal is to make someone say "Whoa!"
  `,
});

const generateAqiImpactExamplesFlow = ai.defineFlow(
  {
    name: 'generateAqiImpactExamplesFlow',
    inputSchema: GenerateAqiImpactExamplesInputSchema,
    outputSchema: GenerateAqiImpactExamplesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
