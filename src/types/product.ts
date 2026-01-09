export type WatchType = 'Brand New' | 'Pre-Owned';
export type Availability = 'Available' | 'Reserved' | 'Sold';
export type Condition =
  | 'New Unworn'
  | 'Like New'
  | 'Very Good'
  | 'Good'
  | 'Fair';
export type Gender = 'Mens watch' | 'Womens watch' | 'Unisex';
export type ProductStatus = 'Draft' | 'Published' | 'Archived';

// Product Attribute Types
export interface ProductAttribute {
  id: string;
  nameEn: string;
  nameId: string;
  type: AttributeType;
  createdAt: string;
  updatedAt: string;
  isUsedByProducts?: boolean; // For deletion validation
}

export type AttributeType =
  | 'Bracelet Material'
  | 'Case Material'
  | 'Bezel Material'
  | 'Crystal'
  | 'Movement'
  | 'Dial'
  | 'Dial Numerals'
  | 'Scope of Delivery'
  | 'Bracelet Color'
  | 'Clasp Type'
  | 'Clasp Material'
  | 'Function Tags';

// Product Images & Media
export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
  file?: File;
}

export interface ProductVideo {
  url: string;
  file?: File;
}

export interface PricePerformanceEntry {
  id: string;
  date: string;
  price: number;
  source?: string;
}

// Main Product Interface
export interface Product {
  // A. Product Status Metadata
  id: string;
  listingCode: string; // Unique
  status: ProductStatus;

  // B. Basic Info
  brandId: string;
  modelNameEn: string;
  modelNameId: string;
  referenceNumber?: string;
  watchType: WatchType;
  condition: Condition;
  gender: Gender;
  yearOfProduction?: number;
  yearOfPurchase?: number;
  location?: string;
  descriptionEn?: string;
  descriptionId?: string;

  // C. Caliber
  movementId?: string;
  caliber?: string;
  powerReserve?: string;
  numberOfJewels?: number;

  // D. Case
  caseMaterialId?: string;
  caseDiameter?: number;
  caseThickness?: number;
  bezelMaterialId?: string;
  crystalId?: string;
  waterResistance?: string;

  // E. Bracelet/Strap
  braceletMaterialId?: string;
  braceletColorId?: string;
  claspTypeId?: string;
  claspMaterialId?: string;

  // F. Functions Tagging
  functionTagIds: string[];

  // G. Completeness
  scopeOfDeliveryIds: string[];
  hasOriginalBox: boolean;
  hasOriginalPapers: boolean;

  // H. Images/Media
  thumbnailImage: ProductImage;
  galleryImages: ProductImage[]; // Max 20
  productVideo?: ProductVideo;

  // I. Additional Info
  dialId?: string;
  dialNumeralsId?: string;
  isLimitedEdition: boolean;
  limitedEditionNumber?: string;

  // J. Price Performance
  currentPrice: number;
  currency: string;
  priceHistory: PricePerformanceEntry[]; // Max 240

  // System fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Product List Filters
export interface ProductFilters {
  brandIds?: string[];
  watchType?: WatchType;
  availability?: Availability;
  gender?: Gender;
  isLimitedEdition?: boolean;
  condition?: Condition;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
}

// Brand Interface (Read-only in Product Management)
export interface Brand {
  id: string;
  nameEn: string;
  nameId: string;
  logoUrl: string;
  totalWatches: number; // Calculated
  totalAccessories: number; // Calculated
  isActive: boolean;
}

// Form validation errors
export interface ProductFormErrors {
  [key: string]: string | undefined;
}

// API Response Types
export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AttributeListResponse {
  data: ProductAttribute[];
  total: number;
}
