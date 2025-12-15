import { ContractData } from '@/types/contract';

// In-memory database for MVP
const contractsStore = new Map<string, ContractData>();

// Pre-populate with some sample data for demo purposes
const sampleContracts: ContractData[] = [
    {
        id: 'demo-1',
        fileName: 'Office_Lease_Agreement_2024.pdf',
        contractType: 'Commercial Lease',
        effectiveDate: '2024-01-15',
        renewalDate: '2025-01-15',
        noticePeriodDays: 60,
        terminationClauseReference: 'Section 12.3 - Early Termination',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'demo-2',
        fileName: 'SaaS_Subscription_Contract.docx',
        contractType: 'Software License',
        effectiveDate: '2024-03-01',
        renewalDate: '2025-03-01',
        noticePeriodDays: 30,
        terminationClauseReference: 'Article 8 - Automatic Renewal',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Initialize with sample data
sampleContracts.forEach(contract => {
    contractsStore.set(contract.id, contract);
});

export const supabaseMock = {
    /**
     * Insert a new contract into the mock database
     */
    async insertContract(data: Omit<ContractData, 'id' | 'createdAt'>): Promise<ContractData> {
        const id = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const contract: ContractData = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
        };

        contractsStore.set(id, contract);

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 100));

        return contract;
    },

    /**
     * Retrieve all contracts from the mock database
     */
    async getAllContracts(): Promise<ContractData[]> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 50));

        const contracts = Array.from(contractsStore.values());

        // Sort by createdAt descending (newest first)
        return contracts.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    /**
     * Retrieve a single contract by ID
     */
    async getContractById(id: string): Promise<ContractData | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return contractsStore.get(id) || null;
    },

    /**
     * Delete a contract by ID
     */
    async deleteContract(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return contractsStore.delete(id);
    },
};

export default supabaseMock;
