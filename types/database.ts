/**
 * Database Schema Types for Postanos
 * 
 * These types correspond to the Cloudflare D1 (SQLite) database tables
 */

// User model - Core user information
export interface User {
  id: string;
  clerk_user_id?: string | null;
  email: string;
  phone_opt_in: boolean;
  stripe_customer_id?: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at?: string; // ISO 8601 timestamp
}

// Contact model - Recipients of postcards
export interface Contact {
  id: string;
  user_id: string; // Foreign key to User
  full_name: string;
  address_json: AddressData; // Structured address data
  created_at: string; // ISO 8601 timestamp
  updated_at?: string; // ISO 8601 timestamp
}

// Address data structure (JSON field)
export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string; // ISO 3166-1 alpha-2 code (e.g., "US", "CA")
  verified?: boolean; // Lob address verification status
  verification_data?: any; // Raw Lob verification response
}

// Occasion model - Important dates for contacts
export interface Occasion {
  id: string;
  contact_id: string; // Foreign key to Contact
  label: string; // e.g., "Birthday", "Anniversary"
  date: string; // ISO 8601 date (YYYY-MM-DD)
  lead_days: number; // Days before date to send card (e.g., 7 for week early)
  auto_send: boolean; // Whether to automatically send without approval
  recurring: boolean; // Whether this occurs annually
  created_at: string; // ISO 8601 timestamp
  updated_at?: string; // ISO 8601 timestamp
}

// Template model - Postcard designs and content
export interface Template {
  id: string;
  user_id: string; // Foreign key to User
  occasion_label?: string; // Optional label to match with occasions
  front_image_url: string; // URL to R2/CDN for front image
  back_image_url?: string; // Optional custom back design
  message_text: string; // The message content
  ai_style_json?: AIStyleData; // AI generation parameters
  is_default?: boolean; // Whether this is the default template for an occasion type
  created_at: string; // ISO 8601 timestamp
  updated_at?: string; // ISO 8601 timestamp
}

// AI style parameters (JSON field)
export interface AIStyleData {
  art_style?: string; // e.g., "watercolor", "photorealistic", "cartoon"
  art_prompt?: string; // DALL-E prompt used
  message_tone?: string; // e.g., "heartfelt", "funny", "professional"
  message_prompt?: string; // GPT prompt used
  model_versions?: {
    art?: string; // e.g., "dall-e-3"
    text?: string; // e.g., "gpt-4"
  };
}

// Job model - Scheduled postcard sends
export interface Job {
  id: string;
  occasion_id: string; // Foreign key to Occasion
  template_id?: string; // Foreign key to Template (null if using default)
  send_date: string; // ISO 8601 date when card should be sent
  status: JobStatus;
  lob_id?: string; // Lob API postcard ID
  lob_tracking_url?: string; // Lob tracking URL
  notification_sent: boolean;
  error_message?: string; // Error details if failed
  created_at: string; // ISO 8601 timestamp
  processed_at?: string; // ISO 8601 timestamp when job was processed
  delivered_at?: string; // ISO 8601 timestamp when delivered (from webhook)
}

// Job status enum
export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// Additional types for API responses and operations

// Create/Update DTOs (Data Transfer Objects)
export type CreateUserDTO = Omit<User, "id" | "created_at">;
export type UpdateUserDTO = Partial<CreateUserDTO>;

export type CreateContactDTO = Omit<Contact, "id" | "created_at">;
export type UpdateContactDTO = Partial<CreateContactDTO>;

export type CreateOccasionDTO = Omit<Occasion, "id" | "created_at">;
export type UpdateOccasionDTO = Partial<CreateOccasionDTO>;

export type CreateTemplateDTO = Omit<Template, "id" | "created_at">;
export type UpdateTemplateDTO = Partial<CreateTemplateDTO>;

export type CreateJobDTO = Omit<Job, "id" | "created_at" | "status" | "notification_sent"> & {
  status?: JobStatus;
};

// Query result types with relations
export interface ContactWithOccasions extends Contact {
  occasions: Occasion[];
}

export interface OccasionWithContact extends Occasion {
  contact: Contact;
}

export interface JobWithDetails extends Job {
  occasion: OccasionWithContact;
  template?: Template;
  user?: User;
}

// Pagination helper
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}