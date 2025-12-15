import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

import { ChatRequestSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validation = ChatRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { contractId, message, history } = validation.data;

        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Database configuration error' },
                { status: 500 }
            );
        }

        // 1. Fetch contract text from Supabase
        const { data: contract, error } = await supabaseAdmin
            .from('contracts')
            .select('extracted_text, file_name, sector')
            .eq('id', contractId)
            .single();

        if (error || !contract || !contract.extracted_text) {
            return NextResponse.json(
                { error: 'Contract not found or has no text' },
                { status: 404 }
            );
        }

        // 2. Build constrained history for context (last 10 messages)
        // Convert format to Gemini expected format if needed, or just append to prompt
        // For simplicity and strict context control, we'll build a fat system prompt
        // with the contract text and the recent conversation history.

        const contractContext = `
DOC_NAME: ${contract.file_name}
SECTOR: ${contract.sector}
CONTENT:
${contract.extracted_text.slice(0, 100000)} // Safety limit for large files
`;

        const systemInstruction = `
You are Helios AI, an expert legal contract analyst. 
You are answering questions about the specific contract provided above.
1. Answer ONLY based on the provided contract content.
2. If the answer is not in the document, say "I cannot find that information in this specific contract."
3. Be concise and professional.
4. If the user asks general questions, politely redirect them to the contract content.
5. Provide specific references (e.g., "See Clause 5.2") if possible.
`;

        // Format history for Gemini
        // API expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const chatHistory = history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `SYSTEM CONTEXT: ${contractContext}\n\nINSTRUCTIONS: ${systemInstruction}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: `Understood. I am ready to answer questions about ${contract.file_name}.` }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // 3. Generate streaming response
        const result = await chat.sendMessageStream(message);

        // Create a ReadableStream from the generator
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
