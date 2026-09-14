import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  user: { name: string; email: string };
}

export default function Header({ user }: HeaderProps) {
  
  return (
    <header className="header bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
        <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user.name}!</p>
        </div>

        {/* Search bar - desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            </div>
        </div>

        <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User profile */}
            <div className="hidden md:flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</p>
            </div>
            </div>
        </div>
        </div>
    </header>)
}