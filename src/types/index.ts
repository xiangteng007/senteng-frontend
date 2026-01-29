/**
 * Domain Types for Senteng ERP
 *
 * 定義前端使用的核心類型
 */

// ==========================================
// User & Auth Types
// ==========================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  roleLevel: number;
  tenantId?: string;
  allowedPages?: string[];
  actions?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// ==========================================
// Project Types
// ==========================================

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId?: string;
  client?: Client;
  contractAmount: number;
  startDate: string;
  endDate?: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled'
  | '規劃中'
  | '進行中'
  | '已完成'
  | '暫停'
  | '取消';

// ==========================================
// Client Types
// ==========================================

export interface Client {
  id: string;
  name: string;
  clientType: 'company' | 'individual';
  unifiedBusinessNo?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  isDefault: boolean;
}

// ==========================================
// Contract Types
// ==========================================

export interface Contract {
  id: string;
  contractNumber: string;
  name: string;
  projectId: string;
  clientId: string;
  amount: number;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'draft' | 'pending' | 'signed' | 'active' | 'expired' | 'cancelled';

// ==========================================
// Quotation Types
// ==========================================

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  status: QuotationStatus;
  totalAmount: number;
  validUntil: string;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuotationItem {
  id: string;
  quotationId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

// ==========================================
// Invoice Types
// ==========================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  status: InvoiceStatus;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'voided';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

// ==========================================
// Finance Types
// ==========================================

export interface Transaction {
  id: string;
  transactionDate: string;
  transactionType: TransactionType;
  amount: number;
  description: string;
  accountId?: string;
  projectId?: string;
  invoiceId?: string;
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Account {
  id: string;
  name: string;
  accountType: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance: number;
  isActive: boolean;
}

// ==========================================
// Event Types
// ==========================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  projectId?: string;
  location?: string;
  attendees?: string[];
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'meeting' | 'deadline' | 'milestone' | 'task' | 'other';

// ==========================================
// CMM Types (Materials)
// ==========================================

export interface Material {
  id: string;
  name: string;
  categoryL1Id: string;
  categoryL2Id: string;
  categoryL3Id?: string;
  unit: string;
  unitPrice: number;
  specifications?: Record<string, any>;
  isActive: boolean;
}

export interface MaterialCategory {
  id: string;
  name: string;
  code: string;
  level: 1 | 2 | 3;
  parentId?: string;
}

// ==========================================
// Inventory Types
// ==========================================

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  unitCost: number;
  location?: string;
  isLowStock: boolean;
}

// ==========================================
// Common Types
// ==========================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
