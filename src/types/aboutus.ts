// About Us Page Types

export interface AboutUsPage {
  id: string;
  heroMediaUrl?: string; // Image or Video
  heroMediaType?: 'image' | 'video';
  heroMediaFile?: File;
  titleEn: string;
  titleId: string;
  contentEn?: string; // Rich Text
  contentId?: string; // Rich Text
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AboutUsFormErrors {
  [key: string]: string | undefined;
}
