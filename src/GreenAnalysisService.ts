import { Mistral } from '@mistralai/mistralai';
import * as vscode from 'vscode';
import { GreenReportPanel } from './GreenReportPanel';

export interface GreenAnalysis {
    score_original: number;
    score_optimized: number;
    complexity_before: string;
    complexity_after: string;
    analysis_summary: string;
    explanation: string;
    estimated_gain: string;
    optimized_code: string;
}

export class GreenAnalysisService {
    private client: Mistral;
    private context: vscode.ExtensionContext;

    constructor(apiKey: string, context: vscode.ExtensionContext) {
        this.client = new Mistral({ apiKey: apiKey });
        this.context = context;
    }

    async analyzeCode(code: string, editor: vscode.TextEditor, selection: vscode.Range): Promise<GreenAnalysis> {
        try {
            const chatResponse = await this.client.chat.complete({
                model: 'mistral-large-latest',
                responseFormat: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite Senior Software Architect specializing in Green IT.

                        Your Mission:
                        1. Analyze the code for algorithmic inefficiencies (Big O) and resource waste.
                        2. Refactor strictly for performance/energy while keeping business logic.
                        
                        CRITICAL OUTPUT RULES:
                        - Return ONLY a valid JSON object.
                        - The 'explanation' field must be a SINGLE, CONCISE paragraph of plain text.
                        - DO NOT use Markdown, bullet points, bold text (**), or newlines inside the JSON string values.
                        - Keep it under 3 sentences if possible. Focus on the biggest gain.

                        JSON Structure:
                        {
                            "score_original": (0-100),
                            "score_optimized": (0-100),
                            "complexity_before": "String (e.g. O(N^2))",
                            "complexity_after": "String (e.g. O(N))",
                            "analysis_summary": "One short sentence diagnosing the issue.",
                            "explanation": "Plain text summary of changes (e.g. 'Replaced the nested loop with a hash map lookup to reduce complexity from quadratic to linear time.').",
                            "estimated_gain": "Short string (e.g. '-40% CPU usage').",
                            "optimized_code": "The full refactored code string."
                        }`
                    },
                    {
                        role: 'user',
                        content: code
                    }
                ]
            });

            let content = chatResponse.choices?.[0].message.content;

            if (typeof content === 'string') {
                content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const firstOpen = content.indexOf('{');
                const lastClose = content.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose !== -1) {
                    content = content.substring(firstOpen, lastClose + 1);
                }
            }

            if (!content) {
                throw new Error("Mistral returned an empty response.");
            }

            let analysis: any;
            try {
                analysis = JSON.parse(content as string);
                GreenReportPanel.createOrShow(
                    this.context.extensionUri,
                    analysis,
                    editor,
                    selection
                );
            } catch (e) {
                console.error("JSON Parse Error. Raw content:", content);
                throw new Error("Failed to parse Mistral response as JSON.");
            }

            return this.validateAnalysis(analysis);

        } catch (error: any) {
            console.error("Mistral Analysis Error:", error);
            throw new Error(`Failed to analyze code: ${error.message}`);
        }
    }

    private validateAnalysis(data: any): GreenAnalysis {
        const requiredFields = [
            'score_original', 'score_optimized',
            'complexity_before', 'complexity_after',
            'analysis_summary', 'explanation',
            'estimated_gain', 'optimized_code'
        ];

        const missing = requiredFields.filter(field => data[field] === undefined);

        if (missing.length > 0) {
            throw new Error(`Invalid analysis format. Missing fields: ${missing.join(', ')}`);
        }

        // Default type safety checks (not usefull xd)
        return {
            score_original: Number(data.score_original) || 0,
            score_optimized: Number(data.score_optimized) || 0,
            complexity_before: String(data.complexity_before),
            complexity_after: String(data.complexity_after),
            analysis_summary: String(data.analysis_summary),
            explanation: String(data.explanation),
            estimated_gain: String(data.estimated_gain),
            optimized_code: String(data.optimized_code)
        };
    }
}
