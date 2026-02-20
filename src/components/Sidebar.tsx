import { X, Package, Layers, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  theme: string;
}

export function Sidebar({ isOpen, onClose, currentView, onViewChange, theme }: SidebarProps) {
  const getColors = () => {
    if (theme === 'light') {
      return {
        overlay: 'bg-black bg-opacity-50',
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        icon: 'text-gray-600',
        iconBg: 'hover:bg-gray-100',
        activeItem: 'bg-blue-50 text-blue-600 border-blue-600',
        inactiveItem: 'text-gray-700 hover:bg-gray-50',
      };
    }
    if (theme === 'dark') {
      return {
        overlay: 'bg-black bg-opacity-70',
        bg: 'bg-[#262626]',
        border: 'border-[#404040]',
        text: 'text-[#e5e5e5]',
        textSecondary: 'text-gray-400',
        icon: 'text-gray-400',
        iconBg: 'hover:bg-[#404040]',
        activeItem: 'bg-[#dc2626] bg-opacity-20 text-[#dc2626] border-[#dc2626]',
        inactiveItem: 'text-gray-400 hover:bg-[#404040]',
      };
    }
    return {
      overlay: 'bg-black bg-opacity-70',
      bg: 'bg-[#27272a]',
      border: 'border-[#3f3f46]',
      text: 'text-[#e4e4e7]',
      textSecondary: 'text-gray-400',
      icon: 'text-gray-400',
      iconBg: 'hover:bg-[#3f3f46]',
      activeItem: 'bg-[#f59e0b] bg-opacity-20 text-[#f59e0b] border-[#f59e0b]',
      inactiveItem: 'text-gray-400 hover:bg-[#3f3f46]',
    };
  };

  const colors = getColors();

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose();
  };

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'bom', label: 'Take Out', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 ${colors.overlay} z-40 lg:hidden`}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 ${colors.bg} border-r ${colors.border} z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b ${colors.border}">
          <h2 className={`text-lg font-semibold ${colors.text}`}>Menu</h2>
          <button
            onClick={onClose}
            className={`p-2 ${colors.iconBg} rounded-lg transition-colors`}
          >
            <X className={`w-5 h-5 ${colors.icon}`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-l-4
                  ${isActive ? colors.activeItem : `border-transparent ${colors.inactiveItem}`}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
