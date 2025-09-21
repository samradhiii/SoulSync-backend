import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  max-width: 420px;
`;

const Title = styled.h1`
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2);
  color: var(--color-text);
`;

const Subtitle = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
`;

const Form = styled.form`
  display: grid;
  gap: var(--spacing-4);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-size: var(--font-size-base);
  &.error { border-color: var(--color-error); }
`;

const ErrorText = styled.p`
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: -6px;
`;

const Button = styled.button`
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  width: 100%;
  opacity: ${props => (props.disabled ? 0.7 : 1)};
`;

const Info = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-3);
`;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tokenProblem = useMemo(() => !token || token.length < 10, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (tokenProblem) {
      setError('Invalid or missing reset token. Please use the link from your email again.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post('/api/auth/reset-password', { token, password, confirmPassword: confirm });
      if (res.data?.status === 'success') {
        // Redirect to login with a small delay
        setTimeout(() => navigate('/login', { replace: true }), 400);
      } else {
        setError(res.data?.message || 'Unable to reset password.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid or expired reset link. Please request a new one.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Reset Password</Title>
        <Subtitle>Set a new password for your account</Subtitle>

        {tokenProblem && (
          <Info>
            The reset link seems invalid or incomplete. Please click the reset link from your email again.
          </Info>
        )}

        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={!password || password.length >= 6 ? '' : 'error'}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={confirm && confirm !== password ? 'error' : ''}
            />
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <Button type="submit" disabled={submitting || tokenProblem}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;

