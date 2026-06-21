'use client';

import type { ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { IconArrowLeft } from '@tabler/icons-react';
import { PageBreadcrumbs, type BreadcrumbItem } from '@/components/PageBreadcrumbs';
import { getPageNavigation } from '@/utils/breadcrumbs';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const nav = getPageNavigation(
    pathname ?? '',
    searchParams ?? new URLSearchParams(),
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
              onClick={() => router.push(resolvedBackTo)}
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
