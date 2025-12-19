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
  examples: z.array(z.string()).describe('Relatable examples of the AQI impact.'),
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
  prompt: `You are an expert in environmental health communication. You are tasked with generating relatable examples of the impact of the current Air Quality Index (AQI) for a given location.

  Location: {{location}}
  AQI: {{aqi}}

  Generate 3 different examples that help an average person understand the health risks associated with the current AQI. These examples should be easy to understand and avoid technical jargon.

  Examples might include:
  - Equivalent number of cigarettes smoked
  - Time spent in a polluted city
  - Comparison to other known risks

  Make sure the examples are contextual and appropriate. For instance, avoid making smoking sound appealing.

  Output the examples as a numbered list.
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
