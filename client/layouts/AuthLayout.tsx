'use client';

import { Box, Container, Group, Stack, Text } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import Link from 'next/link';

import type { ReactNode } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AuthLayoutProps {
  children: ReactNode;
  sidePanel?: ReactNode;
}

function AuthLayout({ children, sidePanel }: AuthLayoutProps) {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <Box
      mih="100vh"
      style={{
        background: 'var(--et-surface)',
        color: 'var(--et-ink)',
      }}
      py={{ base: 'xl', md: 'xl' }}
    >
      <Container size="lg">
        <Group justify="flex-end" mb="md">
          <button
            type="button"
            className="et-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </Group>
        <Group align="stretch" justify="center" gap="lg" wrap="wrap" className="et-auth-stack">
          <div
            className="et-panel et-auth-panel"
            style={{ flex: '1 1 340px', maxWidth: 480, padding: '28px 32px' }}
          >
            {children}
          </div>

          {sidePanel && (
            <div
              className="et-auth-panel"
              style={{
                flex: '1 1 280px',
                maxWidth: 380,
                borderRadius: 'var(--et-radius-lg)',
                padding: '28px 32px',
                background: 'linear-gradient(160deg, var(--et-navy), var(--et-navy-deep))',
                color: '#fff',
              }}
            >
              {sidePanel}
            </div>
          )}
        </Group>

        <Stack align="center" mt="xl" gap={4}>
          <Text size="sm" style={{ color: 'var(--et-ink-soft)' }}>
            Designed by Leo
          </Text>
          <Text size="xs" style={{ color: 'var(--et-ink-soft)' }}>
            <Link href="/login" style={{ color: 'inherit' }}>
              Expense Tracker
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

export default AuthLayout;
