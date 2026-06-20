import type { BreadcrumbItem } from '../components/PageBreadcrumbs';

export interface PageNavigation {
  breadcrumbs: BreadcrumbItem[];
  backTo: string | null;
  backLabel: string;
}

const GROUP_QUERY_KEYS = ['grpid', 'grpname', 'leader', 'member', 'expense'] as const;

function preserveGroupQuery(search: URLSearchParams): string {
  const params = new URLSearchParams();
  GROUP_QUERY_KEYS.forEach((key) => {
    const value = search.get(key);
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function groupName(search: URLSearchParams): string {
  const raw = search.get('grpname');
  return raw ? decodeURIComponent(raw) : 'Group';
}

function withSearch(path: string, search: URLSearchParams): string {
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

function groupSection(search: URLSearchParams): BreadcrumbItem[] {
  const gq = preserveGroupQuery(search);
  const name = groupName(search);
  return [
    { label: 'Groups', to: '/group' },
    { label: name, to: `/group/groupexpense${gq}` },
  ];
}

export function getPageNavigation(
  pathname: string,
  search: URLSearchParams,
): PageNavigation {
  const gq = preserveGroupQuery(search);

  if (pathname === '/home') {
    return {
      breadcrumbs: [{ label: 'Dashboard', to: '/home' }],
      backTo: null,
      backLabel: 'Back',
    };
  }

  if (pathname === '/expense') {
    return {
      breadcrumbs: [{ label: 'Expenses', to: '/expense' }],
      backTo: '/home',
      backLabel: 'Home',
    };
  }

  if (pathname === '/expense/addexpense') {
    return {
      breadcrumbs: [
        { label: 'Expenses', to: '/expense' },
        { label: 'Add expense', to: '/expense/addexpense' },
      ],
      backTo: '/expense',
      backLabel: 'Expenses',
    };
  }

  if (pathname === '/editexpense') {
    return {
      breadcrumbs: [
        { label: 'Expenses', to: '/expense' },
        { label: 'Edit expense', to: withSearch('/editexpense', search) },
      ],
      backTo: '/expense',
      backLabel: 'Expenses',
    };
  }

  if (pathname === '/category') {
    return {
      breadcrumbs: [{ label: 'Categories', to: '/category' }],
      backTo: '/home',
      backLabel: 'Home',
    };
  }

  if (pathname === '/category/addcategory') {
    return {
      breadcrumbs: [
        { label: 'Categories', to: '/category' },
        { label: 'Add category', to: '/category/addcategory' },
      ],
      backTo: '/category',
      backLabel: 'Categories',
    };
  }

  if (pathname.startsWith('/category/editcategory')) {
    return {
      breadcrumbs: [
        { label: 'Categories', to: '/category' },
        { label: 'Edit category', to: pathname },
      ],
      backTo: '/category',
      backLabel: 'Categories',
    };
  }

  if (pathname === '/group') {
    return {
      breadcrumbs: [{ label: 'Groups', to: '/group' }],
      backTo: '/home',
      backLabel: 'Home',
    };
  }

  if (pathname === '/group/addgroup') {
    return {
      breadcrumbs: [
        { label: 'Groups', to: '/group' },
        { label: 'Add group', to: '/group/addgroup' },
      ],
      backTo: '/group',
      backLabel: 'Groups',
    };
  }

  if (pathname === '/group/editgroup') {
    return {
      breadcrumbs: [
        { label: 'Groups', to: '/group' },
        { label: 'Edit group', to: withSearch('/group/editgroup', search) },
      ],
      backTo: '/group',
      backLabel: 'Groups',
    };
  }

  if (pathname === '/group/groupmember') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Members', to: `/group/groupmember${gq}` },
      ],
      backTo: '/group',
      backLabel: 'Groups',
    };
  }

  if (pathname === '/group/groupmember/addgroupmember') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Members', to: `/group/groupmember${gq}` },
        { label: 'Add member', to: `/group/groupmember/addgroupmember${gq}` },
      ],
      backTo: `/group/groupmember${gq}`,
      backLabel: 'Members',
    };
  }

  if (pathname === '/group/groupmember/editgroupmember') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Members', to: `/group/groupmember${gq}` },
        { label: 'Edit member', to: withSearch('/group/groupmember/editgroupmember', search) },
      ],
      backTo: `/group/groupmember${gq}`,
      backLabel: 'Members',
    };
  }

  if (pathname === '/group/groupexpense') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Expenses', to: `/group/groupexpense${gq}` },
      ],
      backTo: '/group',
      backLabel: 'Groups',
    };
  }

  if (pathname === '/group/groupexpense/addgroupexpense') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Expenses', to: `/group/groupexpense${gq}` },
        { label: 'Add expense', to: `/group/groupexpense/addgroupexpense${gq}` },
      ],
      backTo: `/group/groupexpense${gq}`,
      backLabel: 'Expenses',
    };
  }

  if (pathname === '/group/groupexpense/editgroupexpense') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Expenses', to: `/group/groupexpense${gq}` },
        { label: 'Edit expense', to: withSearch('/group/groupexpense/editgroupexpense', search) },
      ],
      backTo: `/group/groupexpense${gq}`,
      backLabel: 'Expenses',
    };
  }

  if (pathname === '/group/settlement') {
    return {
      breadcrumbs: [
        ...groupSection(search),
        { label: 'Settlements', to: `/group/settlement${gq}` },
      ],
      backTo: '/group',
      backLabel: 'Groups',
    };
  }

  if (pathname === '/userprofile') {
    return {
      breadcrumbs: [{ label: 'Profile', to: '/userprofile' }],
      backTo: '/home',
      backLabel: 'Home',
    };
  }

  return {
    breadcrumbs: [],
    backTo: '/home',
    backLabel: 'Home',
  };
}
