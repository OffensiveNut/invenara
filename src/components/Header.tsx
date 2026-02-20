import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  theme: string;
}

export function Header({ onMenuClick, theme }: HeaderProps) {
  const getColors = () => {
    if (theme === 'light') {
      return {
        bg: 'bg-white',
        border: 'border-gray-200',
        title: 'text-blue-600',
        subtitle: 'text-gray-600',
        icon: 'text-gray-600',
        iconBg: 'hover:bg-gray-100',
      };
    }
    if (theme === 'dark') {
      return {
        bg: 'bg-[#262626]',
        border: 'border-[#404040]',
        title: 'text-[#dc2626]',
        subtitle: 'text-gray-400',
        icon: 'text-gray-400',
        iconBg: 'hover:bg-[#404040]',
      };
    }
    return {
      bg: 'bg-[#27272a]',
      border: 'border-[#3f3f46]',
      title: 'text-[#f59e0b]',
      subtitle: 'text-gray-400',
      icon: 'text-gray-400',
      iconBg: 'hover:bg-[#3f3f46]',
    };
  };

  const colors = getColors();

  return (
    <header className={`${colors.bg} border-b ${colors.border} sticky top-0 z-10`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className={`p-2 ${colors.iconBg} rounded-lg transition-colors`}
            >
              <Menu className={`w-5 h-5 ${colors.icon}`} />
            </button>

            <div>
              <h1 className={`text-xl font-semibold ${colors.title}`}>
                Invenara
              </h1>
              <p className={`text-xs ${colors.subtitle}`}>
                Electronic Component Manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className={`p-2 ${colors.iconBg} rounded-full transition-colors relative`}>
              <Bell className={`w-5 h-5 ${colors.icon}`} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${theme === 'light' ? 'bg-blue-100' : theme === 'dark' ? 'bg-[#dc2626] bg-opacity-20' : 'bg-[#f59e0b] bg-opacity-20'} flex items-center justify-center`}>
                <span className={`text-sm font-medium ${colors.title}`}>
                  U
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
