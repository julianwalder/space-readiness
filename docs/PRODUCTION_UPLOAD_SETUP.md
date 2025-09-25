# Production Upload System Setup

This document provides a comprehensive guide for setting up the production-ready upload system for the Space Readiness application.

## Overview

The production upload system includes:
- **Secure file uploads** with validation and virus scanning preparation
- **Row Level Security (RLS)** policies for data protection
- **File management** with upload, view, and delete capabilities
- **Automatic assessment triggering** after file uploads
- **Comprehensive error handling** and user feedback

## Architecture

### Database Schema
- **`submissions`** table: Tracks each upload session
- **`files`** table: Records individual uploaded files
- **`chunks`** table: For future RAG implementation
- **`ventures`** table: Links files to specific ventures
- **`memberships`** table: Controls access permissions

### Storage
- **Supabase Storage** bucket: `readiness-uploads`
- **File organization**: `{user_id}/{venture_id}/{timestamp}_{filename}`
- **Security**: Private bucket with RLS policies

### API Endpoints
- **`POST /api/upload`**: Upload new files
- **`GET /api/upload?ventureId={id}`**: List files for a venture
- **`DELETE /api/upload/{fileId}`**: Delete a specific file
- **`GET /api/upload/{fileId}`**: Download a specific file

## Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database Setup

Run the database setup scripts in order:

```bash
# 1. Create RLS policies for files and submissions
psql -f sql/add-upload-policies.sql

# 2. (Optional) If you need to create the stages table
psql -f sql/create-stages-table.sql
```

### 3. Storage Setup

#### Create Storage Bucket
1. Go to your Supabase Dashboard > Storage
2. Create a new bucket named `readiness-uploads`
3. Set it to **Private** (not public)
4. Apply the storage policies:

```bash
psql -f sql/setup-storage.sql
```

#### Storage Policies
The storage policies ensure:
- Users can only upload to their own folders
- Users can only access files for ventures they have permission to view
- Service role has full access for API operations

### 4. Automated Setup

For a complete automated setup, run:

```bash
node scripts/setup-production-upload.js
```

This script will:
- ✅ Set up RLS policies
- ✅ Check storage bucket existence
- ✅ Verify environment variables
- ✅ Test API connectivity
- ✅ Provide setup instructions for any missing components

## File Upload Flow

### 1. Client-Side Upload
```typescript
// User selects file in upload page
const file = event.target.files[0];

// File validation (size, type)
if (file.size > 10MB) throw new Error('File too large');
if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type');

// Convert to base64 and send to API
const fileContent = await fileToBase64(file);
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ventureId: currentVenture.id,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileContent: fileContent
  })
});
```

### 2. Server-Side Processing
```typescript
// API validates user permissions
const { data: venture } = await supabase
  .from('ventures')
  .select('id, name, org_id')
  .eq('id', ventureId)
  .single();

// Check user has access to venture
if (venture.org_id) {
  const { data: membership } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('org_id', venture.org_id)
    .eq('user_id', user.id)
    .single();
}

// Create submission record
const { data: submission } = await supabase
  .from('submissions')
  .insert({ venture_id: ventureId, status: 'pending' })
  .select()
  .single();

// Upload to storage
const filePath = `${user.id}/${ventureId}/${timestamp}_${fileName}`;
const { data: uploadData } = await supabase.storage
  .from('readiness-uploads')
  .upload(filePath, fileBuffer);

// Record file in database
const { data: fileRecord } = await supabase
  .from('files')
  .insert({
    submission_id: submission.id,
    path: filePath,
    mime: mimeType,
    size: fileSize,
    virus_ok: true
  })
  .select()
  .single();
```

### 3. Assessment Triggering
After successful upload, the system automatically triggers an assessment:

```typescript
// Trigger assessment for the venture
const assessmentResponse = await fetch('/api/assess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ventureId: currentVenture.id })
});
```

## Security Features

