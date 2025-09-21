import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  overflow: hidden;
`;

 

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: var(--spacing-4);
  border: none;
  outline: none;
  resize: vertical;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text);
  background: transparent;

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const WordCount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
`;

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your thoughts...",
  readOnly = false,
  showWordCount = true 
}) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (value && showWordCount) {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [value, showWordCount]);

  const handleChange = (e) => {
    const content = e.target.value;
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <EditorContainer>
      <TextArea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {showWordCount && (
        <WordCount>
          <span>{wordCount} words</span>
          <span>{Math.ceil(wordCount / 200)} min read</span>
        </WordCount>
      )}
    </EditorContainer>
  );
};

export default RichTextEditor;

