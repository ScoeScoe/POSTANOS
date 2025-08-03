/**
 * Postcard Scheduler Cloudflare Worker
 * 
 * This worker runs on a Cron schedule to:
 * 1. Query pending postcard jobs from D1 database
 * 2. Verify recipient addresses via Lob API
 * 3. Create and send postcards via Lob API
 * 4. Update job status and send notifications
 */

import type { Job, JobStatus, ContactWithOccasions, Template } from '../../types/database';

// Environment bindings
export interface Env {
  // D1 Database binding
  DB: D1Database;
  
  // Environment variables
  LOB_API_KEY: string;
  LOB_API_VERSION?: string; // Default: 2024-01-01
  LOB_SANDBOX_MODE?: string; // "true" for testing
  
  // Optional: notification services
  ONESIGNAL_APP_ID?: string;
  ONESIGNAL_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
  
  // R2 bucket for images (if needed)
  IMAGES_BUCKET?: R2Bucket;
}

// Lob API types
interface LobAddressVerification {
  id: string;
  recipient_moved: boolean;
  primary_line: string;
  secondary_line?: string;
  city: string;
  state: string;
  zip_code: string;
  deliverability: 'deliverable' | 'deliverable_unnecessary_unit' | 'deliverable_incorrect_unit' | 'deliverable_missing_unit' | 'undeliverable';
  components: any;
}

interface LobPostcard {
  id: string;
  url: string;
  carrier: string;
  tracking_number?: string;
  expected_delivery_date: string;
  date_created: string;
  date_modified: string;
  send_date: string;
}

export default {
  /**
   * Scheduled handler - runs on Cron schedule
   * Recommended schedule: "0 9 * * *" (daily at 9 AM UTC)
   */
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Postcard scheduler running...');
    
    try {
      // 1. Query for pending jobs that should be sent today
      const pendingJobs = await getPendingJobs(env.DB);
      console.log(`Found ${pendingJobs.length} pending jobs`);
      
      // Process jobs in batches to avoid timeouts
      const batchSize = 10;
      for (let i = 0; i < pendingJobs.length; i += batchSize) {
        const batch = pendingJobs.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.allSettled(
          batch.map(job => processJob(job, env))
        );
      }
      
      console.log('Postcard scheduler completed');
    } catch (error) {
      console.error('Scheduler error:', error);
      // In production, you'd want to send this to an error tracking service
    }
  },
  
  /**
   * Optional: Handle direct fetch requests for testing
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Simple auth check for manual triggers
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.LOB_API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Manually trigger the scheduled job
    await this.scheduled({ scheduledTime: Date.now(), cron: '' } as any, env, ctx);
    return new Response('Scheduler triggered manually', { status: 200 });
  }
};

/**
 * Query D1 for jobs that need to be processed today
 */
async function getPendingJobs(db: D1Database): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0];
  
  // Query for pending jobs with full relationship data
  const query = `
    SELECT 
      j.*,
      o.label as occasion_label,
      o.auto_send,
      c.full_name,
      c.address_json,
      t.front_image_url,
      t.back_image_url,
      t.message_text,
      u.email as user_email,
      u.phone_opt_in,
      u.id as user_id
    FROM jobs j
    JOIN occasions o ON j.occasion_id = o.id
    JOIN contacts c ON o.contact_id = c.id
    JOIN users u ON c.user_id = u.id
    LEFT JOIN templates t ON j.template_id = t.id
    WHERE j.status = 'pending'
      AND j.send_date <= ?
    ORDER BY j.created_at ASC
    LIMIT 100
  `;
  
  const result = await db.prepare(query).bind(today).all();
  return result.results || [];
}

/**
 * Process a single job
 */
