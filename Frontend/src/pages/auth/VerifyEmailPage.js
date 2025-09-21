import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  padding: var(--spacing-4);
`;

const Card = styled.div`
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const VerifyEmailPage = () => {
  return (
    <Container>
      <Card>
        <h1>Verify Email</h1>
        <p>Email verification functionality coming soon...</p>
      </Card>
    </Container>
  );
};

export default VerifyEmailPage;

