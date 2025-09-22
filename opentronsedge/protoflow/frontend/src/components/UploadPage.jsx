// src/components/UploadPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  PrimaryButton, 
  OutlineButton,
  SPACING, 
  COLORS
} from '@opentrons/components';

const API_URL = 'http://localhost:8000/api';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one protocol file');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze protocol');
      }

      const data = await response.json();
      
      // Navigate to the timeline page with the analysis ID
      navigate(`/${data.analysisId}/timeline`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload and analyze protocol');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box 
      padding={SPACING.spacing24}
      maxWidth="800px"
      margin="0 auto"
    >
      <h1 style={{fontSize: '32px', fontWeight: 'bold', marginBottom: SPACING.spacing16}}>
        Opentrons Protocol Analyzer
      </h1>
      
      <Box 
        border={`1px dashed ${COLORS.grey40}`}
        padding={SPACING.spacing24}
        marginBottom={SPACING.spacing24}
        borderRadius="4px"
        backgroundColor={COLORS.white}
      >
        <input
          type="file"
          id="protocol-file-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
        />
        
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
          justifyContent="center"
          padding={SPACING.spacing24}
        >
          <p style={{marginBottom: SPACING.spacing16, fontSize: '16px'}}>
            Upload your Opentrons protocol files (.py or .json)
          </p>
          
          <OutlineButton
            onClick={() => document.getElementById('protocol-file-input').click()}
          >
            Select Files
          </OutlineButton>
        </Box>
      </Box>
      
      {files.length > 0 && (
        <Box 
          marginBottom={SPACING.spacing24}
          backgroundColor={COLORS.white}
          padding={SPACING.spacing16}
          borderRadius="4px"
        >
          <p style={{fontSize: '16px', fontWeight: 'bold', marginBottom: SPACING.spacing8}}>
            Selected Files:
          </p>
          
          <ul style={{ margin: 0, paddingLeft: SPACING.spacing24 }}>
            {files.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>
              </li>
            ))}
          </ul>
        </Box>
      )}
      
      {error && (
        <Box 
          marginBottom={SPACING.spacing16}
          padding={SPACING.spacing12}
          backgroundColor={COLORS.error_light}
          borderRadius="4px"
        >
          <p style={{color: COLORS.error_dark, margin: 0}}>{error}</p>
        </Box>
      )}
      
      <Box display="flex" justifyContent="center">
        <PrimaryButton
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? 'Analyzing...' : 'Analyze Protocol'}
        </PrimaryButton>
      </Box>
    </Box>
  );
}