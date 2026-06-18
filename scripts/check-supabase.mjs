// Read-only connectivity check against the real Supabase project.
// Creates NO data. Loads env from .env.local / .env. Run: node scripts/check-supabase.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* file may not exist */
    }
  }
}

loadEnv();
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
console.log('URL set:', Boolean(url), '| KEY set:', Boolean(key));
if (!url || !key) {
  console.error('Missing env vars. Aborting.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let ok = true;

// 1. Prelogin RPC exists and is callable by anon (returns null for unknown email).
{
  const { data, error } = await supabase.rpc('get_salt_by_email', {
    p_email: `nonexistent-${Date.now()}@example.com`,
  });
  if (error) {
    ok = false;
    console.error('❌ RPC get_salt_by_email failed:', error.message);
  } else {
    console.log('✅ RPC get_salt_by_email reachable; returned:', data);
  }
}

// 2. RLS blocks anonymous reads of profiles (should return 0 rows, not data).
{
  const { data, error } = await supabase.from('profiles').select('user_id').limit(1);
  if (error) {
    console.log('✅ profiles select blocked/errored for anon (expected):', error.message);
  } else if (Array.isArray(data) && data.length === 0) {
    console.log('✅ profiles select returned 0 rows for anon (RLS working).');
  } else {
    ok = false;
    console.error('❌ profiles readable by anon — RLS misconfigured! rows:', data?.length);
  }
}

console.log(ok ? '\nAll connectivity checks passed.' : '\nSome checks failed.');
process.exit(ok ? 0 : 1);
