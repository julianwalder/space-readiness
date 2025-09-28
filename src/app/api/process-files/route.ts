import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as xlsx from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface ProcessFilesRequest {
  submissionId: string;
  ventureId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessFilesRequest = await request.json();
    const { submissionId, ventureId } = body;

    if (!submissionId || !ventureId) {
      return NextResponse.json(
        { error: 'Missing submissionId or ventureId' },
        { status: 400 }
      );
    }

    // Get all files for this submission
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('submission_id', submissionId);

    if (filesError || !files) {
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files found for this submission' },
        { status: 404 }
      );
    }

    console.log(`Processing ${files.length} files for submission ${submissionId}`);

    // Process each file
    for (const file of files) {
      try {
        await processFile(file, ventureId);
      } catch (error) {
        console.error(`Failed to process file ${file.id}:`, error);
        // Continue processing other files even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} files`,
      filesProcessed: files.length
    });

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processFile(file: { path: string; mime: string }, ventureId: string) {
  console.log(`Processing file: ${file.path} (${file.mime})`);

  // Download file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('readiness-uploads')
    .download(file.path);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  // Extract text based on file type
  let extractedText = '';
  
  try {
    if (file.mime === 'application/pdf') {
      extractedText = await extractTextFromPDF(fileData);
    } else if (file.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               file.mime === 'application/msword') {
      extractedText = await extractTextFromWord(fileData);
    } else if (file.mime === 'text/plain') {
      extractedText = await fileData.text();
    } else if (file.mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               file.mime === 'application/vnd.ms-excel') {
      extractedText = await extractTextFromExcel(fileData);
    } else {
      console.warn(`Unsupported file type: ${file.mime}`);
      return;
    }
  } catch (error) {
    console.error(`Failed to extract text from ${file.path}:`, error);
    return;
  }

  if (!extractedText || extractedText.trim().length === 0) {
    console.warn(`No text extracted from ${file.path}`);
    return;
  }

  console.log(`Extracted ${extractedText.length} characters from ${file.path}`);

  // Chunk the text
  const chunks = chunkText(extractedText, file.path);
  console.log(`Created ${chunks.length} chunks for ${file.path}`);

  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    try {
      // Generate embedding
      const embedding = await generateEmbedding(chunk.content);
      
      // Determine relevant dimensions based on content
      const dimensions = determineRelevantDimensions(chunk.content);
      
      // Store chunk in database
      const { error: chunkError } = await supabase
        .from('chunks')
        .insert({
          file_id: file.id,
          content: chunk.content,
          source_ref: chunk.sourceRef,
          dimensions: dimensions,
          embedding: embedding
        });

      if (chunkError) {
        console.error(`Failed to store chunk ${i} for file ${file.id}:`, chunkError);
      } else {
        console.log(`Stored chunk ${i + 1}/${chunks.length} for file ${file.id}`);
      }
    } catch (error) {
      console.error(`Failed to process chunk ${i} for file ${file.id}:`, error);
    }
  }
}

async function extractTextFromPDF(fileData: Blob): Promise<string> {
  const arrayBuffer = await fileData.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str: string }) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

async function extractTextFromWord(fileData: Blob): Promise<string> {
  const arrayBuffer = await fileData.arrayBuffer();
  const result = await mammoth.extractRawText({ buffer: arrayBuffer });
  return result.value;
}

async function extractTextFromExcel(fileData: Blob): Promise<string> {
  const arrayBuffer = await fileData.arrayBuffer();
  const workbook = xlsx.read(arrayBuffer, { type: 'array' });
  
  let fullText = '';
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetText = xlsx.utils.sheet_to_txt(sheet);
    fullText += `Sheet: ${sheetName}\n${sheetText}\n\n`;
  }
  
  return fullText;
}

function chunkText(text: string, filePath: string): Array<{ content: string; sourceRef: string }> {
  const maxChunkSize = 1000; // characters
  const overlap = 200; // characters
  
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;
  
  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length);
    let chunkText = text.slice(start, end);
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentence = chunkText.lastIndexOf('.');
      const lastNewline = chunkText.lastIndexOf('\n');
      const breakPoint = Math.max(lastSentence, lastNewline);
      
      if (breakPoint > start + maxChunkSize * 0.5) {
        chunkText = chunkText.slice(0, breakPoint + 1);
        end = start + breakPoint + 1;
      }
    }
    
    chunks.push({
      content: chunkText.trim(),
      sourceRef: `${filePath}#chunk_${chunkIndex}`
    });
    
    start = end - overlap;
    chunkIndex++;
  }
  
  return chunks;
}

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

function determineRelevantDimensions(content: string): string[] {
  const dimensions = [];
  const lowerContent = content.toLowerCase();
  
  // Technology-related keywords
  if (lowerContent.includes('technology') || lowerContent.includes('tech') || 
      lowerContent.includes('patent') || lowerContent.includes('prototype') ||
      lowerContent.includes('trl') || lowerContent.includes('readiness')) {
    dimensions.push('Technology');
  }
  
  // Market-related keywords
  if (lowerContent.includes('market') || lowerContent.includes('customer') ||
      lowerContent.includes('revenue') || lowerContent.includes('sales') ||
      lowerContent.includes('competition') || lowerContent.includes('pricing')) {
    dimensions.push('Customer/Market');
  }
  
  // Team-related keywords
  if (lowerContent.includes('team') || lowerContent.includes('founder') ||
      lowerContent.includes('employee') || lowerContent.includes('hire') ||
      lowerContent.includes('experience') || lowerContent.includes('skill')) {
    dimensions.push('Team');
  }
  
  // Business model keywords
  if (lowerContent.includes('business model') || lowerContent.includes('revenue model') ||
      lowerContent.includes('pricing') || lowerContent.includes('monetization') ||
      lowerContent.includes('strategy') || lowerContent.includes('plan')) {
    dimensions.push('Business Model');
  }
  
  // IP-related keywords
  if (lowerContent.includes('patent') || lowerContent.includes('ip') ||
      lowerContent.includes('intellectual property') || lowerContent.includes('trademark') ||
      lowerContent.includes('copyright') || lowerContent.includes('license')) {
    dimensions.push('IP');
  }
  
  // Funding-related keywords
  if (lowerContent.includes('funding') || lowerContent.includes('investment') ||
      lowerContent.includes('investor') || lowerContent.includes('capital') ||
      lowerContent.includes('round') || lowerContent.includes('valuation')) {
    dimensions.push('Funding');
  }
  
  // Sustainability keywords
  if (lowerContent.includes('sustainability') || lowerContent.includes('environment') ||
      lowerContent.includes('carbon') || lowerContent.includes('green') ||
      lowerContent.includes('esg') || lowerContent.includes('impact')) {
    dimensions.push('Sustainability');
  }
  
  // Integration keywords
  if (lowerContent.includes('integration') || lowerContent.includes('partnership') ||
      lowerContent.includes('collaboration') || lowerContent.includes('ecosystem') ||
      lowerContent.includes('api') || lowerContent.includes('platform')) {
    dimensions.push('Integration');
  }
  
  // If no specific dimensions found, add all for general relevance
  if (dimensions.length === 0) {
    dimensions.push('Technology', 'Customer/Market', 'Team', 'Business Model', 'IP', 'Funding', 'Sustainability', 'Integration');
  }
  
  return dimensions;
}
