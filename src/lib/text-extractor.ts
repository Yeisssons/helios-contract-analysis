/**
 * Mock text extraction from PDF/DOCX files
 * In production, this would use libraries like pdf-parse or mammoth
 */
export async function extractTextFromFile(file: File): Promise<string> {
    // Simulate extraction delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const fileName = file.name.toLowerCase();

    // Generate mock contract text based on file name patterns
    if (fileName.includes('lease') || fileName.includes('rental')) {
        return generateLeaseContractText(file.name);
    } else if (fileName.includes('software') || fileName.includes('saas') || fileName.includes('license')) {
        return generateSoftwareLicenseText(file.name);
    } else if (fileName.includes('service') || fileName.includes('consulting')) {
        return generateServiceAgreementText(file.name);
    } else if (fileName.includes('nda') || fileName.includes('confidential')) {
        return generateNDAText(file.name);
    } else if (fileName.includes('employment') || fileName.includes('employee')) {
        return generateEmploymentContractText(file.name);
    }

    // Default generic contract text
    return generateGenericContractText(file.name);
}

function generateLeaseContractText(fileName: string): string {
    return `
    COMMERCIAL LEASE AGREEMENT
    
    This Commercial Lease Agreement ("Agreement") is entered into as of ${getRandomDate()}.
    
    ARTICLE 1: PREMISES
    Landlord hereby leases to Tenant the premises located at [Property Address].
    
    ARTICLE 2: TERM
    The initial term of this Lease shall commence on ${getRandomDate()} (the "Effective Date") 
    and shall expire on ${getRandomFutureDate()} (the "Renewal Date"), unless earlier terminated.
    
    ARTICLE 3: RENT
    Tenant agrees to pay monthly rent in the amount of $5,000.00.
    
    ARTICLE 12: TERMINATION
    12.3 Early Termination: Either party may terminate this Agreement with ${getRandomNoticePeriod()} days 
    written notice prior to the renewal date.
    
    File: ${fileName}
  `;
}

function generateSoftwareLicenseText(fileName: string): string {
    return `
    SOFTWARE LICENSE AND SUBSCRIPTION AGREEMENT
    
    This Software License Agreement is effective as of ${getRandomDate()}.
    
    SECTION 1: LICENSE GRANT
    Licensor grants Licensee a non-exclusive right to use the Software.
    
    SECTION 2: TERM AND RENEWAL
    This Agreement is effective from ${getRandomDate()} (Effective Date) and will automatically 
    renew on ${getRandomFutureDate()} (Renewal Date) unless terminated.
    
    SECTION 8: AUTOMATIC RENEWAL
    This Agreement will automatically renew for successive one-year periods unless either party 
    provides written notice of non-renewal at least ${getRandomNoticePeriod()} days prior to expiration.
    
    File: ${fileName}
  `;
}

function generateServiceAgreementText(fileName: string): string {
    return `
    PROFESSIONAL SERVICES AGREEMENT
    
    This Professional Services Agreement ("Agreement") is made effective ${getRandomDate()}.
    
    1. SERVICES
    Provider agrees to perform consulting and professional services as described herein.
    
    2. TERM
    This Agreement commences on ${getRandomDate()} and continues until ${getRandomFutureDate()}.
    
    3. TERMINATION
    3.2 Termination for Convenience: Either party may terminate this Agreement with 
    ${getRandomNoticePeriod()} days prior written notice.
    
    File: ${fileName}
  `;
}

function generateNDAText(fileName: string): string {
    return `
    NON-DISCLOSURE AGREEMENT
    
    This Non-Disclosure Agreement is entered into as of ${getRandomDate()}.
    
    ARTICLE I: CONFIDENTIAL INFORMATION
    The parties agree to protect confidential information as defined herein.
    
    ARTICLE II: TERM
    This Agreement shall be effective from ${getRandomDate()} and shall continue until 
    ${getRandomFutureDate()}, unless earlier terminated.
    
    ARTICLE V: TERMINATION
    Section 5.1: This Agreement may be terminated by either party upon ${getRandomNoticePeriod()} 
    days written notice.
    
    File: ${fileName}
  `;
}

function generateEmploymentContractText(fileName: string): string {
    return `
    EMPLOYMENT CONTRACT
    
    This Employment Contract is effective as of ${getRandomDate()}.
    
    1. POSITION AND DUTIES
    Employee is hired for the position as described in Schedule A.
    
    2. TERM OF EMPLOYMENT
    Employment begins on ${getRandomDate()} (Effective Date) and continues until 
    ${getRandomFutureDate()} (Contract End Date).
    
    7. TERMINATION
    7.4 Notice Period: Either party must provide ${getRandomNoticePeriod()} days written 
    notice before terminating this Agreement.
    
    File: ${fileName}
  `;
}

function generateGenericContractText(fileName: string): string {
    return `
    GENERAL CONTRACT AGREEMENT
    
    This Agreement is entered into as of ${getRandomDate()}.
    
    ARTICLE 1: PURPOSE
    The parties agree to the terms and conditions set forth in this Agreement.
    
    ARTICLE 2: EFFECTIVE DATE AND TERM
    This Agreement shall commence on ${getRandomDate()} (the "Effective Date") and 
    shall continue in full force until ${getRandomFutureDate()} (the "Renewal Date").
    
    ARTICLE 10: TERMINATION
    Section 10.2: Either party may terminate this Agreement by providing at least 
    ${getRandomNoticePeriod()} days written notice to the other party.
    
    File: ${fileName}
  `;
}

function getRandomDate(): string {
    const year = 2024;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function getRandomFutureDate(): string {
    const year = 2025;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function getRandomNoticePeriod(): number {
    const periods = [15, 30, 45, 60, 90];
    return periods[Math.floor(Math.random() * periods.length)];
}

export default extractTextFromFile;
