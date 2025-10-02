import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

export interface DocumentChunk {
  id: number;
  content: string;
  sourceRef: string;
  dimensions: string[];
  similarity?: number;
}

export interface RAGResult {
  chunks: DocumentChunk[];
  totalChunks: number;
  query: string;
}

/**
 * Query document chunks using semantic search
 */
export async function queryDocuments(
  ventureId: string,
  dimension: string,
  query: string,
  limit: number = 5
): Promise<RAGResult> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Get all chunks for this venture that are relevant to the dimension
    const { data: chunks, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      venture_id: ventureId,
      dimension: dimension,
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      console.error('Error querying chunks:', error);
      return { chunks: [], totalChunks: 0, query };
    }

    return {
      chunks: chunks || [],
      totalChunks: chunks?.length || 0,
      query
    };
  } catch (error) {
    console.error('RAG query error:', error);
    return { chunks: [], totalChunks: 0, query };
  }
}

/**
 * Get all document chunks for a venture and dimension
 */
export async function getDocumentChunks(
  ventureId: string,
  dimension: string,
  limit: number = 10
): Promise<DocumentChunk[]> {
  try {
    // Get submission for this venture
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('id')
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !submission) {
      console.log('No submission found for venture:', ventureId);
      return [];
    }

    // Get files for this submission
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('id')
      .eq('submission_id', submission.id);

    if (filesError || !files || files.length === 0) {
      console.log('No files found for submission:', submission.id);
      return [];
    }

    const fileIds = files.map(f => f.id);

    // Get chunks for these files that match the dimension
    const { data: chunks, error: chunksError } = await supabase
      .from('chunks')
      .select('id, content, source_ref, dimensions')
      .in('file_id', fileIds)
      .contains('dimensions', [dimension])
      .limit(limit);

    if (chunksError) {
      console.error('Error fetching chunks:', chunksError);
      return [];
    }

    return chunks?.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      sourceRef: chunk.source_ref,
      dimensions: chunk.dimensions
    })) || [];
  } catch (error) {
    console.error('Error getting document chunks:', error);
    return [];
  }
}

/**
 * Generate evidence from document content
 */
export async function generateEvidenceFromDocuments(
  ventureId: string,
  dimension: string,
  _context: Record<string, unknown>
): Promise<string[]> {
  try {
    const chunks = await getDocumentChunks(ventureId, dimension, 5);
    
    if (chunks.length === 0) {
      return ['No relevant documents found for analysis'];
    }

    const evidence: string[] = [];
    
    // Group chunks by source file
    const chunksBySource = chunks.reduce((acc, chunk) => {
      const source = chunk.sourceRef.split('#')[0];
      if (!acc[source]) acc[source] = [];
      acc[source].push(chunk);
      return acc;
    }, {} as Record<string, DocumentChunk[]>);

    // Generate evidence for each source
    for (const [source, sourceChunks] of Object.entries(chunksBySource)) {
      const fileName = source.split('/').pop() || source;
      const content = sourceChunks.map(c => c.content).join(' ');
      
      // Truncate content if too long
      const truncatedContent = content.length > 500 
        ? content.substring(0, 500) + '...' 
        : content;
      
      evidence.push(`Document: ${fileName} - ${truncatedContent}`);
    }

    return evidence;
  } catch (error) {
    console.error('Error generating evidence from documents:', error);
    return ['Error analyzing documents'];
  }
}

/**
 * Generate dynamic recommendations based on document content
 */
export async function generateRecommendationsFromDocuments(
  ventureId: string,
  dimension: string,
  context: Record<string, unknown>
): Promise<Array<{ action: string; impact: 'low'|'medium'|'high'; eta_weeks?: number; dependency?: string }>> {
  try {
    const chunks = await getDocumentChunks(ventureId, dimension, 3);
    
    if (chunks.length === 0) {
      return [];
    }

    // Use OpenAI to analyze the document content and generate recommendations
    const documentContent = chunks.map(c => c.content).join('\n\n');
    
    const prompt = `Based on the following document content for a ${dimension} assessment, generate 2-3 specific, actionable recommendations. Focus on concrete next steps that can be taken.

Document content:
${documentContent}

Context about the venture:
${JSON.stringify(context, null, 2)}

Please respond with a JSON array of recommendations, each with:
- action: A specific, actionable recommendation
- impact: "low", "medium", or "high"
- eta_weeks: Number of weeks to complete (optional)
- dependency: Any dependencies (optional)

Example format:
[
  {
    "action": "Complete technical validation testing",
    "impact": "high",
    "eta_weeks": 6
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business advisor analyzing documents to provide specific, actionable recommendations. Always respond with valid JSON arrays.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const recommendationsText = response.choices[0]?.message?.content;
    if (!recommendationsText) {
      return [];
    }

    try {
      const recommendations = JSON.parse(recommendationsText);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (parseError) {
      console.error('Failed to parse recommendations:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating recommendations from documents:', error);
    return [];
  }
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}
