import pg from 'pg';
import pgvector from 'pgvector/pg';
import { config } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export let isDbConnected = false;

export async function initDb(): Promise<void> {
  let client;
  try {
    client = await pool.connect();
    // Register pgvector types with pg client
    await pgvector.registerType(client);

    // Initialize pgvector extension & core tables
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        faculty VARCHAR(255) NOT NULL,
        faculty_code VARCHAR(20) NOT NULL,
        department VARCHAR(255) NOT NULL,
        lead_investigator VARCHAR(255) NOT NULL,
        abstract TEXT NOT NULL,
        problem_statement TEXT,
        technology_stack JSONB DEFAULT '[]',
        development_stage VARCHAR(100) DEFAULT 'Lab Prototype',
        trl_level INT DEFAULT 4,
        erl_level INT DEFAULT 5,
        ip_status VARCHAR(100) DEFAULT 'None',
        target_industries JSONB DEFAULT '[]',
        commercial_readiness VARCHAR(50) DEFAULT 'Medium',
        estimated_funding_pkr NUMERIC(15, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        project_code VARCHAR(50),
        document_name VARCHAR(255) NOT NULL,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_agent_personas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        faculty_code VARCHAR(20) NOT NULL,
        avatar VARCHAR(50),
        system_prompt TEXT NOT NULL,
        accent_color VARCHAR(50),
        voice_lang VARCHAR(20) DEFAULT 'en-US',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    isDbConnected = true;
    console.log('✅ PostgreSQL 16 + pgvector connected and schemas initialized.');
  } catch (error) {
    isDbConnected = false;
    console.warn(
      '⚠️ PostgreSQL connection not available on ' + config.database.url + '. Operating in resilient fallback mode.'
    );
  } finally {
    if (client) client.release();
  }
}

