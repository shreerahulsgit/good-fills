import { LucideIcon } from "lucide-react";

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
    price: number;
    packSize: string;
    productWeightGrams: number;
    shortDescription: string;
    description: string;
    ingredients: string[];
    ingredientsVerified: boolean;
    ingredientsNote?: string;
    benefits?: string[];
    usageInstructions?: string;
    preparationInstructions?: string;
    storageInstructions?: string;
    shelfLife: string;
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

export interface AddedToastData {
    product: Product;
    quantity: number;
    timestamp: number;
}

export interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, options?: { openDrawer?: boolean; suppressToast?: boolean }) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    refreshProducts: () => Promise<boolean>;
    getItemQuantity: (productId: string) => number;
    totalItems: number;
    totalWeightGrams: number;
    subtotal: number;
    shipping: ShippingCalculation;
    grandTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    openCart: () => void;
    closeCart: () => void;
    lastAddedItem: AddedToastData | null;
    dismissToast: () => void;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface ShippingCalculation {
    totalWeightGrams: number;
    totalWeightKg: number;
    shippingCost: number;
    slabDescription: string;
    courierName: string;
    estimatedDelivery: string;
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type PaymentMethod = 'UPI' | 'Net Banking';

export type OrderStatus =
| 'Pending'
| 'Confirmed'
| 'Ready to Ship'
| 'Shipped'
| 'Completed'
| 'Failed'
| 'Cancelled'

export type ShipmentStatus =
| 'Not Shipped'
| 'Handed Over'
| 'In Transit'
| 'Out for Delivery'
| 'Delivered'
| 'Failed'

export interface PaymentRecord {
    id: string;
    orderId: string;
    provider: 'razorpay';
    providerOrderId: string;
    providerPaymentId?: string;
    amount: number;
    currency: 'INR';
    status: PaymentStatus;
    method: PaymentMethod;
    signatureVerified: boolean;
    capturedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthoritativeCartCalculation {
    subtotal: number;
    totalWeightGrams: number;
    shippingCost: number;
    grandTotal: number;
    validatedItems: CartItem[];
}

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
    country: string;
}

export interface Order {
    id: string;
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
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    shipmentStatus: ShipmentStatus;
    upiUtr?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    weightGrams?: number;
    courier: string;
    trackingNumber?: string;
    estimatedDelivery: string;
    dispatchDate?: string;
    deliveredDate?: string;
    statusHistory: StatusHistoryEntry[];
    internalNotes?: string[];
}

export type CustomerRow = {
    id: string;
    auth_user_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    role: 'customer';
    addresses: ShippingAddress[] | null;
    created_at: string;
};

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

export interface Inquiry {
    id: string;
    createdAt: string;
    name: string;
    phone: string;
    email?: string;
    category: string;
    orderId?: string;
    message: string;
    status: 'new' | 'replied' | 'archived';
}

export type InquiryRow = {
    id: string;
    created_at: string;
    name: string;
    phone: string;
    email: string | null;
    category: string;
    order_id: string | null;
    message: string;
    status: Inquiry['status'];
};

export interface Review {
    id: string;
    orderId?: string;
    productId: string;
    productName: string;
    rating: number;
    title: string;
    comment: string;
    authorName: string;
    location: string;
    childAge?: string;
    isVerifiedBuyer: boolean;
    helpfulCount: number;
    createdAt: string;
    isFeatured?: boolean;
    status?: 'published' | 'hidden';
    testimonialImage?: string;
    founderReply?: {
        message: string;
        repliedAt: string;
    };
}

export interface ProductReviewSummary {
    averageRating: number;
    totalCount: number;
    recommendationPercentage: number;
    distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    reviews: Review[];
}

export type ReviewRow = {
  id: string;
  order_id: string | null;
  product_id: string;
  product_name: string;
  rating: number;
  title: string;
  comment: string;
  author_name: string;
  location: string;
  child_age: string | null;
  is_verified_buyer: boolean;
  helpful_count: number;
  created_at: string;
  is_featured: boolean;
  status: Review['status'];
  testimonial_image: string | null;
  founder_reply: Review['founderReply'] | null;
};

export type ChallengeResponse = {
    challenge?: unknown;
    difficulty?: unknown;
};

export interface CourierPartnerInfo {
    name: string;
    brand: string;
    serviceType: string;
    awbNumber: string;
    isAssigned: boolean;
    trackingUrl: string;
    helpline: string;
}

export interface ConsignmentPackageSpecs {
    totalWeightGrams: number;
    formattedWeight: string;
    packagingType: string;
    sealIntegrity: string;
    storageRequirement: string;
    batchCode: string;
}

export interface TrackingTelemetryResult {
    orderId: string;
    found: boolean;
    orderCreatedAt: string;
    customerName: string;
    maskedPhone: string;
    shippingAddress: Pick<ShippingAddress, 'city' | 'pincode' | 'state' | 'country'>;
    orderStatus: string;
    shipmentStatus: string;
    overallProgressPercent: number;
    currentStatusHeadline: string;
    currentStatusDescription: string;
    statusBadgeType: 'live' | 'completed' | 'processing' | 'pending';
    estimatedDeliveryDate: string;
    estimatedDeliveryWindow: string;
    isDelivered: boolean;
    courier: CourierPartnerInfo;
    packageSpecs: ConsignmentPackageSpecs;
    items: Array<{
        id: string;
        name: string;
        packSize: string;
        quantity: number;
        price: number;
        imagePrimary: string;
        productWeightGrams: number;
    }>;
    subtotal: number;
    shippingCost: number;
    total: number;
}

export interface DtdcCheckpoint {
    Time: string;
    Date: string;
    Location: string;
    Activity: string;
    CourierName: string;
    CheckpointState: string;
}

export interface DtdcTrackingResponse {
    Checkpoints?: DtdcCheckpoint[];
    MostRecentStatus?: string;
    ShipmentState?: string;
    AdditionalInfo?: string;
}

export interface CategoryPageProps {
    params: {
        category: string;
    };
}

export type PolicyKey = 'shipping' | 'refund' | 'privacy' | 'terms';

export interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  activePolicy?: PolicyKey;
  lastUpdated?: string;
  children: React.ReactNode;
}

