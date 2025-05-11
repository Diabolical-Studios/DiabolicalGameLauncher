import React, { useRef, useState } from 'react';
import { CircularProgress, Stack } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { colors } from '../../theme/colors';

const ImageUploader = ({ onUpload, currentImageUrl, uploading, setUploading, headers = {} }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();

  const handleFileUpload = async file => {
    setUploading(true);

    try {
      const sessionID =
        headers.sessionID ||
        (window.Cookies && window.Cookies.get && window.Cookies.get('sessionID'));
      const fetchHeaders = {
        'Content-Type': 'application/json',
        ...(sessionID ? { sessionID } : {}),
      };
      const uploadUrl = headers.uploadUrl || 'https://cdn.diabolical.services/generateUploadUrl';

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          fileExt: file.name.split('.').pop(),
          contentType: file.type,
          size_bytes: file.size,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate upload URL');
      }

      const { url, key } = await res.json();

      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      const imageUrl = `https://cdn.diabolical.services/${key}`;
      onUpload(imageUrl);

      if (window.electronAPI) {
        window.electronAPI.showCustomNotification('Upload Complete', 'Your image was uploaded.');
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
      if (window.electronAPI) {
        window.electronAPI.showCustomNotification(
          'Upload Failed',
          err.message === 'Quota check failed'
            ? 'You have exceeded your storage quota. Please upgrade your plan or delete some files.'
            : err.message || 'Could not upload your image.'
        );
      }
      // Reset the upload state by calling onUpload with null
      onUpload(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  return (
    <Stack
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        height: '120px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: `2px dashed ${isDragging ? colors.button : colors.border}`,
        backgroundColor: isDragging ? `${colors.button}20` : colors.background,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        hidden
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp"
        ref={fileInputRef}
        onChange={e => {
          const file = e.target.files[0];
          if (file) handleFileUpload(file);
        }}
      />
      {uploading ? (
        <Stack alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <span style={{ color: colors.text }}>Uploading...</span>
        </Stack>
      ) : currentImageUrl ? (
        <Stack alignItems="center" gap={1}>
          <UploadIcon style={{ color: colors.button }} />
          <span style={{ color: colors.text }}>Image Uploaded ✅</span>
          <span style={{ color: colors.border, fontSize: '12px' }}>Click or drag to change</span>
        </Stack>
      ) : (
        <Stack alignItems="center" gap={1}>
          <UploadIcon style={{ color: colors.border }} />
          <span style={{ color: colors.text }}>Upload</span>
          <span style={{ color: colors.border, fontSize: '12px' }}>
            Supports PNG, JPG, GIF, WEBP
          </span>
        </Stack>
      )}
    </Stack>
  );
};

export default ImageUploader;
