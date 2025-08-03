#!/usr/bin/env ts-node

/**
 * Database Migration Script for Postanos
 * 
 * This script applies the database schema to the local D1 instance.
 * Run with: npm run db:migrate
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const SCHEMA_FILE = './lib/db/schema.sql';
const DB_NAME = 'postanos-prod';

function main() {
  console.log('🗄️  Starting database migration...');
  
  // Check if schema file exists
  if (!existsSync(SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${SCHEMA_FILE}`);
    process.exit(1);
  }
  
  try {
    // Apply schema to local D1 database
    console.log(`📝 Applying schema to ${DB_NAME}...`);
    const command = `wrangler d1 execute ${DB_NAME} --local --file=${SCHEMA_FILE}`;
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Database migration completed successfully!');
    console.log('💡 To run against production, use: npm run db:migrate:prod');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Handle CLI execution
if (require.main === module) {
  main();
}

export { main as migrate };