import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend, process.cwd(), or root directory
export function loadEnv(): void {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false });
  dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env'), override: false });
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: false });
}

loadEnv();

export const config = {
  get port(): number {
    return parseInt(process.env.PORT || '8000', 10);
  },
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  },
  database: {
    get url(): string {
      return process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shu_oric';
    },
    get host(): string {
      return process.env.PGHOST || 'localhost';
    },
    get port(): number {
      return parseInt(process.env.PGPORT || '5432', 10);
    },
    get user(): string {
      return process.env.PGUSER || 'postgres';
    },
    get password(): string {
      return process.env.PGPASSWORD || 'postgres';
    },
    get database(): string {
      return process.env.PGDATABASE || 'shu_oric';
    }
  },
  ai: {
    get geminiApiKey(): string {
      return process.env.GEMINI_API_KEY || '';
    },
    get openaiApiKey(): string {
      return process.env.OPENAI_API_KEY || '';
    },
    get geminiModel(): string {
      return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    }
  },
  cors: {
    get origin(): string {
      return process.env.CORS_ORIGIN || '*';
    }
  }
};
