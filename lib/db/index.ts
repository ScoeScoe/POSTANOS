/**
 * Typed D1 Database Client for Postanos
 * 
 * Provides type-safe database operations for Cloudflare D1
 */

import type { 
  User, Contact, Occasion, Template, Job,
  CreateUserDTO, CreateContactDTO, CreateOccasionDTO, 
  CreateTemplateDTO, CreateJobDTO, AddressData, AIStyleData
} from '../../types/database';

// Import JobStatus as a regular import (not type-only) so we can use it as a value
import { JobStatus } from '../../types/database';

// Import Cloudflare Workers types
import type { D1Database, D1Result } from '@cloudflare/workers-types';

// Re-export all types for convenience
export * from '../../types/database';

/**
 * Get D1 database instance from environment bindings
 * Works in both Pages Functions and Workers
 */
export function getDb(): D1Database {
  // In Cloudflare Pages Functions, the binding is available on env
  const globalAny = globalThis as any;
  
  // Try different ways to access the DB binding
  if (globalAny.DB) {
    return globalAny.DB;
  }
  
  // In some contexts, bindings might be in process.env
  if (process.env.DB) {
    return process.env.DB as unknown as D1Database;
  }
  
  throw new Error('D1 database binding "DB" not found. Make sure it\'s configured in wrangler.toml and Cloudflare Pages settings.');
}

/**
 * Execute a prepared statement and return all results
 */
export async function query<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).all();
  
  if (!result.success) {
    throw new Error(`Database query failed: ${result.error}`);
  }
  
  return (result.results as T[]) || [];
}

/**
 * Execute a prepared statement and return the first result
 */
export async function queryFirst<T = any>(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).first();
  
  return (result as T) || null;
}

/**
 * Execute a prepared statement for insert/update/delete operations
 */
export async function execute(
  db: D1Database,
  sql: string,
  params: any[] = []
): Promise<D1Result> {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).run();
  
  if (!result.success) {
    throw new Error(`Database execution failed: ${result.error}`);
  }
  
  return result;
}

/**
 * Database Operations - Users
 */
export const UserService = {
  async create(db: D1Database, data: CreateUserDTO): Promise<User> {
    const sql = `
      INSERT INTO users (clerk_user_id, email, phone_opt_in, stripe_customer_id)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `;
    
    const result = await queryFirst<User>(db, sql, [
      data.clerk_user_id,
      data.email,
      data.phone_opt_in,
      data.stripe_customer_id
    ]);
    
    if (!result) {
      throw new Error('Failed to create user');
    }
    
    return result;
  },

  async findByEmail(db: D1Database, email: string): Promise<User | null> {
    return queryFirst<User>(db, 'SELECT * FROM users WHERE email = ?', [email]);
  },

  async findById(db: D1Database, id: string): Promise<User | null> {
    return queryFirst<User>(db, 'SELECT * FROM users WHERE id = ?', [id]);
  },

  async update(db: D1Database, id: string, data: Partial<CreateUserDTO>): Promise<User | null> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    const sql = `UPDATE users SET ${fields} WHERE id = ? RETURNING *`;
    return queryFirst<User>(db, sql, [...values, id]);
  },

  async findByClerkId(db: D1Database, clerkUserId: string): Promise<User | null> {
    return queryFirst<User>(db, 'SELECT * FROM users WHERE clerk_user_id = ?', [clerkUserId]);
  },

  async delete(db: D1Database, id: string): Promise<void> {
    await execute(db, 'DELETE FROM users WHERE id = ?', [id]);
  }
};

/**
 * Database Operations - Contacts
 */
