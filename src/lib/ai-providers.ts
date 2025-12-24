/**
 * Unified AI Provider Abstraction Layer
 * Supports: Gemini, OpenAI, Claude
 * Automatically selects provider based on user plan
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ============ TYPES ============

export type AIProvider = 'gemini' | 'openai' | 'claude';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIResponse {
    content: string;
    provider: AIProvider;
    model: string;
    tokensUsed?: number;
}

export interface AIProviderConfig {
    provider: AIProvider;
    model: string;
    apiKey: string;
}

// ============ USAGE LIMITS BY PLAN ============

export const PLAN_USAGE_LIMITS = {
    free: {
        documentsPerMonth: 5,
        softWarningAt: 4, // Show warning at 4 docs
        hardLimitAction: 'block', // Block at limit
    },
    pro: {
        documentsPerMonth: 100,
        softWarningAt: 80, // Show warning at 80 docs
        elevatedUsageAt: 150, // "Elevated usage" notice
        hardLimitAt: 200, // Suggest upgrade at 200
        hardLimitAction: 'suggest_upgrade', // Don't block, just suggest
    },
    enterprise: {
        documentsPerMonth: 500, // Base tier
        softWarningAt: 400,
        hardLimitAt: Infinity, // No hard limit, but monitor
        hardLimitAction: 'notify_admin',
    },
} as const;

// ============ PROVIDER CONFIGS BY PLAN ============

export const PLAN_AI_CONFIG: Record<UserPlan, { primary: AIProviderConfig; fallbacks: AIProviderConfig[] }> = {
    free: {
        primary: {
            provider: 'gemini',
            model: 'gemini-2.5-flash', // Free tier (gratis)
            apiKey: process.env.GEMINI_API_KEY || '',
        },
        fallbacks: [
            { provider: 'gemini', model: 'gemini-2.5-flash-lite', apiKey: process.env.GEMINI_API_KEY || '' },
        ],
    },
    pro: {
        primary: {
            provider: 'gemini',
            model: 'gemini-3-flash', // Best balance speed/quality
            apiKey: process.env.GEMINI_API_KEY || '',
        },
        fallbacks: [
            { provider: 'gemini', model: 'gemini-2.5-flash', apiKey: process.env.GEMINI_API_KEY || '' },
            { provider: 'gemini', model: 'gemini-2.5-pro', apiKey: process.env.GEMINI_API_KEY || '' },
        ],
    },
    enterprise: {
        primary: {
            provider: 'gemini',
            model: 'gemini-3-flash', // Default premium
            apiKey: process.env.GEMINI_API_KEY || '',
        },
        fallbacks: [
            { provider: 'openai', model: 'gpt-5-mini', apiKey: process.env.OPENAI_API_KEY || '' },
            { provider: 'claude', model: 'claude-sonnet-4-5', apiKey: process.env.ANTHROPIC_API_KEY || '' },
            { provider: 'gemini', model: 'gemini-3-pro-preview', apiKey: process.env.GEMINI_API_KEY || '' },
        ],
    },
};

// ============ GEMINI PROVIDER ============

async function callGemini(config: AIProviderConfig, prompt: string, systemPrompt?: string): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({
        model: config.model,
        systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
        content: response.text(),
        provider: 'gemini',
        model: config.model,
        tokensUsed: response.usageMetadata?.totalTokenCount,
    };
}

// ============ OPENAI PROVIDER ============

async function callOpenAI(config: AIProviderConfig, prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!config.apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
        content: data.choices[0].message.content,
        provider: 'openai',
        model: config.model,
        tokensUsed: data.usage?.total_tokens,
    };
}

// ============ CLAUDE PROVIDER ============

async function callClaude(config: AIProviderConfig, prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!config.apiKey) {
        throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: config.model,
            max_tokens: 4096,
            system: systemPrompt || '',
            messages: [
                { role: 'user', content: prompt },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
        content: data.content[0].text,
        provider: 'claude',
        model: config.model,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
}

// ============ UNIFIED AI CALL ============

/**
 * Call AI with automatic provider selection and fallback
 * @param plan - User's subscription plan
 * @param prompt - The prompt to send
 * @param systemPrompt - Optional system prompt
 * @param preferredProvider - Override the default provider for this plan
 */
export async function callAI(
    plan: UserPlan,
    prompt: string,
    systemPrompt?: string,
    preferredProvider?: AIProvider
): Promise<AIResponse> {
    const planConfig = PLAN_AI_CONFIG[plan];

    // Build provider chain
    const providerChain: AIProviderConfig[] = [
        planConfig.primary,
        ...planConfig.fallbacks.filter(f => f.apiKey), // Only include providers with API keys
    ];

    // If preferred provider specified, move it to front
    if (preferredProvider) {
        const preferredIndex = providerChain.findIndex(p => p.provider === preferredProvider);
        if (preferredIndex > 0) {
            const [preferred] = providerChain.splice(preferredIndex, 1);
            providerChain.unshift(preferred);
        }
    }

    let lastError: Error | null = null;

    for (const config of providerChain) {
        try {
            console.log(`🤖 Trying ${config.provider}/${config.model}...`);

            switch (config.provider) {
                case 'gemini':
                    return await callGemini(config, prompt, systemPrompt);
                case 'openai':
                    return await callOpenAI(config, prompt, systemPrompt);
                case 'claude':
                    return await callClaude(config, prompt, systemPrompt);
                default:
                    throw new Error(`Unknown provider: ${config.provider}`);
            }
        } catch (error) {
            console.error(`❌ ${config.provider}/${config.model} failed:`, error);
            lastError = error as Error;
            continue;
        }
    }

    throw lastError || new Error('All AI providers failed');
}

// ============ HELPER: GET MODEL INFO FOR DISPLAY ============

export function getModelDisplayName(plan: UserPlan): string {
    const config = PLAN_AI_CONFIG[plan];
    const modelNames: Record<string, string> = {
        'gemini-3-flash': 'Gemini 3 Flash',
        'gemini-2.5-flash': 'Gemini 2.5 Flash',
        'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
        'gemini-2.5-pro': 'Gemini 2.5 Pro',
        'gpt-4o': 'GPT-4o',
        'gpt-4o-mini': 'GPT-4o Mini',
        'claude-sonnet-4-20250514': 'Claude Sonnet 4',
        'claude-3-haiku-20240307': 'Claude 3 Haiku',
    };
    return modelNames[config.primary.model] || config.primary.model;
}

// ============ COST ESTIMATION ============

const COST_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
    'gemini-3-flash': { input: 0.50, output: 3.00 },
    'gemini-2.5-flash': { input: 0.30, output: 2.50 },
    'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
    'gemini-2.5-pro': { input: 1.25, output: 10.00 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = COST_PER_1M_TOKENS[model];
    if (!costs) return 0;

    return (inputTokens / 1_000_000 * costs.input) + (outputTokens / 1_000_000 * costs.output);
}