export interface ShopCatalogViewProps {
  initialCategory?: ProductCategory | 'all';
  initialProducts?: Product[];
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CustomerAuthContextType {
  currentUser: CustomerUser | null;
  orders: Order[];
  isLoading: boolean;
  login: (user: CustomerUser, orders: Order[]) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: CustomerUser) => void;
}

export interface InternationalDeliveryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface PreloaderContextType {
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  showPreloader: boolean;
  setShowPreloader: (show: boolean) => void;
}

export interface RitualItem {
  id: string;
  step: string;
  tabLabel: string;
  ghostNum: string;
  title: string;
  description: string;
  image: string;
  benefit: string;
  icon: LucideIcon;
}

export interface OlaSelectedAddress {
  placeId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
  location?: { lat: number; lng: number };
}

export interface OlaPrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface OlaAddressSearchProps {
  onSelectAddress: (data: OlaSelectedAddress) => void;
  className?: string;
}

export interface StepItem {
  step: string;
  navLabel: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

export interface AdminKitchenManifestViewProps {
  orders: Order[];
  allProducts: Product[];
  onQuickAdvance: (orderId: string, targetStatus: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export interface AggregatedBatchProduct {
  productId: string;
  productName: string;
  packSize: string;
  category: ProductCategory;
  imageUrl: string;
  totalQuantity: number;
  unitWeightGrams: number;
  totalGrams: number;
  unpackedCount: number;
  orderRefs: Array<{
    orderId: string;
    customerName: string;
    quantity: number;
    city: string;
    status: string;
  }>;
}

export interface AdminReviewsModerationViewProps {
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onNavigateToOrder?: (orderId: string) => void;
}

export interface ReviewStats {
  totalCount: number;
  averageRating: number;
  recommendationPercentage: number;
  featuredCount: number;
  verifiedCount: number;
  distribution: Record<number, number>;
}