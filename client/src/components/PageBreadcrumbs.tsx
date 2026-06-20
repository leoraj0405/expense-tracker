import { Breadcrumbs, Anchor, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to: string;
}

interface PageBreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function PageBreadcrumbs({ items = [] }: PageBreadcrumbsProps) {
  return (
    <Breadcrumbs>
      <Anchor component={Link} to="/home" size="sm" c="dimmed">
        Home
      </Anchor>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
          return (
            <Text key={item.label} size="sm" c="dimmed">
              {item.label}
            </Text>
          );
        }
        return (
          <Anchor key={item.label} component={Link} to={item.to} size="sm" c="dimmed">
            {item.label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
