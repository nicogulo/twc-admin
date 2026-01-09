// Homepage Settings Types

export type LinkType = 'Brand' | 'Category' | 'Custom URL';
export type StatusType = 'Enabled' | 'Disabled';

// Hero Media & Collection Highlights (Repeatable)
export interface HomepageItem {
  id: string;
  titleEn: string;
  titleId: string;
  subtitleEn?: string;
  subtitleId?: string;
  linkType: LinkType;
  linkedBrandId?: string; // Required if linkType is 'Brand'
  linkedCategoryId?: string; // Required if linkType is 'Category'
  customUrl?: string; // Required if linkType is 'Custom URL'
  imageUrl: string;
  imageFile?: File;
  status: StatusType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageItemFormData
  extends Omit<HomepageItem, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface HomepageFormErrors {
  [key: string]: string | undefined;
}
