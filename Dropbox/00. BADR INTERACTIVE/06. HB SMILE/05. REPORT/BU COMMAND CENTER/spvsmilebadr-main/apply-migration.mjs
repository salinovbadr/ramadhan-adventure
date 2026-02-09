import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration file
const migrationPath = join(__dirname, 'supabase', 'migrations', '20260209060000_fix_esat_rls_policies.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('Applying migration: 20260209060000_fix_esat_rls_policies.sql');
console.log('SQL:', migrationSQL);

// Execute the migration
const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration applied successfully!');
console.log('Data:', data);
