'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
  Anchor,
  LoadingOverlay,
} from '@mantine/core';
import { IconUser, IconLock, IconArrowDown } from '@tabler/icons-react';
import AuthLayout from '@/layouts/AuthLayout';
import { userService } from '@/services/userService';
import { ApiError } from '@/services/apiClient';
import { saveParentSession } from '@/utils/authStorage';

function ParentLogin() {
  const [formData, setFormData] = useState({
    email: 'leoparent@gmail.com',
    otp: '',
  });
  const [uiState, setUiState] = useState({
    isInputDisabled: false,
    showErrorAlert: false,
    isLoading: false,
    isSubmitDisabled: true,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateOtp = async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      await userService.parentGenerateOtp({ parentEmail: formData.email });

      setUiState((prev) => ({
        ...prev,
        isInputDisabled: true,
        isSubmitDisabled: false,
        showErrorAlert: false,
        isLoading: false,
      }));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error. Please try again.';
      setErrorMessage(msg);
      setUiState((prev) => ({ ...prev, showErrorAlert: true, isLoading: false }));
    }
  };

  const handleProcessOtp = async () => {
    if (!formData.otp.trim()) {
      setErrorMessage('Please enter the OTP');
      setUiState((prev) => ({ ...prev, showErrorAlert: true }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true, showErrorAlert: false }));
      const res = await userService.parentProcessOtp({
        parentEmail: formData.email.trim(),
        parentotp: formData.otp.trim(),
      });

      const payload = res.item!;
      saveParentSession({
        token: payload.token,
        children: payload.children,
      });
      router.push('/parenthome');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error. Please try again.';
      setErrorMessage(msg);
      setUiState((prev) => ({ ...prev, showErrorAlert: true, isLoading: false }));
    }
  };

  const resetForm = () => {
    setFormData({ email: '', otp: '' });
    setUiState({
      isInputDisabled: false,
      showErrorAlert: false,
      isLoading: false,
      isSubmitDisabled: true,
    });
  };

  return (
    <AuthLayout
      sidePanel={
        <Stack justify="center" align="center" h="100%" gap="md">
          <Title order={2} c="white" ta="center">
            User Login
          </Title>
          <Text c="indigo.1" ta="center">
            If you have a user account?
          </Text>
          <IconArrowDown color="white" size={24} />
          <Button component={Link} href="/login" color="brand" size="md" fullWidth>
            User Login
          </Button>
        </Stack>
      }
    >
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={uiState.isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        <div>
          <Title order={2} ta="center">
            Parent Login
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={4}>
            Verify with OTP sent to your email
          </Text>
        </div>

        {uiState.showErrorAlert && (
          <Alert color="red" variant="light">
            {errorMessage || 'Error occurred. Please try again.'}
          </Alert>
        )}

        <TextInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          leftSection={<IconUser size={16} />}
          disabled={uiState.isInputDisabled}
          required
        />

        <Group>
          <Button
            onClick={handleGenerateOtp}
            disabled={uiState.isLoading || uiState.isInputDisabled}
            flex={1}
          >
            Generate OTP
          </Button>
          <Anchor component="button" type="button" size="sm" onClick={handleGenerateOtp}>
            Resend
          </Anchor>
        </Group>

        <TextInput
          label="Enter OTP"
          name="otp"
          maxLength={6}
          value={formData.otp}
          onChange={handleInputChange}
          leftSection={<IconLock size={16} />}
          disabled={uiState.isSubmitDisabled}
          required
        />

        <Group justify="center" mt="sm">
          <Button variant="light" color="gray" onClick={resetForm}>
            Clear
          </Button>
          <Button
            onClick={handleProcessOtp}
            disabled={uiState.isSubmitDisabled || uiState.isLoading}
            loading={uiState.isLoading}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </AuthLayout>
  );
}

export default ParentLogin;
