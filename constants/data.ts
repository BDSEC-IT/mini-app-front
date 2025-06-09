import { NavItem } from '@/types';

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    company: 'Dell',
    role: 'Frontend Developer',
    verified: false,
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    company: 'TechCorp',
    role: 'Backend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    company: 'WebTech',
    role: 'UI Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    company: 'Innovate Inc.',
    role: 'Fullstack Developer',
    verified: false,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    company: 'TechGuru',
    role: 'Product Manager',
    verified: true,
    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    company: 'CodeGenius',
    role: 'QA Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    company: 'SoftWorks',
    role: 'UX Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    company: 'DevCraft',
    role: 'DevOps Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    company: 'WebSolutions',
    role: 'Frontend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    company: 'DataTech',
    role: 'Data Analyst',
    verified: false,
    status: 'Active'
  }
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const navItems: NavItem[] = [
  {
    groupLabel: 'dashboardlbl',
    title: 'dashboard',
    // title: 'Дашборд',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [], // Empty array as there are no child items for Dashboard
    roles: ['ALL']
  },
  {
    groupLabel: 'adminlbl',
    title: 'users',
    // title: 'Харилцагч',
    url: '/dashboard/users',
    icon: 'users',
    shortcut: ['e', 'e'],
    isActive: false,
    items: [], // No child items
    roles: ['ADMIN', 'SUPERADMIN']
  },
  {
    groupLabel: 'mysection',
    title: 'Account',
    // title: 'Бүртгэл',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'user',
    isActive: true,
    roles: ['USER'],
    items: [
      {
        title: 'MyProfile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm'],
        roles: ['ALL']
      }
    ]
  }
  // {
  //   groupLabel: 'listsLbl',
  //   title: 'Bonds',
  //   // title: 'MSE',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'bonds',
  //   isActive: true,
  //   roles: ['ALL'],

  //   items: [
  //     {
  //       title: 'MSEBonds',
  //       // title: 'Бондууд',
  //       url: '/dashboard/mse',
  //       shortcut: ['m', 'm'],
  //       roles: ['ALL']
  //     },
  //     {
  //       title: 'securities',
  //       url: '/dashboard/otc',
  //       locked: true,
  //       icon: 'lock',
  //       roles: ['ADMIN', 'SUPERADMIN'],
  //       shortcut: ['l', 'l']
  //     },
  //     {
  //       title: 'QuotesInfo',
  //       // title: 'Зах зээлийн мэдээ',
  //       url: '/dashboard/ubx',
  //       roles: ['ALL'],
  //       shortcut: ['m', 'm']
  //     },
  //     {
  //       title: 'PriceHistory',
  //       // title: 'Үнийн түүх',
  //       url: '/dashboard/ubx/prices',
  //       roles: ['ALL'],
  //       shortcut: ['l', 'l']
  //     }
  //   ]
  // },
  // {
  //   title: 'HBUTS',
  //   // title: 'UBX',
  //   url: '#', // Placeholder as there is no direct link for the parent
  //   icon: 'abs',
  //   isActive: true,
  //   roles: ['ALL'],

  //   items: [
  //     {
  //       title: 'registeredSecs',
  //       // title: 'Бүртгэлтэй үнэт цаас',
  //       url: '/dashboard/chex',
  //       shortcut: ['m', 'm'],
  //       roles: ['ALL']
  //     }
  //   ]
  // },
  // {
  //   groupLabel: 'additionallbl',

  //   title: 'yieldcalculator',
  //   url: '/dashboard/yieldcalculation',
  //   icon: 'calculator',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   roles: ['ALL'],

  //   items: [] // No child items
  // },
  // {
  //   title: 'Tasks',
  //   // title: 'Тэмдэглэл',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   roles: ['ALL'],

  //   items: [] // No child items
  // }
];