### File Validation
- **File size limit**: 10MB maximum
- **File type validation**: Only PDF, Word, PowerPoint, Excel, and text files
- **File extension validation**: Double-check file extensions
- **MIME type validation**: Verify actual file content

### Access Control
- **Row Level Security**: Database-level access control
- **User authentication**: JWT token validation
- **Venture permissions**: Users can only access files for ventures they belong to
- **Organization-based access**: Multi-tenant support through memberships

### File Storage Security
- **Private bucket**: Files not publicly accessible
- **Secure naming**: User ID and venture ID in file paths
- **Access policies**: Storage-level RLS policies
- **Virus scanning ready**: `virus_ok` field prepared for future implementation

## File Management

### Upload Page Features
- **Drag & drop interface**: User-friendly file selection
- **Real-time validation**: Immediate feedback on file issues
- **Progress indicators**: Upload progress and status
- **File listing**: View all uploaded files with metadata
- **File deletion**: Secure file removal with confirmation

### File Metadata
Each file record includes:
- **File ID**: Unique identifier
- **Submission ID**: Links to upload session
- **File path**: Storage location
- **MIME type**: File content type
- **File size**: Size in bytes
- **Upload timestamp**: When file was uploaded
- **Virus status**: Ready for future virus scanning

## Error Handling

### Client-Side Errors
- **File validation errors**: Size, type, extension
- **Network errors**: Connection issues, timeouts
- **Authentication errors**: Invalid tokens, expired sessions
- **Permission errors**: Access denied to venture

### Server-Side Errors
- **Database errors**: RLS violations, constraint violations
- **Storage errors**: Upload failures, quota exceeded
- **Validation errors**: Malformed requests, missing fields
- **Authentication errors**: Invalid tokens, user not found

### Error Recovery
- **Automatic cleanup**: Remove orphaned files on upload failure
- **Transaction rollback**: Database consistency maintained
- **User feedback**: Clear error messages with suggested actions
- **Retry mechanisms**: Built-in retry for transient failures

## Monitoring and Maintenance

### Logging
- **API requests**: All upload/download operations logged
- **Error tracking**: Detailed error logs with context
- **Performance metrics**: Upload times, file sizes
- **Security events**: Failed access attempts, policy violations

### Maintenance Tasks
- **Cleanup orphaned files**: Remove files without database records
- **Storage quota monitoring**: Track bucket usage
- **Database optimization**: Index maintenance, query optimization
- **Security audits**: Regular policy review and updates

## Future Enhancements

### Planned Features
- **Virus scanning**: Integration with antivirus services
- **File versioning**: Keep multiple versions of documents
- **Bulk upload**: Multiple file upload at once
- **File preview**: In-browser file preview
- **OCR processing**: Extract text from images/PDFs
- **RAG integration**: Vector embeddings for file content

### Performance Optimizations
- **CDN integration**: Faster file delivery
- **Compression**: File compression for storage efficiency
- **Caching**: Redis caching for frequently accessed files
- **Async processing**: Background file processing

## Troubleshooting

### Common Issues

#### "Access denied" errors
- Check user authentication status
- Verify venture membership
- Ensure RLS policies are properly configured

#### File upload failures
- Check file size limits (10MB max)
- Verify file type is allowed
- Ensure storage bucket exists and is accessible
- Check storage quota

#### Database errors
- Verify RLS policies are applied
- Check foreign key constraints
- Ensure service role key has proper permissions

### Debug Commands

```bash
# Check RLS policies
psql -c "SELECT * FROM pg_policies WHERE tablename IN ('files', 'submissions');"

# Check storage bucket
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     "$SUPABASE_URL/storage/v1/bucket"

# Test file upload
curl -X POST \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"ventureId":"test","fileName":"test.pdf","fileSize":1000,"mimeType":"application/pdf","fileContent":"base64data"}' \
     "$SUPABASE_URL/api/upload"
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error logs in Supabase Dashboard
3. Test with the debug commands
4. Contact the development team with specific error details

---

**Note**: This system is designed for production use with enterprise-grade security and scalability. Always test thoroughly in a staging environment before deploying to production.
