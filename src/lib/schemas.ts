import { z } from 'zod';

// Schema for Chat API
export const ChatRequestSchema = z.object({
    contractId: z.string().uuid({ message: "Invalid Contract ID format" }),
    message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string()
    })).optional().default([])
});

// Schema for Contract Processing (Metadata only, file is handled via FormData)
export const ContractMetadataSchema = z.object({
    customQuery: z.string().max(500).optional(),
});
