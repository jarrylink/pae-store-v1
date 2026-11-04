export interface InvoiceItem {
  id?: string;
  itemId?: number | string;
  type?: 'product' | 'accessory' | 'service' | 'custom';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
  category?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  issueDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  notes?: string;
  terms?: string;
  createdBy: string;
  creatorName?: string;
  creatorEmail?: string;
  creatorRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  invoiceNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
  taxRate?: number;
  discount?: number;
  status?: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  notes?: string;
  terms?: string;
  createdBy?: string;
  creatorName?: string;
  creatorEmail?: string;
  creatorRole?: string;
}
