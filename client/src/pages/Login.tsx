import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Group,
  Anchor,
} from '@mantine/core';
import { IconUser, IconLock, IconArrowDown } from '@tabler/icons-react';
import AuthLayout from '../layouts/AuthLayout';
import { saveAuthSession } from '../utils/authStorage';
import { normalizeUser } from '../utils/entity';
import { userService } from '../services/userService';
import { ApiError } from '../services/apiClient';

function Login() {
  const [formData, setFormData] = useState({
    email: 'leoraj04065@gmail.com',
    password: '12313',
  });
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: { show: false, message: '' },
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showError = (message: string) => {
    setUiState((prev) => ({
      ...prev,
      error: { show: true, message },
      isLoading: false,
    }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      setUiState((prev) => ({ ...prev, isLoading: true, error: { show: false, message: '' } }));
      const res = await userService.login({
        email: formData.email,
        password: formData.password,
      });

      saveAuthSession({
        user: normalizeUser(res.item!.loggedUserData)!,
        token: res.item!.token,
      });
      navigate('/home');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error. Please try again.';
      showError(msg);
    }
  }, [formData, navigate]);

  return (
    <AuthLayout
      sidePanel={
        <Stack justify="center" align="center" h="100%" gap="md">
          <Title order={2} c="white" ta="center">
            Parent Login
          </Title>
          <Text c="indigo.1" ta="center">
            Are you a parent?
          </Text>
          <IconArrowDown color="white" size={24} />
          <Button component={Link} to="/parentlogin" color="brand" size="md" fullWidth>
            Parent Login
          </Button>
        </Stack>
      }
    >
      <Stack gap="lg">
        <div>
          <Title order={2} ta="center">
            Welcome back
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={4}>
            Sign in to manage your expenses
          </Text>
        </div>

        <Stack gap="md">
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            leftSection={<IconUser size={16} />}
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            leftSection={<IconLock size={16} />}
            required
            minLength={3}
          />
        </Stack>

        {uiState.error.show && (
          <Alert color="red" variant="light">
            {uiState.error.message}
          </Alert>
        )}

        <Group justify="space-between" align="center">
          <Button onClick={handleSubmit} loading={uiState.isLoading} fullWidth style={{ flex: 1 }}>
            Login
          </Button>
        </Group>

        <Group justify="space-between">
          <Anchor component={Link} to="/forgetpassword" size="sm">
            Forgot password?
          </Anchor>
          <Anchor component={Link} to="/registration" size="sm">
            Create account
          </Anchor>
        </Group>
      </Stack>
    </AuthLayout>
  );
}

export default Login;
