import pg from 'pg';

/**
 * Asynchronously updates a user's is_active status in Supabase public.users table.
 * Non-blocking helper: errors are caught and logged so local operations never fail.
 */
export async function syncUserSuspensionToSupabase(email: string, isActive: boolean): Promise<void> {
  const connectionUrl = process.env.SUPABASE_DATABASE_URL;
  if (!connectionUrl) return;

  const cleanUrl = connectionUrl.split('?')[0];
  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(
      `UPDATE public.users SET is_active = $1, updated_at = NOW() WHERE email = $2;`,
      [isActive, email.toLowerCase()]
    );
  } catch (err) {
    console.error('Non-blocking: Failed to sync user status to Supabase:', err);
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore disconnect errors
    }
  }
}
