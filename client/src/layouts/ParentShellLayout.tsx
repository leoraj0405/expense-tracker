import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@mantine/core';
import {
  IconLogout,
  IconChevronDown,
  IconSun,
  IconMoon,
  IconUsers,
} from '@tabler/icons-react';
import { useAppTheme } from '../hooks/useAppTheme';
import { clearParentSession } from '../utils/authStorage';
import { getInitials } from '../utils/format';

interface ParentShellLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

function ParentShellLayout({
  children,
  title = 'Parent portal',
  subtitle = 'Monitor your children\'s spending',
}: ParentShellLayoutProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useAppTheme();

  const handleLogout = () => {
    clearParentSession();
    navigate('/parentlogin');
  };

  return (
    <div className="et-app et-parent-app">
      <header className="et-header">
        <div className="et-header-left">
          <div className="et-parent-header-brand">
            <div className="et-brand-mark">
              <IconUsers size={18} stroke={2} />
            </div>
            <div>
              <div className="et-page-title">{title}</div>
              <div className="et-page-sub">{subtitle}</div>
            </div>
          </div>
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
                <div className="et-avatar">{getInitials('Parent')}</div>
                <div>
                  <span className="et-name">Parent</span>
                  <span className="et-role">Guardian account</span>
                </div>
                <IconChevronDown size={14} stroke={1.75} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>

      <main className="et-main">{children}</main>

      <footer className="et-parent-foot">Designed by Leo</footer>
    </div>
  );
}

export default ParentShellLayout;
