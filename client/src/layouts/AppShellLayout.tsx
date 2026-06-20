import { useState, type ReactNode, type ComponentType } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from '@mantine/core';
import {
  IconHome,
  IconReceipt,
  IconUsersGroup,
  IconCategory,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconMenu2,
  IconSun,
  IconMoon,
  IconClock,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useAppTheme } from '../hooks/useAppTheme';
import { apiUrl } from '../services/apiClient';
import { getInitials } from '../utils/format';
import defaultImage from '../assets/img/profile.png';

const ROUTE_META: Record<string, { title: string; sub: string }> = {
  '/home': { title: 'Home', sub: '· this month' },
  '/expense': { title: 'Expenses', sub: '· all transactions' },
  '/group': { title: 'Group', sub: '· shared expenses' },
  '/category': { title: 'Category', sub: '· manage tags' },
  '/userprofile': { title: 'Profile', sub: '· account settings' },
};

const NAV_SECTIONS: {
  label: string;
  items: {
    label: string;
    to: string;
    icon: ComponentType<{ size?: number; stroke?: number }>;
    match: (p: string) => boolean;
    badge?: boolean;
  }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Home', to: '/home', icon: IconHome, match: (p: string) => p === '/home' },
      {
        label: 'Expenses',
        to: '/expense',
        icon: IconReceipt,
        match: (p: string) => p.startsWith('/expense') || p.startsWith('/editexpense'),
      },
    ],
  },
  {
    label: 'Shared',
    items: [
      {
        label: 'Group',
        to: '/group',
        icon: IconUsersGroup,
        match: (p: string) => p.startsWith('/group'),
        badge: true,
      },
    ],
  },
  {
    label: 'Setup',
    items: [
      {
        label: 'Category',
        to: '/category',
        icon: IconCategory,
        match: (p: string) => p.startsWith('/category'),
      },
    ],
  },
];

interface AppShellLayoutProps {
  children: ReactNode;
}

function AppShellLayout({ children }: AppShellLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  const userName = loginUser?.name || loginUser?.data?.name || 'User';
  const profileImage = loginUser?.profileImage || loginUser?.data?.profileImage;
  const avatarSrc =
    profileImage && profileImage !== 'null'
      ? apiUrl(`/uploads/${profileImage}`)
      : defaultImage;

  const meta =
    Object.entries(ROUTE_META).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    { title: 'Expense Tracker', sub: '' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="et-app">
      <div
        className={`et-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className={`et-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="et-brand">
          <div className="et-brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.5-1.5 1.5-4 0-5.5C17.5 7 15 7 13.5 8.5L12 10l-1.5-1.5C9 7 6.5 7 5 8.5c-1.5 1.5-1.5 4 0 5.5l7 7 7-7z" />
            </svg>
          </div>
          <div className="et-brand-text">
            <div className="et-brand-word">Expense Tracker</div>
            <div className="et-brand-tag">Finance workspace</div>
          </div>
        </div>

        <nav className="et-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="et-nav-label">{section.label}</div>
              {section.items.map(({ label, to, icon: Icon, match, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={`et-nav-item ${match(location.pathname) ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} stroke={1.75} />
                  {label}
                  {badge && <span className="et-badge">•</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="et-sidebar-foot">
          <div className="et-sidebar-foot-row">
            <IconClock size={15} stroke={1.75} />
            Designed by Leo
          </div>
        </div>
      </aside>

      <header className="et-header">
        <div className="et-header-left">
          <button
            type="button"
            className="et-icon-btn et-mobile-nav-toggle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu2 size={16} />
          </button>
          <div className="et-page-title">{meta.title}</div>
        </div>

        <div className="et-header-right">
          <button
            type="button"
            className="et-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <button type="button" className="et-user-chip">
                <div className="et-avatar">
                  {profileImage && profileImage !== 'null' ? (
                    <img src={avatarSrc} alt={userName} />
                  ) : (
                    getInitials(userName)
                  )}
                </div>
                <div>
                  <span className="et-name">{userName}</span>
                  <span className="et-role">Personal account</span>
                </div>
                <IconChevronDown size={14} stroke={1.75} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                component={Link}
                to="/userprofile"
              >
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>

      <main className="et-main">{children}</main>
    </div>
  );
}

export default AppShellLayout;
