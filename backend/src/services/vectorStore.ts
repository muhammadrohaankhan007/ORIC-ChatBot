import pgvector from 'pgvector/pg';
import { pool, isDbConnected } from '../config/db.js';
import { AiGateway } from './aiGateway.js';

export interface StoredChunk {
  id?: string;
  projectId?: string;
  projectCode?: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  similarity?: number;
}

// In-memory fallback if PostgreSQL is not connected
const inMemoryChunks: (StoredChunk & { embedding: number[] })[] = [];

export class VectorStore {
  /**
   * Save chunks with vector embeddings to PostgreSQL pgvector
   */
  static async saveChunks(
    chunks: { index: number; content: string }[],
    documentName: string,
    projectId?: string,
    projectCode?: string
  ): Promise<number> {
    let savedCount = 0;

    for (const chunk of chunks) {
      const embedding = await AiGateway.generateEmbedding(chunk.content);

      if (isDbConnected) {
        try {
          await pool.query(
            `INSERT INTO document_chunks (project_id, project_code, document_name, chunk_index, content, embedding)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              projectId || null,
              projectCode || null,
              documentName,
              chunk.index,
              chunk.content,
              pgvector.toSql(embedding)
            ]
          );
          savedCount++;
        } catch (err) {
          console.warn('Failed to insert chunk into pgvector, storing in memory:', err);
          inMemoryChunks.push({
            projectId,
            projectCode,
            documentName,
            chunkIndex: chunk.index,
            content: chunk.content,
            embedding
          });
          savedCount++;
        }
      } else {
        inMemoryChunks.push({
          projectId,
          projectCode,
          documentName,
          chunkIndex: chunk.index,
          content: chunk.content,
          embedding
        });
        savedCount++;
      }
    }

    return savedCount;
  }

  /**
   * Search vector similarity
   */
  static async searchSimilar(queryText: string, limit = 4, projectCode?: string): Promise<StoredChunk[]> {
    const queryEmbedding = await AiGateway.generateEmbedding(queryText);

    if (isDbConnected) {
      try {
        let querySql = `
          SELECT id, project_id, project_code, document_name, chunk_index, content,
                 1 - (embedding <=> $1) as similarity
          FROM document_chunks
        `;
        const params: any[] = [pgvector.toSql(queryEmbedding)];

        if (projectCode) {
          querySql += ` WHERE project_code = $2`;
          params.push(projectCode);
        }

        querySql += ` ORDER BY embedding <=> $1 LIMIT ${limit}`;

        const result = await pool.query(querySql, params);
        return result.rows.map(r => ({
          id: r.id,
          projectId: r.project_id,
          projectCode: r.project_code,
          documentName: r.document_name,
          chunkIndex: r.chunk_index,
          content: r.content,
          similarity: parseFloat(r.similarity)
        }));
      } catch (err) {
        console.warn('pgvector search failed, falling back to in-memory search:', err);
      }
    }

    // In-memory cosine distance fallback
    const scored = inMemoryChunks.map(c => {
      let dot = 0;
      for (let i = 0; i < 1536; i++) {
        dot += (c.embedding[i] || 0) * (queryEmbedding[i] || 0);
      }
      return {
        ...c,
        similarity: dot
      };
    });

    scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    return scored.slice(0, limit);
  }
}

