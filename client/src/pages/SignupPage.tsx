import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  FileInput,
  Anchor,
} from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import AuthLayout from '../layouts/AuthLayout';
import { userService } from '../services/userService';
import { ApiError } from '../services/apiClient';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  parentEmail: string;
  profileImage: File | null;
}

const SignupPage = () => {
  const initialFormState: SignupForm = {
    name: '',
    email: '',
    password: '',
    parentEmail: '',
    profileImage: null,
  };

  const [userForm, setUserForm] = useState<SignupForm>(initialFormState);
  const [error, setError] = useState({ isVisible: false, message: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setUserForm((prev) => ({ ...prev, profileImage: file }));
  };

  const validateForm = () => {
    if (!userForm.name.trim()) return 'Name is required';
    if (!userForm.email.trim()) return 'Email is required';
    if (!userForm.password) return 'Password is required';
    if (userForm.password.length < 6) return 'Password should be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError({ isVisible: true, message: validationError });
      return;
    }

    const formData = new FormData();
    Object.entries(userForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await userService.register(formData);
      navigate('/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Network error. Please try again.';
      setError({ isVisible: true, message: msg });
    }
  };

  return (
    <AuthLayout
      sidePanel={
        <Stack justify="center" align="center" h="100%" gap="md">
          <Title order={2} c="white" ta="center">
            Already have an account?
          </Title>
          <Text c="indigo.1" ta="center">
            Sign in to access your dashboard
          </Text>
          <IconArrowDown color="white" size={24} />
          <Button component={Link} to="/login" color="brand" size="md" fullWidth>
            User Login
          </Button>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <div>
            <Title order={2} ta="center">
              Create account
            </Title>
            <Text c="dimmed" size="sm" ta="center" mt={4}>
              Join Expense Tracker today
            </Text>
          </div>

          {error.isVisible && (
            <Alert color="red" variant="light">
              {error.message}
            </Alert>
          )}

          <TextInput label="Name" name="name" value={userForm.name} onChange={handleChange} required />
          <TextInput
            label="Email address"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Parent email address"
            name="parentEmail"
            type="email"
            value={userForm.parentEmail}
            onChange={handleChange}
          />
          <PasswordInput
            label="Password"
            name="password"
            value={userForm.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <FileInput
            label="Profile Image"
            accept="image/*"
            value={userForm.profileImage}
            onChange={handleFileChange}
          />

          <Button type="submit" fullWidth>
            Register
          </Button>

          <Text ta="center" size="sm">
            <Anchor component={Link} to="/login">
              Back to login
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
