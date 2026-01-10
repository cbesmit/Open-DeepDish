import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/authStore';

export default function Sidebar() {
  const { logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Generador IA', href: '/generador', icon: SparklesIcon },
    { name: 'Mis Recetas', href: '/recetas', icon: BookOpenIcon },
    { name: 'Configuración', href: '/config', icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto z-10">
      {/* Logo */}
      <div className="flex items-center h-20 px-6 border-b border-gray-100">
        <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SACC Chef</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors group",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-6 w-6",
                    isActive ? "text-brand-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors group"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-red-500" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
