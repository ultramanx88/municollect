'use server';
/**
 * @fileOverview An AI agent for estimating special waste collection fees.
 *
 * - estimateWaste - A function that estimates the cost based on a photo and description.
 * - EstimateWasteInput - The input type for the estimateWaste function.
 * - EstimateWasteOutput - The return type for the estimateWaste function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas are now internal to this module and not exported.
const EstimateWasteInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A description of the waste, e.g., "waste from a party", "garden clippings".'),
});
export type EstimateWasteInput = z.infer<typeof EstimateWasteInputSchema>;

const EstimateWasteOutputSchema = z.object({
  estimatedCost: z.number().describe('The estimated collection fee in Thai Baht (THB).'),
  justification: z.string().describe('A brief explanation of how the cost was calculated, mentioning the type and estimated volume of waste.'),
});
export type EstimateWasteOutput = z.infer<typeof EstimateWasteOutputSchema>;

export async function estimateWaste(input: EstimateWasteInput): Promise<EstimateWasteOutput> {
  return estimateWasteFlow(input);
}

const estimateWastePrompt = ai.definePrompt({
  name: 'estimateWastePrompt',
  input: {schema: EstimateWasteInputSchema},
  output: {schema: EstimateWasteOutputSchema},
  prompt: `You are a waste management expert for a Thai municipality. Your task is to estimate the collection fee for a special, non-routine waste pickup based on a photo and description.

Pricing Policy:
- Base Fee: 50 THB for any special pickup.
- Volume Fee: 150 THB per estimated cubic meter of waste.
- Special Handling Fee: Add an additional 200 THB if the waste includes large items, construction debris, electronics, or other materials requiring special handling.

Analyze the provided photo and description. First, identify the type of waste. Second, estimate its volume in cubic meters. Third, calculate the total fee based on the pricing policy.

Provide a clear justification for your estimate. Your response must be in Thai.

Example:
- Input: Photo of 3 large garbage bags and garden clippings. Description: "ขยะจากงานเลี้ยงและตัดแต่งสวน"
- Your reasoning (internal): Base fee (50) + Volume (est. 0.5 m^3 * 150 = 75). Total = 125 THB.
- Output: { estimatedCost: 125, justification: "ประเมินจากขยะทั่วไปและเศษกิ่งไม้ ปริมาณประมาณ 0.5 ลูกบาศก์เมตร" }

Example 2:
- Input: Photo of an old sofa. Description: "ต้องการทิ้งโซฟาเก่า"
- Your reasoning (internal): Base fee (50) + Volume (est. 1.5 m^3 * 150 = 225) + Special Handling (200). Total = 475 THB.
- Output: { estimatedCost: 475, justification: "ประเมินจากขยะชิ้นใหญ่ (โซฟา) ต้องใช้การจัดการพิเศษ ปริมาณประมาณ 1.5 ลูกบาศก์เมตร" }

Now, process the following request.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
  config: {
      temperature: 0.3,
  }
});

const estimateWasteFlow = ai.defineFlow(
  {
    name: 'estimateWasteFlow',
    inputSchema: EstimateWasteInputSchema,
    outputSchema: EstimateWasteOutputSchema,
  },
  async (input) => {
    const {output} = await estimateWastePrompt(input);
    return output!;
  }
);
