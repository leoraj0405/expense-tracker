import { Box, Container, Group, Paper, Text, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  sidePanel?: ReactNode;
}

function AuthLayout({ children, sidePanel }: AuthLayoutProps) {
  return (
    <Box
      mih="100vh"
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-indigo-0) 0%, var(--mantine-color-gray-0) 50%, var(--mantine-color-brand-0) 100%)',
      }}
      py={{ base: 'xl', md: 'xl' }}
    >
      <Container size="lg">
        <Group align="stretch" justify="center" gap="lg" wrap="wrap">
          <Paper
            shadow="md"
            radius="lg"
            p={{ base: 'lg', sm: 'xl' }}
            style={{ flex: '1 1 340px', maxWidth: 480 }}
            withBorder
          >
            {children}
          </Paper>

          {sidePanel && (
            <Paper
              shadow="md"
              radius="lg"
              p={{ base: 'lg', sm: 'xl' }}
              style={{
                flex: '1 1 280px',
                maxWidth: 380,
                background:
                  'linear-gradient(160deg, var(--mantine-color-indigo-6), var(--mantine-color-indigo-8))',
              }}
            >
              {sidePanel}
            </Paper>
          )}
        </Group>

        <Stack align="center" mt="xl" gap={4}>
          <Text size="sm" c="dimmed">
            Designed by Leo
          </Text>
          <Text size="xs" c="dimmed">
            <Link to="/login" style={{ color: 'inherit' }}>
              Expense Tracker
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

export default AuthLayout;
