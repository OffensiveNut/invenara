import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MapPin, X } from 'lucide-react';
import { getComponents, searchComponents } from '@/services/components';
import type { Component } from '@/types';

interface InventoryPageProps {
  theme: string;
  onComponentClick?: (component: Component) => void;
  onAddComponent?: () => void;
}

export function InventoryPage({ theme, onComponentClick, onAddComponent }: InventoryPageProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shelfFilter, setShelfFilter] = useState<string>('');
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Component | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 8;

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComponents();
      setComponents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load components');
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = components.filter(
    (item) =>
      (item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (shelfFilter === '' || item.location === shelfFilter)
  );

  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      })
    : filteredData;

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Component) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: keyof Component) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock < 50) return 'text-red-400 bg-red-950';
    if (stock < 150) return 'text-yellow-400 bg-yellow-950';
    return 'text-green-400 bg-green-950';
  };

  const getColors = () => {
    if (theme === 'light') {
      return {
        card: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textTertiary: 'text-gray-600',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'border-gray-300 hover:bg-gray-50 text-gray-700',
        input: 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900 placeholder-gray-400',
        borderCell: 'border-gray-300',
        borderCellHover: 'hover:border-blue-500',
        textLabel: 'text-gray-600',
        tableHeader: 'bg-gray-50',
        tableRow: 'hover:bg-gray-50',
        badge: 'bg-gray-100 text-gray-700',
        iconColor: 'text-gray-400',
      };
    }
    if (theme === 'dark') {
      return {
        card: 'bg-[#262626]',
        border: 'border-[#404040]',
        text: 'text-[#e5e5e5]',
        textSecondary: 'text-gray-500',
        textTertiary: 'text-gray-400',
        accent: 'text-[#dc2626]',
        button: 'bg-[#dc2626] hover:bg-[#b91c1c]',
        buttonSecondary: 'border-[#404040] hover:bg-[#404040] text-gray-400',
        input: 'bg-[#1a1a1a] border-[#404040] focus:ring-[#dc2626] text-[#e5e5e5] placeholder-gray-600',
        borderCell: 'border-[#404040]',
        borderCellHover: 'hover:border-[#dc2626]',
        textLabel: 'text-gray-400',
        tableHeader: 'bg-[#1a1a1a]',
        tableRow: 'hover:bg-[#2a2a2a]',
        badge: 'bg-[#404040] text-gray-300',
        iconColor: 'text-gray-500',
      };
    }
    return {
      card: 'bg-[#27272a]',
      border: 'border-[#3f3f46]',
      text: 'text-[#e4e4e7]',
      textSecondary: 'text-gray-500',
      textTertiary: 'text-gray-400',
      accent: 'text-[#f59e0b]',
      button: 'bg-[#f59e0b] hover:bg-[#d97706]',
      buttonSecondary: 'border-[#3f3f46] hover:bg-[#3f3f46] text-gray-400',
      input: 'bg-[#18181b] border-[#3f3f46] focus:ring-[#f59e0b] text-[#e4e4e7] placeholder-gray-600',        borderCell: 'border-[#3f3f46]',
        borderCellHover: 'hover:border-[#f59e0b]',
        textLabel: 'text-gray-400',      tableHeader: 'bg-[#18181b]',
      tableRow: 'hover:bg-[#2a2a2e]',
      badge: 'bg-[#3f3f46] text-gray-300',
      iconColor: 'text-gray-500',
    };
  };

  const colors = getColors();

  if (loading) {
    return (
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-8`}>
        <div className="flex items-center justify-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.accent}`}></div>
          <span className={`ml-3 ${colors.text}`}>Loading components...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-8`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={loadComponents}
            className={`px-4 py-2 text-white rounded-lg ${colors.button}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border}`}>
      {/* Table Header */}
      <div className={`p-4 sm:p-6 border-b ${colors.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className={colors.text}>Component Inventory</h2>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Manage and track your electrical components
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${colors.buttonSecondary}`}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`} onClick={onAddComponent}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Component</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.iconColor} w-5 h-5`} />
            <input
              type="text"
              placeholder="Search by part number, manufacturer, type..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button 
            onClick={() => setShowShelfPicker(true)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 justify-center sm:justify-start ${colors.buttonSecondary} ${shelfFilter ? colors.accent : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span>{shelfFilter || 'Location'}</span>
            {shelfFilter && (
              <X 
                className="w-3 h-3 ml-1" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShelfFilter('');
                  setCurrentPage(1);
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className={`${colors.tableHeader} border-b ${colors.border}`}>
            <tr>
              <th 
                className={`px-6 py-3 text-left ${colors.textTertiary} cursor-pointer hover:${colors.text} transition-colors select-none`}
                onClick={() => handleSort('partNumber')}
              >
                <div className="flex items-center gap-2">
                  Part Number
                  {getSortIcon('partNumber')}
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left ${colors.textTertiary} cursor-pointer hover:${colors.text} transition-colors select-none`}
                onClick={() => handleSort('manufacturer')}
              >
                <div className="flex items-center gap-2">
                  Manufacturer
                  {getSortIcon('manufacturer')}
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left ${colors.textTertiary} cursor-pointer hover:${colors.text} transition-colors select-none`}
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left ${colors.textTertiary} cursor-pointer hover:${colors.text} transition-colors select-none`}
                onClick={() => handleSort('package')}
              >
                <div className="flex items-center gap-2">
                  Package
                  {getSortIcon('package')}
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left ${colors.textTertiary} cursor-pointer hover:${colors.text} transition-colors select-none`}
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  {getSortIcon('stock')}
                </div>
              </th>
              <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>
                Description
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${colors.border}`}>
            {paginatedData.map((item) => (
              <tr 
                key={item.id}
                onClick={() => onComponentClick?.(item)}
                className={`transition-colors cursor-pointer ${colors.tableRow}`}
              >
                <td className="px-6 py-4">
                  <span className={colors.accent}>{item.partNumber}</span>
                </td>
                <td className={`px-6 py-4 ${colors.text}`}>{item.manufacturer}</td>
                <td className={`px-6 py-4 ${colors.textTertiary}`}>{item.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-sm ${colors.badge}`}>
                    {item.package}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStockStatus(item.stock)}`}>
                    {item.stock}
                  </span>
                </td>
                <td className={`px-6 py-4 ${colors.textTertiary} max-w-xs truncate`}>
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile/Tablet View */}
      <div className={`lg:hidden divide-y ${colors.border}`}>
        {paginatedData.map((item) => (
          <div 
            key={item.id}
            onClick={() => onComponentClick?.(item)}
            className={`p-4 cursor-pointer ${colors.tableRow}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className={colors.accent}>{item.partNumber}</p>
                <p className={`${colors.textTertiary} text-sm mt-1`}>{item.manufacturer}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStockStatus(item.stock)}`}>
                {item.stock}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className={`${colors.textSecondary} text-sm`}>Type</p>
                <p className={`${colors.text} text-sm`}>{item.type}</p>
              </div>
              <div>
                <p className={`${colors.textSecondary} text-sm`}>Package</p>
                <span className={`inline-block px-2 py-1 rounded text-sm ${colors.badge}`}>
                  {item.package}
                </span>
              </div>
            </div>
            <div>
              <p className={`${colors.textSecondary} text-sm`}>Description</p>
              <p className={`${colors.textTertiary} text-sm mt-1`}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={`px-4 sm:px-6 py-4 border-t ${colors.border} flex items-center justify-between`}>
        <p className={`${colors.textTertiary} text-sm`}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{' '}
          {sortedData.length} components
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${colors.buttonSecondary}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`${colors.textTertiary} text-sm`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${colors.buttonSecondary}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shelf Picker Modal */}
      {showShelfPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className={`${colors.card} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
              <div>
                <h3 className={colors.text}>Filter by Location</h3>
                <p className={`${colors.textSecondary} text-sm mt-1`}>
                  Click on a shelf cell to filter components by that location
                </p>
              </div>
              <button
                onClick={() => setShowShelfPicker(false)}
                className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shelf Grid */}
            <div className="p-6 overflow-auto">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 14 }).map((_, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="contents">
                    {Array.from({ length: 3 }).map((_, colIndex) => {
                      // Display from bottom to top: row 0 is bottom (A14), row 13 is top (A1)
                      const cellLocation = `Shelf ${String.fromCharCode(65 + colIndex)}${14 - rowIndex}`;
                      const isSelected = shelfFilter === cellLocation;
                      const componentsInCell = components.filter(c => c.location === cellLocation).length;
                      
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => {
                            setShelfFilter(cellLocation);
                            setShowShelfPicker(false);
                            setCurrentPage(1);
                          }}
                          className={`
                            relative border-2 rounded-lg p-2
                            min-h-[70px]
                            transition-all cursor-pointer
                            ${
                              isSelected
                                ? `${colors.button.replace('hover:bg-', 'bg-')} text-white border-transparent`
                                : `${colors.borderCell} ${colors.borderCellHover} ${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#18181b]'}`
                            }
                          `}
                        >
                          {/* Cell Label */}
                          <div className={`absolute top-1 left-1 text-xs font-medium ${isSelected ? 'text-white opacity-70' : colors.textLabel}`}>
                            {String.fromCharCode(65 + colIndex)}{14 - rowIndex}
                          </div>

                          {/* Cell Content */}
                          <div className="flex flex-col items-center justify-center h-full pt-3">
                            <MapPin className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : colors.textSecondary}`} />
                            {componentsInCell > 0 && (
                              <span className={`text-xs font-semibold ${isSelected ? 'text-white' : colors.accent}`}>
                                {componentsInCell}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t ${colors.border} flex justify-between items-center`}>
              <button
                onClick={() => {
                  setShelfFilter('');
                  setShowShelfPicker(false);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
              >
                Clear Filter
              </button>
              <button
                onClick={() => setShowShelfPicker(false)}
                className={`px-4 py-2 text-white rounded-lg ${colors.button}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
