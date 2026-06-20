import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { PageBreadcrumbs, type BreadcrumbItem } from '../PageBreadcrumbs';
import { getPageNavigation } from '../../utils/breadcrumbs';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string | null;
  backLabel?: string;
  showBack?: boolean;
}

export function PageHero({
  title,
  subtitle,
  action,
  breadcrumbs,
  backTo,
  backLabel,
  showBack = true,
}: PageHeroProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = getPageNavigation(
    location.pathname,
    new URLSearchParams(location.search),
  );

  const crumbs = breadcrumbs ?? nav.breadcrumbs;
  const resolvedBackTo = backTo !== undefined ? backTo : nav.backTo;
  const resolvedBackLabel = backLabel ?? nav.backLabel;

  return (
    <div className="et-page-head">
      {(crumbs.length > 0 || (showBack && resolvedBackTo)) && (
        <div className="et-page-head-top">
          {showBack && resolvedBackTo && (
            <button
              type="button"
              className="et-back-btn"
              onClick={() => navigate(resolvedBackTo)}
              aria-label={`Back to ${resolvedBackLabel}`}
            >
              <IconArrowLeft size={15} stroke={2} />
              {resolvedBackLabel}
            </button>
          )}
          <PageBreadcrumbs items={crumbs} />
        </div>
      )}

      <div className="et-hero-row">
        <div className="et-hero">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
