// System Settings Types

export interface SystemSettings {
  id: string;
  multiLanguageEnabled: boolean;
  defaultLanguage: 'en' | 'id';
  updatedAt: string;
  updatedBy: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}
