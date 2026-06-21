'use client';

import { Breadcrumbs, Anchor, Text } from '@mantine/core';
import Link from 'next/link';


export interface BreadcrumbItem {
  label: string;
  to: string;
}

interface PageBreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function PageBreadcrumbs({ items = [] }: PageBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumbs className="et-breadcrumbs" separator="›">
      <Anchor component={Link} href="/home" className="et-crumb-link">
        Home
      </Anchor>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
          return (
            <Text key={`${item.label}-${index}`} className="et-crumb-current" component="span">
              {item.label}
            </Text>
          );
        }
        return (
          <Anchor
            key={`${item.label}-${index}`}
            component={Link}
            href={item.to}
            className="et-crumb-link"
          >
            {item.label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