export const ContactService = {
  async create(db: D1Database, data: CreateContactDTO): Promise<Contact> {
    const sql = `
      INSERT INTO contacts (user_id, full_name, address_json)
      VALUES (?, ?, ?)
      RETURNING *
    `;
    
    const result = await queryFirst<Contact>(db, sql, [
      data.user_id,
      data.full_name,
      JSON.stringify(data.address_json)
    ]);
    
    if (!result) {
      throw new Error('Failed to create contact');
    }
    
    // Parse address_json back to object
    result.address_json = JSON.parse(result.address_json as unknown as string);
    
    return result;
  },

  async findByUserId(db: D1Database, userId: string): Promise<Contact[]> {
    const contacts = await query<Contact>(
      db, 
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    
    // Parse address_json for each contact
    return contacts.map(contact => ({
      ...contact,
      address_json: JSON.parse(contact.address_json as unknown as string)
    }));
  },

  async findById(db: D1Database, id: string): Promise<Contact | null> {
    const contact = await queryFirst<Contact>(db, 'SELECT * FROM contacts WHERE id = ?', [id]);
    
    if (contact) {
      contact.address_json = JSON.parse(contact.address_json as unknown as string);
    }
    
    return contact;
  }
};

/**
 * Database Operations - Occasions
 */
export const OccasionService = {
  async create(db: D1Database, data: CreateOccasionDTO): Promise<Occasion> {
    const sql = `
      INSERT INTO occasions (contact_id, label, date, lead_days, auto_send, recurring)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    
    const result = await queryFirst<Occasion>(db, sql, [
      data.contact_id,
      data.label,
      data.date,
      data.lead_days,
      data.auto_send,
      data.recurring
    ]);
    
    if (!result) {
      throw new Error('Failed to create occasion');
    }
    
    return result;
  },

  async findByContactId(db: D1Database, contactId: string): Promise<Occasion[]> {
    return query<Occasion>(
      db,
      'SELECT * FROM occasions WHERE contact_id = ? ORDER BY date ASC',
      [contactId]
    );
  },

  async findUpcoming(db: D1Database, days: number = 30): Promise<Occasion[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return query<Occasion>(
      db,
      'SELECT * FROM occasions WHERE date <= ? ORDER BY date ASC',
      [futureDate.toISOString().split('T')[0]]
    );
  }
};

/**
 * Database Operations - Jobs
 */
export const JobService = {
  async create(db: D1Database, data: CreateJobDTO): Promise<Job> {
    const sql = `
      INSERT INTO jobs (occasion_id, template_id, send_date, status)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `;
    
    const result = await queryFirst<Job>(db, sql, [
      data.occasion_id,
      data.template_id,
      data.send_date,
      data.status || JobStatus.PENDING
    ]);
    
    if (!result) {
      throw new Error('Failed to create job');
    }
    
    return result;
  },

  async findPending(db: D1Database, beforeDate?: string): Promise<Job[]> {
    const date = beforeDate || new Date().toISOString().split('T')[0];
    
    return query<Job>(
      db,
      'SELECT * FROM jobs WHERE status = ? AND send_date <= ? ORDER BY send_date ASC',
      [JobStatus.PENDING, date]
    );
  },

  async updateStatus(
    db: D1Database, 
    id: string, 
    status: JobStatus, 
    lobId?: string, 
    errorMessage?: string
  ): Promise<void> {
    const sql = `
      UPDATE jobs 
      SET status = ?, lob_id = ?, error_message = ?, processed_at = ?
      WHERE id = ?
    `;
    
    await execute(db, sql, [
      status,
      lobId || null,
      errorMessage || null,
      new Date().toISOString(),
      id
    ]);
  }
};

/**
 * Database Operations - Templates
 */
export const TemplateService = {
  async create(db: D1Database, data: CreateTemplateDTO): Promise<Template> {
    const sql = `
      INSERT INTO templates (user_id, occasion_label, front_image_url, back_image_url, message_text, ai_style_json, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    
    const result = await queryFirst<Template>(db, sql, [
      data.user_id,
      data.occasion_label,
      data.front_image_url,
      data.back_image_url,
      data.message_text,
      data.ai_style_json ? JSON.stringify(data.ai_style_json) : null,
      data.is_default
    ]);
    
    if (!result) {
      throw new Error('Failed to create template');
    }
    
    // Parse ai_style_json if present
    if (result.ai_style_json) {
      result.ai_style_json = JSON.parse(result.ai_style_json as unknown as string);
    }
    
    return result;
  },

  async findByUserId(db: D1Database, userId: string): Promise<Template[]> {
    const templates = await query<Template>(
      db,
      'SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    // Parse ai_style_json for each template
    return templates.map(template => ({
      ...template,
      ai_style_json: template.ai_style_json ? JSON.parse(template.ai_style_json as unknown as string) : undefined
    }));
  },

  async findDefault(db: D1Database, userId: string, occasionLabel?: string): Promise<Template | null> {
    const sql = occasionLabel
      ? 'SELECT * FROM templates WHERE user_id = ? AND occasion_label = ? AND is_default = true LIMIT 1'
      : 'SELECT * FROM templates WHERE user_id = ? AND is_default = true LIMIT 1';
    
    const params = occasionLabel ? [userId, occasionLabel] : [userId];
    const template = await queryFirst<Template>(db, sql, params);
    
    if (template && template.ai_style_json) {
      template.ai_style_json = JSON.parse(template.ai_style_json as unknown as string);
    }
    
    return template;
  }
};