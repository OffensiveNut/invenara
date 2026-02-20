import { Palette, Check } from 'lucide-react';

interface SettingsPageProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themes = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright interface',
    preview: {
      bg: '#ffffff',
      card: '#f9fafb',
      accent: '#2563eb',
      text: '#111827',
    },
  },
  {
    id: 'dark',
    name: 'Dark Red',
    description: 'Dark theme with red accents',
    preview: {
      bg: '#1a1a1a',
      card: '#262626',
      accent: '#dc2626',
      text: '#e5e5e5',
    },
  },
  {
    id: 'bomist',
    name: 'Dark Amber',
    description: 'Dark theme with amber accents',
    preview: {
      bg: '#18181b',
      card: '#27272a',
      accent: '#f59e0b',
      text: '#e4e4e7',
    },
  },
];

export function SettingsPage({ currentTheme, onThemeChange }: SettingsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${currentTheme === 'light' ? 'bg-white border-gray-200' : currentTheme === 'dark' ? 'bg-[#262626] border-[#404040]' : 'bg-[#27272a] border-[#3f3f46]'} rounded-lg shadow-sm border p-4 sm:p-6`}>
        <div className="flex items-center gap-3 mb-2">
          <Palette className={currentTheme === 'light' ? 'text-blue-600' : currentTheme === 'dark' ? 'text-[#dc2626]' : 'text-[#f59e0b]'} />
          <h2 className={currentTheme === 'light' ? 'text-gray-900' : 'text-[#e5e5e5]'}>Settings</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Customize your Invenara experience
        </p>
      </div>

      {/* Theme Selection */}
      <div className={`${currentTheme === 'light' ? 'bg-white border-gray-200' : currentTheme === 'dark' ? 'bg-[#262626] border-[#404040]' : 'bg-[#27272a] border-[#3f3f46]'} rounded-lg shadow-sm border p-4 sm:p-6`}>
        <h3 className={`${currentTheme === 'light' ? 'text-gray-900' : 'text-[#e5e5e5]'} mb-4`}>Theme</h3>
        <p className="text-gray-500 text-sm mb-6">
          Choose your preferred color theme for the interface
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  currentTheme === theme.id
                    ? currentTheme === 'light'
                      ? 'border-blue-600 bg-blue-50'
                      : currentTheme === 'dark'
                      ? 'border-[#dc2626] bg-[#1a1a1a]'
                      : 'border-[#f59e0b] bg-[#18181b]'
                    : currentTheme === 'light'
                    ? 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    : currentTheme === 'dark'
                    ? 'border-[#404040] hover:border-[#525252] bg-[#1a1a1a]'
                    : 'border-[#3f3f46] hover:border-[#52525b] bg-[#18181b]'
                }
              `}
            >
              {/* Selected Indicator */}
              {currentTheme === theme.id && (
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                    currentTheme === 'light'
                      ? 'bg-blue-600'
                      : currentTheme === 'dark'
                      ? 'bg-[#dc2626]'
                      : 'bg-[#f59e0b]'
                  }`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Theme Preview */}
              <div className="flex gap-2 mb-3">
                <div
                  className="w-12 h-12 rounded border"
                  style={{
                    backgroundColor: theme.preview.bg,
                    borderColor: theme.preview.accent,
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div
                    className="w-12 h-5 rounded"
                    style={{ backgroundColor: theme.preview.card }}
                  />
                  <div
                    className="w-12 h-5 rounded"
                    style={{ backgroundColor: theme.preview.accent }}
                  />
                </div>
              </div>

              {/* Theme Info */}
              <h4
                className="mb-1"
                style={{ color: theme.preview.text }}
              >
                {theme.name}
              </h4>
              <p className="text-xs text-gray-500">
                {theme.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Settings Placeholder */}
      <div className={`${currentTheme === 'light' ? 'bg-white border-gray-200' : currentTheme === 'dark' ? 'bg-[#262626] border-[#404040]' : 'bg-[#27272a] border-[#3f3f46]'} rounded-lg shadow-sm border p-4 sm:p-6`}>
        <h3 className={`${currentTheme === 'light' ? 'text-gray-900' : 'text-[#e5e5e5]'} mb-2`}>More Settings</h3>
        <p className="text-gray-500 text-sm">
          Additional settings will be available here soon
        </p>
      </div>
    </div>
  );
}