async function processJob(job: any, env: Env): Promise<void> {
  console.log(`Processing job ${job.id} for ${job.full_name}`);
  
  try {
    // Update status to processing
    await updateJobStatus(env.DB, job.id, 'processing');
    
    // Parse address JSON
    const address = JSON.parse(job.address_json);
    
    // 1. Verify address with Lob
    const verifiedAddress = await verifyAddress(address, env);
    
    if (verifiedAddress.deliverability !== 'deliverable' && 
        verifiedAddress.deliverability !== 'deliverable_unnecessary_unit') {
      throw new Error(`Address undeliverable: ${verifiedAddress.deliverability}`);
    }
    
    // 2. Create postcard with Lob
    const postcard = await createPostcard({
      to: {
        name: job.full_name,
        address_line1: verifiedAddress.primary_line,
        address_line2: verifiedAddress.secondary_line,
        address_city: verifiedAddress.city,
        address_state: verifiedAddress.state,
        address_zip: verifiedAddress.zip_code,
      },
      from: {
        name: 'Postanos',
        address_line1: '123 Main St', // TODO: Configure from env
        address_city: 'San Francisco',
        address_state: 'CA',
        address_zip: '94105',
      },
      front: job.front_image_url,
      back: job.back_image_url || generateBackTemplate(job.message_text),
      size: '4x6',
      description: `${job.occasion_label} card for ${job.full_name}`,
      metadata: {
        job_id: job.id,
        user_id: job.user_id,
      },
    }, env);
    
    // 3. Update job with Lob details
    await env.DB.prepare(`
      UPDATE jobs 
      SET status = ?, lob_id = ?, lob_tracking_url = ?, processed_at = ?
      WHERE id = ?
    `).bind(
      'sent',
      postcard.id,
      postcard.url,
      new Date().toISOString(),
      job.id
    ).run();
    
    // 4. Send notification if not auto-send
    if (!job.auto_send && !job.notification_sent) {
      await sendNotification(job, postcard, env);
    }
    
    console.log(`Successfully sent postcard ${postcard.id} for job ${job.id}`);
  } catch (error) {
    console.error(`Failed to process job ${job.id}:`, error);
    
    // Update job status to failed
    await env.DB.prepare(`
      UPDATE jobs 
      SET status = ?, error_message = ?
      WHERE id = ?
    `).bind(
      'failed',
      error instanceof Error ? error.message : 'Unknown error',
      job.id
    ).run();
  }
}

/**
 * Verify address using Lob API
 */
async function verifyAddress(address: any, env: Env): Promise<LobAddressVerification> {
  const lobUrl = env.LOB_SANDBOX_MODE === 'true' 
    ? 'https://api.lob.com/v1/us_verifications'
    : 'https://api.lob.com/v1/us_verifications';
  
  const response = await fetch(lobUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(env.LOB_API_KEY + ':')}`,
      'Content-Type': 'application/json',
      'Lob-Version': env.LOB_API_VERSION || '2024-01-01',
    },
    body: JSON.stringify({
      primary_line: address.line1,
      secondary_line: address.line2,
      city: address.city,
      state: address.state,
      zip_code: address.postal_code,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lob address verification failed: ${error}`);
  }
  
  return await response.json();
}

/**
 * Create postcard using Lob API
 */
async function createPostcard(data: any, env: Env): Promise<LobPostcard> {
  const lobUrl = env.LOB_SANDBOX_MODE === 'true'
    ? 'https://api.lob.com/v1/postcards'
    : 'https://api.lob.com/v1/postcards';
  
  const response = await fetch(lobUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(env.LOB_API_KEY + ':')}`,
      'Content-Type': 'application/json',
      'Lob-Version': env.LOB_API_VERSION || '2024-01-01',
    },
    body: JSON.stringify({
      ...data,
      // Add test flag in sandbox mode
      ...(env.LOB_SANDBOX_MODE === 'true' && { test: true }),
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lob postcard creation failed: ${error}`);
  }
  
  return await response.json();
}

/**
 * Generate back template HTML for postcard
 */
function generateBackTemplate(message: string): string {
  // This would return an HTML template URL or inline HTML
  // For now, returning a simple template
  return `
    <html>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
        <div style="padding: 20px; font-size: 14px; line-height: 1.6;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <div style="position: absolute; bottom: 20px; right: 20px; font-size: 10px; color: #666;">
          Sent with ❤️ by Postanos
        </div>
      </body>
    </html>
  `;
}

/**
 * Update job status in database
 */
async function updateJobStatus(db: D1Database, jobId: string, status: string): Promise<void> {
  await db.prepare('UPDATE jobs SET status = ? WHERE id = ?')
    .bind(status, jobId)
    .run();
}

/**
 * Send notification to user about postcard being sent
 */
async function sendNotification(job: any, postcard: LobPostcard, env: Env): Promise<void> {
  // This would integrate with OneSignal for web push
  // and/or Twilio for SMS notifications
  
  console.log(`Would send notification for job ${job.id} to user ${job.user_email}`);
  
  // Mark notification as sent
  await env.DB.prepare('UPDATE jobs SET notification_sent = true WHERE id = ?')
    .bind(job.id)
    .run();
}