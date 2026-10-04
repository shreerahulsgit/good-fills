// Good Fills Domain Types
// Strictly aligned with handoff.md and agent.md

export type ProductCategory = 
  | 'baby-kids'
  | 'nutrition-wellness'
  | 'skin-bath'
  | 'pantry-beverages';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export type ProductAvailability = 
  | 'available' 
  | 'temporarily-unavailable' 
  | 'sold-out' 
  | 'coming-soon';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number; // in INR (₹)
  packSize: string; // e.g. "250g", "100g", "500g"
  productWeightGrams: number; // For DTDC domestic shipping calculation
  shortDescription: string;
  description: string;
  ingredients: string[]; // empty or placeholder if unverified
  ingredientsVerified: boolean;
  ingredientsNote?: string;
  benefits?: string[];
  usageInstructions?: string;
  preparationInstructions?: string;
  storageInstructions?: string;
  shelfLife: string; // Default: "6 months"
  availability: ProductAvailability;
  featured: boolean;
  images: {
    primary: string;
    packaging?: string;
    detail?: string;
    lifestyle?: string;
  };
  fssaiCompliant: boolean;
  madeToOrder: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Shipping models
export interface ShippingCalculation {
  totalWeightGrams: number;
  totalWeightKg: number;
  shippingCost: number; // in INR (₹)
  slabDescription: string;
  courierName: string; // "DTDC"
  estimatedDelivery: string; // "2–4 days"
}

// Order & Payment Status Models (Strict separation as required by handoff.md)
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'RTO';

export type ShipmentStatus = 
  | 'Not Shipped'
  | 'Handed Over'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Delivery Failed'
  | 'RTO';

export interface StatusHistoryEntry {
  timestamp: string;
  status: OrderStatus | ShipmentStatus | PaymentStatus;
  category: 'payment' | 'order' | 'shipment';
  note?: string;
  actor: 'system' | 'customer' | 'admin' | 'manager';
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string; // "India" by default
}

export interface Order {
  id: string; // e.g. "ORD-1024"
  createdAt: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'UPI' | 'Razorpay';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus;
  upiUtr?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  weightGrams?: number;
  courier: string; // "DTDC"
  trackingNumber?: string; // DTDC Consignment / Tracking Number entered by Admin/Manager
  estimatedDelivery: string; // "2–4 days"
  dispatchDate?: string;
  deliveredDate?: string;
  statusHistory: StatusHistoryEntry[];
  internalNotes?: string[];
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer';
  addresses: ShippingAddress[];
  createdAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  active: boolean;
}
