export interface ProductVariantType {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  licenseType: string;
  validity: string;
  stock: number;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string | null;
  sortOrder?: number;
}

export interface ProductType {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  description: string;
  categoryId: string;
  category?: CategoryType;
  brand: string;
  image: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  rating: number;
  reviewCount: number;
  deliveryType: string;
  tags?: string;
  sortOrder?: number;
  variants: ProductVariantType[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  variantName: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  quantity: number;
  validity: string;
  licenseType: string;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string | null;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  paymentTrxId?: string | null;
  senderPhone?: string | null;
  orderStatus: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  deliveredKeys: string; // JSON string
  createdAt: string | Date;
  items?: {
    id: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    variant?: {
      name: string;
      product: {
        title: string;
        image: string;
      };
    };
  }[];
}

