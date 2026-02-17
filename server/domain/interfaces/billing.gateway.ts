export interface InvoiceItem {
    internalId: string;
    description: string;
    quantity: number;
    unitValue: number; // Valor sin IGV
    price: number;     // Precio con IGV
}

export interface InvoicePayload {
    series: string;
    number: number;
    issueDate: string; // YYYY-MM-DD
    dueDate: string;   // YYYY-MM-DD

    // Datos del Cliente (Gimnasio)
    client: {
        docType: '6' | '1'; // 6: RUC, 1: DNI
        docNumber: string;
        name: string;
        address: string;
        email: string;
    };

    // Totales
    amounts: {
        totalOpGravadas: number;
        totalIgv: number;
        total: number;
    };

    items: InvoiceItem[];
}

export interface BillingSuccessResponse {
    externalId: string;
    pdfUrl: string;
    xmlUrl: string;
    message: string;
}

export interface IBillingGateway {
    emitInvoice(payload: InvoicePayload, apiUrl: string, token: string): Promise<BillingSuccessResponse>;
}