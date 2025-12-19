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
      'A list of 3 very short, relatable examples of the AQI impact, like "Cigarettes smoked: 2".'
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
  prompt: `You are an expert in environmental health communication. Your task is to generate 3 short, relatable examples of the impact of an Air Quality Index (AQI) value.

  Location: {{location}}
  AQI: {{aqi}}

  The examples must be very concise and formatted like "Category: Value".
  For example: "Cigarettes smoked: 4".

  Generate 3 different examples. Examples could include:
  - Equivalent number of cigarettes smoked.
  - Time spent near heavy traffic.
  - Reduced lung function percentage for a day.

  Keep the examples impactful and easy to understand. Avoid technical jargon or long sentences.
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
