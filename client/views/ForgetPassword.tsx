'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Group,
  LoadingOverlay,
  Anchor,
} from '@mantine/core';
import AuthLayout from '@/layouts/AuthLayout';
import { userService } from '@/services/userService';
import { ApiError } from '@/services/apiClient';

function ForgetPassword() {
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [uiState, setUiState] = useState({
    isInputDisabled: true,
    isEmailBlocked: false,
    isLoading: false,
    error: { show: false, message: '' },
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showError = (message: string) => {
    setUiState((prev) => ({
      ...prev,
      error: { show: true, message },
      isLoading: false,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (form.confirmPassword !== form.password) {
      return showError('Passwords do not match');
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await userService.processOtp({
        email: form.email,
        otp: form.otp,
        password: form.password,
      });
      router.push('/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'An error occurred. Please try again.';
      showError(msg);
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [form, router]);

  const handleGenerateOTP = useCallback(async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: { show: false, message: '' } }));

      await userService.generateOtp({ email: form.email });

      setUiState({
        isInputDisabled: false,
        isEmailBlocked: true,
        isLoading: false,
        error: { show: false, message: '' },
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to generate OTP. Please try again.';
      showError(msg);
    }
  }, [form.email]);

  return (
    <AuthLayout>
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={uiState.isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        <div>
          <Title order={2} ta="center">
            Reset Password
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={4}>
            Enter your email to receive an OTP
          </Text>
        </div>

        <Group align="flex-end" gap="xs" wrap="nowrap">
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={uiState.isEmailBlocked}
            required
            style={{ flex: 1 }}
          />
          <Button onClick={handleGenerateOTP} disabled={uiState.isEmailBlocked || !form.email}>
            Get OTP
          </Button>
        </Group>

        <Group justify="flex-end">
          <Anchor
            component="button"
            type="button"
            size="sm"
            disabled={uiState.isInputDisabled}
            onClick={handleGenerateOTP}
          >
            Resend OTP
          </Anchor>
        </Group>

        {uiState.error.show && (
          <Alert color="red" variant="light">
            {uiState.error.message}
          </Alert>
        )}

        <TextInput
          label="OTP"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          disabled={uiState.isInputDisabled}
          required
        />
        <PasswordInput
          label="New Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          disabled={uiState.isInputDisabled}
          minLength={6}
          required
        />
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={uiState.isInputDisabled}
          minLength={6}
          required
        />

        <Group justify="center" mt="sm">
          <Button component={Link} href="/login" variant="light" color="red">
            Cancel
          </Button>
          <Button
            disabled={uiState.isInputDisabled || uiState.isLoading}
            onClick={handleSubmit}
            loading={uiState.isLoading}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </AuthLayout>
  );
}

export default ForgetPassword;
