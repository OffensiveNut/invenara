import { useState } from 'react';
import { ArrowLeft, Edit2, Save, X, ChevronDown, ChevronUp, Plus, Trash2, ExternalLink, MapPin } from 'lucide-react';

interface ComponentSpec {
  name: string;
  value: string;
}

interface ComponentData {
  id: string;
  partNumber: string;
  manufacturer: string;
  type: string;
  package: string;
  packaging: string;
  stock: number;
  minStock: number;
  description: string;
  datasheetUrl: string;
  location: string;
  specs: ComponentSpec[];
}

interface ComponentDetailProps {
  component: ComponentData;
  onBack: () => void;
  onSave: (component: ComponentData) => void;
  theme: string;
}

export function ComponentDetailPage({ component, onBack, onSave, theme }: ComponentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [editedComponent, setEditedComponent] = useState<ComponentData>(component);
  const [showShelfPicker, setShowShelfPicker] = useState(false);

  const handleSave = () => {
    onSave(editedComponent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedComponent(component);
    setIsEditing(false);
  };

  const handleAddSpec = () => {
    setEditedComponent({
      ...editedComponent,
      specs: [...editedComponent.specs, { name: '', value: '' }],
    });
    setSpecsExpanded(true);
  };

  const handleRemoveSpec = (index: number) => {
    setEditedComponent({
      ...editedComponent,
      specs: editedComponent.specs.filter((_, i) => i !== index),
    });
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...editedComponent.specs];
    newSpecs[index][field] = value;
    setEditedComponent({ ...editedComponent, specs: newSpecs });
  };

  const handleLocationSelect = (row: number, col: number) => {
    // Count from bottom: row 0 is the bottom, so row 13 becomes 1, row 0 becomes 14
    const location = `${String.fromCharCode(65 + col)}${14 - row}`;
    setEditedComponent({ ...editedComponent, location });
    setShowShelfPicker(false);
  };

  const getColors = () => {
    if (theme === 'light') {
      return {
        bg: 'bg-gray-50',
        card: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textLabel: 'text-gray-600',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'border-gray-300 hover:bg-gray-50 text-gray-700',
        buttonDanger: 'text-red-600 hover:text-red-700',
        input: 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900',
        badge: 'bg-blue-100 text-blue-800',
        badgeLow: 'bg-red-100 text-red-800',
        badgeOk: 'bg-green-100 text-green-800',
        borderCell: 'border-gray-300',
        borderCellHover: 'hover:border-blue-500',
      };
    }
    if (theme === 'dark') {
      return {
        bg: 'bg-[#1a1a1a]',
        card: 'bg-[#262626]',
        border: 'border-[#404040]',
        text: 'text-[#e5e5e5]',
        textSecondary: 'text-gray-500',
        textLabel: 'text-gray-400',
        accent: 'text-[#dc2626]',
        button: 'bg-[#dc2626] hover:bg-[#b91c1c]',
        buttonSecondary: 'border-[#404040] hover:bg-[#404040] text-gray-400',
        buttonDanger: 'text-[#dc2626] hover:text-[#b91c1c]',
        input: 'bg-[#1a1a1a] border-[#404040] focus:ring-[#dc2626] text-[#e5e5e5]',
        badge: 'bg-[#dc2626] bg-opacity-20 text-[#dc2626]',
        badgeLow: 'bg-red-950 text-red-400',
        badgeOk: 'bg-green-950 text-green-400',
        borderCell: 'border-[#404040]',
        borderCellHover: 'hover:border-[#dc2626]',
      };
    }
    return {
      bg: 'bg-[#18181b]',
      card: 'bg-[#27272a]',
      border: 'border-[#3f3f46]',
      text: 'text-[#e4e4e7]',
      textSecondary: 'text-gray-500',
      textLabel: 'text-gray-400',
      accent: 'text-[#f59e0b]',
      button: 'bg-[#f59e0b] hover:bg-[#d97706]',
      buttonSecondary: 'border-[#3f3f46] hover:bg-[#3f3f46] text-gray-400',
      buttonDanger: 'text-[#f59e0b] hover:text-[#d97706]',
      input: 'bg-[#18181b] border-[#3f3f46] focus:ring-[#f59e0b] text-[#e4e4e7]',
      badge: 'bg-[#f59e0b] bg-opacity-20 text-[#f59e0b]',
      badgeLow: 'bg-red-950 text-red-400',
      badgeOk: 'bg-green-950 text-green-400',
      borderCell: 'border-[#3f3f46]',
      borderCellHover: 'hover:border-[#f59e0b]',
    };
  };

  const colors = getColors();

  const getStockBadge = () => {
    if (editedComponent.stock < editedComponent.minStock) {
      return colors.badgeLow;
    }
    return colors.badgeOk;
  };

  return (
    <div className={colors.bg}>
      {/* Header */}
      <div className={`${colors.card} border-b ${colors.border} sticky top-0 z-10`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className={colors.text}>{editedComponent.partNumber}</h2>
                <p className={`${colors.textSecondary} text-sm`}>Component Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${colors.buttonSecondary}`}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Basic Information */}
        <div className={`${colors.card} rounded-lg border ${colors.border} p-6`}>
          <h3 className={`${colors.text} mb-4`}>Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Part Number */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Part Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedComponent.partNumber}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, partNumber: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.partNumber}</p>
              )}
            </div>

            {/* Manufacturer */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Manufacturer
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedComponent.manufacturer}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, manufacturer: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.manufacturer}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Type
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedComponent.type}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, type: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.type}</p>
              )}
            </div>

            {/* Package */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Package
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedComponent.package}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, package: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.package}</p>
              )}
            </div>

            {/* Packaging */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Packaging
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedComponent.packaging}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, packaging: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.packaging}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Location
              </label>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setShowShelfPicker(true)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input} flex items-center justify-between hover:bg-opacity-50`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {editedComponent.location || 'Select location'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <p className={`${colors.text} flex items-center gap-2`}>
                  <MapPin className="w-4 h-4" />
                  {editedComponent.location}
                </p>
              )}
            </div>

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedComponent.description}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className={`${colors.card} rounded-lg border ${colors.border} p-6`}>
          <h3 className={`${colors.text} mb-4`}>Stock Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Stock */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Current Stock
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedComponent.stock}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, stock: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStockBadge()}`}>
                    {editedComponent.stock}
                  </span>
                </div>
              )}
            </div>

            {/* Minimum Stock */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Minimum Stock
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedComponent.minStock}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, minStock: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : (
                <p className={colors.text}>{editedComponent.minStock}</p>
              )}
            </div>

            {/* Datasheet */}
            <div>
              <label className={`block ${colors.textLabel} text-sm mb-2`}>
                Datasheet
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={editedComponent.datasheetUrl}
                  onChange={(e) =>
                    setEditedComponent({ ...editedComponent, datasheetUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              ) : editedComponent.datasheetUrl ? (
                <a
                  href={editedComponent.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${colors.accent} flex items-center gap-2 hover:underline`}
                >
                  View Datasheet
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className={colors.textSecondary}>No datasheet available</p>
              )}
            </div>
          </div>
        </div>

        {/* Specifications - Foldable */}
        <div className={`${colors.card} rounded-lg border ${colors.border}`}>
          <button
            onClick={() => setSpecsExpanded(!specsExpanded)}
            className={`w-full p-6 flex items-center justify-between ${colors.text} hover:bg-opacity-50 transition-colors`}
          >
            <div className="flex items-center gap-2">
              <h3>Specifications</h3>
              <span className={`px-2 py-1 rounded text-xs ${colors.badge}`}>
                {editedComponent.specs.length} items
              </span>
            </div>
            {specsExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {specsExpanded && (
            <div className={`px-6 pb-6 border-t ${colors.border}`}>
              <div className="pt-4 space-y-3">
                {/* Specs Table */}
                {editedComponent.specs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`border-b ${colors.border}`}>
                        <tr>
                          <th className={`text-left py-2 px-3 ${colors.textLabel} text-sm`}>
                            Parameter
                          </th>
                          <th className={`text-left py-2 px-3 ${colors.textLabel} text-sm`}>
                            Value
                          </th>
                          {isEditing && (
                            <th className={`text-right py-2 px-3 ${colors.textLabel} text-sm w-20`}>
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${colors.border}`}>
                        {editedComponent.specs.map((spec, index) => (
                          <tr key={index}>
                            <td className="py-3 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={spec.name}
                                  onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                                  placeholder="e.g., Memory Size"
                                  className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${colors.input}`}
                                />
                              ) : (
                                <span className={colors.text}>{spec.name}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={spec.value}
                                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                  placeholder="e.g., 32KB"
                                  className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${colors.input}`}
                                />
                              ) : (
                                <span className={colors.text}>{spec.value}</span>
                              )}
                            </td>
                            {isEditing && (
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleRemoveSpec(index)}
                                  className={`p-1 rounded hover:bg-opacity-10 ${colors.buttonDanger}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`${colors.textSecondary} text-sm text-center py-4`}>
                    No specifications added yet
                  </p>
                )}

                {/* Add Spec Button */}
                {isEditing && (
                  <button
                    onClick={handleAddSpec}
                    className={`w-full mt-3 px-4 py-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 ${colors.buttonSecondary}`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Specification
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shelf Picker Modal */}
      {showShelfPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className={`${colors.card} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
              <div>
                <h3 className={colors.text}>Select Shelf Location</h3>
                <p className={`${colors.textSecondary} text-sm mt-1`}>
                  Click on a cell to assign this component's location
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
                      const cellLocation = `${String.fromCharCode(65 + colIndex)}${14 - rowIndex}`;
                      const isSelected = editedComponent.location === cellLocation;
                      
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleLocationSelect(rowIndex, colIndex)}
                          className={`
                            relative border-2 rounded-lg p-4 
                            min-h-[100px]
                            transition-all cursor-pointer
                            ${
                              isSelected
                                ? `${colors.button.replace('hover:bg-', 'bg-')} text-white border-transparent`
                                : `${colors.borderCell} ${colors.borderCellHover} ${theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#18181b]'}`
                            }
                          `}
                        >
                          {/* Cell Label */}
                          <div className={`absolute top-2 left-2 text-xs ${isSelected ? 'text-white opacity-70' : colors.textLabel}`}>
                            {cellLocation}
                          </div>

                          {/* Cell Content */}
                          <div className="flex flex-col items-center justify-center h-full pt-4">
                            <MapPin className={`w-6 h-6 mb-1 ${isSelected ? 'text-white' : colors.textSecondary}`} />
                            <p className={`text-xs ${isSelected ? 'text-white' : colors.textSecondary}`}>
                              {isSelected ? 'Current' : 'Select'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t ${colors.border} flex justify-end gap-2`}>
              <button
                onClick={() => setShowShelfPicker(false)}
                className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}