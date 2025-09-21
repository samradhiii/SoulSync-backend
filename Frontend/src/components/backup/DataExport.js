import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useMutation } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
 

const ExportContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
`;

const Title = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const Description = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-6);
`;

const ExportOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
`;

const ExportOption = styled(motion.div)`
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.selected {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: white;
  }
`;

const OptionIcon = styled.div`
  font-size: 32px;
  margin-bottom: var(--spacing-2);
`;

const OptionTitle = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
`;

const OptionDescription = styled.div`
  font-size: var(--font-size-xs);
  opacity: 0.8;
`;

const ExportButton = styled(motion.button)`
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-4) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InfoBox = styled.div`
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const DataExport = () => {
  const [selectedFormat, setSelectedFormat] = useState('json');

  const exportMutation = useMutation(
    async (format) => {
      const response = await axios.get(`/api/analytics/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    },
    {
      onSuccess: (data, format) => {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `soulsync-export-${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully!');
      },
      onError: (error) => {
        toast.error('Failed to export data. Please try again.');
        console.error('Export error:', error);
      }
    }
  );

  const exportOptions = [
    {
      id: 'json',
      title: 'JSON',
      icon: '📄',
      description: 'Complete data in JSON format'
    },
    {
      id: 'csv',
      title: 'CSV',
      icon: '📊',
      description: 'Entries and mood data in CSV format'
    },
    {
      id: 'pdf',
      title: 'PDF',
      icon: '📋',
      description: 'Formatted report in PDF format'
    }
  ];

  const handleExport = () => {
    if (!selectedFormat) {
      toast.error('Please select an export format');
      return;
    }
    exportMutation.mutate(selectedFormat);
  };

  return (
    <ExportContainer>
      <Title>Export Your Data</Title>
      <Description>
        Download a complete backup of your journal entries, mood data, and analytics. 
        Your data is encrypted and secure - only you have access to it.
      </Description>

      <ExportOptions>
        {exportOptions.map((option) => (
          <ExportOption
            key={option.id}
            className={selectedFormat === option.id ? 'selected' : ''}
            onClick={() => setSelectedFormat(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <OptionIcon>{option.icon}</OptionIcon>
            <OptionTitle>{option.title}</OptionTitle>
            <OptionDescription>{option.description}</OptionDescription>
          </ExportOption>
        ))}
      </ExportOptions>

      <ExportButton
        onClick={handleExport}
        disabled={exportMutation.isLoading || !selectedFormat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {exportMutation.isLoading ? (
          <>
            <LoadingSpinner />
            Exporting...
          </>
        ) : (
          <>
            📥 Export Data
          </>
        )}
      </ExportButton>

      <InfoBox>
        <strong>What's included in your export:</strong>
        <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)' }}>
          <li>All journal entries (with encryption keys for your personal use)</li>
          <li>Mood tracking data and analytics</li>
          <li>User preferences and settings</li>
          <li>Streak and badge information</li>
          <li>Export metadata and timestamps</li>
        </ul>
        <p style={{ marginTop: 'var(--spacing-2)', fontStyle: 'italic' }}>
          Note: Your data is encrypted for security. Keep your export files safe and private.
        </p>
      </InfoBox>
    </ExportContainer>
  );
};

export default DataExport;

