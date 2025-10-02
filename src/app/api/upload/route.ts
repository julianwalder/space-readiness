import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx'
];

interface UploadRequest {
  ventureId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileContent: string; // base64 encoded
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { ventureId, fileName, fileSize, mimeType, fileContent } = body;

    // Validate input
    if (!ventureId || !fileName || !fileSize || !mimeType || !fileContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, Word, PowerPoint, Excel, or text files only.' },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'File extension not allowed' },
        { status: 400 }
      );
    }

    // Verify venture exists and user has access
    const { data: venture, error: ventureError } = await supabase
      .from('ventures')
      .select('id, name, org_id')
      .eq('id', ventureId)
      .single();

    if (ventureError || !venture) {
      return NextResponse.json(
        { error: 'Venture not found or access denied' },
        { status: 404 }
      );
    }

    // Get authenticated user from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Verify user has access to this venture
    if (venture.org_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('org_id', venture.org_id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Access denied to this venture' },
          { status: 403 }
        );
      }
    }

    // Create a new submission for this upload
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        venture_id: ventureId,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError || !submission) {
      console.error('Failed to create submission:', submissionError);
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      );
    }

    // Generate secure file path
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const filePath = `${user.id}/${ventureId}/${timestamp}_${sanitizedFileName}`;

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileContent, 'base64');

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('readiness-uploads')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload failed:', uploadError);
      
      // Clean up the submission if file upload failed
      await supabase.from('submissions').delete().eq('id', submission.id);
      
      return NextResponse.json(
        { error: `File upload failed: ${uploadError.message}`, details: uploadError },
        { status: 500 }
      );
    }

    // Record file in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        submission_id: submission.id,
        path: filePath,
        mime: mimeType,
        size: fileSize,
        virus_ok: true // In production, you'd run virus scanning here
      })
      .select()
      .single();

    if (fileError || !fileRecord) {
      console.error('Failed to record file:', fileError);
      
      // Clean up uploaded file and submission
      await supabase.storage.from('readiness-uploads').remove([filePath]);
      await supabase.from('submissions').delete().eq('id', submission.id);
      
      return NextResponse.json(
        { error: 'Failed to record file' },
        { status: 500 }
      );
    }

    // Trigger file processing asynchronously
    try {
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/process-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          submissionId: submission.id,
          ventureId: ventureId
        })
      });

      if (!processResponse.ok) {
        console.warn('File processing failed, but upload succeeded:', await processResponse.text());
      } else {
        console.log('File processing triggered successfully');
      }
    } catch (processError) {
      console.warn('Failed to trigger file processing:', processError);
      // Don't fail the upload if processing fails
    }

    // Return success response
    console.log('Upload successful:', {
      submissionId: submission.id,
      fileId: fileRecord.id,
      fileName: fileName,
      ventureName: venture.name
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      fileId: fileRecord.id,
      fileName: fileName,
      message: `Successfully uploaded ${fileName} for ${venture.name}`
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve files for a venture
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ventureId = searchParams.get('ventureId');

    if (!ventureId) {
      return NextResponse.json(
        { error: 'Venture ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get files for the venture
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select(`
        id,
        path,
        mime,
        size,
        created_at,
        submissions!inner(
          id,
          venture_id,
          status,
          ventures!inner(
            id,
            name
          )
        )
      `)
      .eq('submissions.venture_id', ventureId)
      .order('created_at', { ascending: false });

    if (filesError) {
      console.error('Failed to fetch files:', filesError);
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    // Format response
    const formattedFiles = files?.map(file => {
      // Type assertion to handle the Supabase query result structure
      const submission = file.submissions as unknown as { id: string; status: string; ventures: { name: string } };
      
      // Extract filename and remove timestamp prefix
      const fullFileName = file.path.split('/').pop() || '';
      const fileName = fullFileName.replace(/^\d+_/, ''); // Remove timestamp prefix (digits followed by underscore)
      
      return {
        id: file.id,
        fileName: fileName,
        mimeType: file.mime,
        size: file.size,
        uploadedAt: file.created_at,
        submissionId: submission?.id || null,
        submissionStatus: submission?.status || 'unknown',
        ventureName: submission?.ventures?.name || 'Unknown Venture'
      };
    }).filter(file => file.submissionId !== null) || [];

    return NextResponse.json({
      success: true,
      files: formattedFiles
    });

  } catch (error) {
    console.error('Get files API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
