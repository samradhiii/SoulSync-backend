import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
`;

const Title = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-6);
  font-family: var(--font-family-heading);
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: var(--spacing-12);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: var(--spacing-4);
`;

const EntryPage = () => {
  return (
    <Container>
      <Title>Journal Entry</Title>
      <ComingSoon>
        <Icon>📄</Icon>
        <h2>Entry Editor Coming Soon</h2>
        <p>Rich text editing, mood detection, and encryption features will be available here.</p>
      </ComingSoon>
    </Container>
  );
};

export default EntryPage;

