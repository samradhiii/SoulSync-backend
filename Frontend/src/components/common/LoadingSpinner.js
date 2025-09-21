import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--gradient-primary);
  color: white;
  font-family: var(--font-family-primary);
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 20px;
  animation: ${pulse} 2s infinite;
  box-shadow: var(--shadow-xl);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
`;

const Subtitle = styled.p`
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <SpinnerContainer>
      <Logo>🌟</Logo>
      <Title>SoulSync</Title>
      <Subtitle>Your Digital Companion</Subtitle>
      <Spinner />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;

