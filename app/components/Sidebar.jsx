'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Whitelist', href: '/dashboard' },
  { name: 'Manajemen User', href: '/dashboard/manajemen-user' },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-indigo-600">Dashboard</h2>
      </div>
      <nav className="mt-8">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="px-4">
                <Link
                  href={link.href}
                  className={`block py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
