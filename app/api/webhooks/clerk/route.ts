import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getDb, UserService } from '../../../../lib/db';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook received and verified:`, { id, eventType });

  // Ensure we have a valid user ID
  if (!id || typeof id !== 'string') {
    console.error('No valid user ID found in webhook data');
    return new Response('No valid user ID found', { status: 400 });
  }

  // At this point, TypeScript knows id is a string
  const userId: string = id;

  // Handle the webhook
  try {
    const db = getDb();

    switch (eventType) {
      case 'user.created':
        // Create user in D1 database
        await UserService.create(db, {
          clerk_user_id: userId,
          email: evt.data.email_addresses?.[0]?.email_address || '',
          phone_opt_in: false,
        });
        break;

      case 'user.updated':
        // Update user in D1 database
        const user = await UserService.findByClerkId(db, userId);
        if (user) {
          await UserService.update(db, user.id, {
            email: evt.data.email_addresses?.[0]?.email_address || user.email,
          });
        }
        break;

      case 'user.deleted':
        // Delete user from D1 database (optional - you might want to keep data)
        const userToDelete = await UserService.findByClerkId(db, userId);
        if (userToDelete) {
          await UserService.delete(db, userToDelete.id);
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
