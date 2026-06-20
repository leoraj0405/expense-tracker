import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Avatar,
  Menu,
  Text,
  UnstyledButton,
  Box,
  Image,
  rem,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconHome,
  IconReceipt,
  IconUsersGroup,
  IconCategory,
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode, CSSProperties } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiUrl } from '../services/apiClient';
import defaultImage from '../assets/img/profile.png';
import Logo from '../assets/img/websiteLogo.png';

const NAV_ITEMS: {
  label: string;
  to: string;
  icon: React.ComponentType<{ style?: CSSProperties }>;
}[] = [
  { label: 'Home', to: '/home', icon: IconHome },
  { label: 'Expenses', to: '/expense', icon: IconReceipt },
  { label: 'Groups', to: '/group', icon: IconUsersGroup },
  { label: 'Categories', to: '/category', icon: IconCategory },
];

interface AppShellLayoutProps {
  children: ReactNode;
}

function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, logout } = useAuth();

  const userName = loginUser?.name || loginUser?.data?.name || 'User';
  const profileImage = loginUser?.profileImage || loginUser?.data?.profileImage;
  const avatarSrc =
    profileImage && profileImage !== 'null'
      ? apiUrl(`/uploads/${profileImage}`)
      : defaultImage;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg" c="indigo">
              Expense Tracker
            </Text>
          </Group>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Text size="sm" visibleFrom="sm" c="dimmed">
                    {userName}
                  </Text>
                  <Avatar src={avatarSrc} radius="xl" size={36} />
                  <IconChevronDown style={{ width: rem(14), height: rem(14) }} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                component={Link}
                to="/userprofile"
              >
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section mb="md">
          <Group gap="sm">
            <Image src={Logo} alt="Logo" w={40} h={40} radius="md" />
            <Text fw={700} size="lg">
              ET
            </Text>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              component={Link}
              to={to}
              label={label}
              leftSection={<Icon style={{ width: rem(18), height: rem(18) }} />}
              active={isActive(to)}
              variant="light"
              mb={4}
              onClick={() => {
                if (opened) toggle();
              }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Text size="xs" c="dimmed" ta="center">
            Designed by Leo
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box mih="calc(100vh - 120px)">{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
}

export default AppShellLayout;
