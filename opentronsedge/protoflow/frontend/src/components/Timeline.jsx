// src/components/Timeline.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Icon, 
  SPACING, 
  ProtocolTimelineScrubber, 
  COLORS,
  OutlineButton
} from '@opentrons/components';
import './DeckVisualization.css'; // Import the CSS file for deck visualization
import DeckVisualizationWrapper from './DeckVisualizationWrapper';
import { fixSVGMirroring } from './SVGFix';

const API_URL = 'http://localhost:8000/api';

export default function Timeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [protocolAnalysis, setProtocolAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`${API_URL}/analysis/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Protocol Analysis Data:', data);
        setProtocolAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err.message || 'Failed to load protocol analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  // Fix SVG mirroring issue by adding a custom CSS style
  useEffect(() => {
    // Add a style tag to fix the mirroring issue with foreignObject elements
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      foreignObject .sc-jvbmhS {
        transform: scale(1, 1) !important;
      }
      
      /* Ensure the text is readable by flipping it back */
      foreignObject .sc-jvbmhS .sc-edFBzD {
        transform: scale(1, -1) !important;
      }
    `;
    document.head.appendChild(styleTag);
    
    // Apply the direct fix to the SVG elements
    fixSVGMirroring();
    
    // Clean up the style tag when component unmounts
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  if (loading) {
    return (
      <Box 
        padding={SPACING.spacing24} 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
        height="100%"
      >
        <p style={{fontSize: '16px'}}>Loading protocol analysis...</p>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        padding={SPACING.spacing24} 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        height="100%"
      >
        <p style={{fontSize: '18px', color: COLORS.error_dark, marginBottom: SPACING.spacing16}}>
          {error}
        </p>

      </Box>
    );
  }

  if (!protocolAnalysis) {
    return (
      <Box 
        padding={SPACING.spacing24} 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        height="100%"
      >
        <p style={{fontSize: '18px', marginBottom: SPACING.spacing16}}>
          No analysis data found
        </p>

      </Box>
    );
  }

  const protocolName = protocolAnalysis.metadata?.protocolName || 'Unnamed Protocol';
  const formattedDate = new Date(protocolAnalysis.createdAt).toLocaleString();

  const transformedAnalysis = {
    ...protocolAnalysis,
    commands: protocolAnalysis.commands.map(command => {
      if (command.params && command.params.labware) {
        return {
          ...command,
          params: {
            ...command.params,
            labware: command.params.labware.map(labware => ({
              ...labware,
              location: {
                ...labware.location,
                // 翻转y坐标以修正方向
                y: labware.location.y ? -labware.location.y : labware.location.y
              }
            }))
          }
        };
      }
      return command;
    })
  };

  return (
    <Box padding={SPACING.spacing24}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        marginBottom={SPACING.spacing16}
      >
        <Box>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>
            {protocolName}
          </h1>
          <p style={{fontSize: '14px', color: COLORS.grey60, margin: '4px 0 0 0'}}>
            Analysis created on {formattedDate}
          </p>
        </Box>
        

      </Box>

      <Box
        marginTop={SPACING.spacing16} 
        backgroundColor={COLORS.white} 
        borderRadius="4px"
        padding={SPACING.spacing16}
      >
        {protocolAnalysis.result !== 'ok' && (
          <Box 
            backgroundColor={COLORS.warning_light} 
            padding={SPACING.spacing16} 
            marginBottom={SPACING.spacing16}
            borderRadius="4px"
          >
            <p style={{fontWeight: 'bold', color: COLORS.warning_dark, margin: 0}}>
              {protocolAnalysis.result === 'not-ok' 
                ? 'This protocol contains errors and may not run correctly.'
                : 'This protocol requires parameter values to be set.'}
            </p>
            {protocolAnalysis.errors && protocolAnalysis.errors.length > 0 && (
              <p style={{color: COLORS.warning_dark, margin: '8px 0 0 0'}}>
                {protocolAnalysis.errors.length} error(s) detected
              </p>
            )}
          </Box>
        )}

        <DeckVisualizationWrapper>
          <ProtocolTimelineScrubber 
            analysis={transformedAnalysis}
            height="600px"
            className="protocol-timeline-scrubber"
            onRender={() => {
              // Apply the SVG fix after the component is rendered
              setTimeout(() => {
                fixSVGMirroring();
              }, 100);
            }}
          />
        </DeckVisualizationWrapper>
      </Box>
    </Box>
  );
}