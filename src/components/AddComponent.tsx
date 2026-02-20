import { useState, useEffect } from 'react';
import { X, Edit, QrCode, Camera, Plus, Trash2, MapPin, ChevronDown, Search } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getDistinctFieldValues } from '@/services/components';
import { searchLCSC, type LCSCProduct } from '@/services/lcsc';

interface ComponentSpec {
  name: string;
  value: string;
}

interface ComponentData {
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

interface AddComponentProps {
  onClose: () => void;
  onAdd: (component: ComponentData) => void;
  theme: string;
}

export function AddComponent({ onClose, onAdd, theme }: AddComponentProps) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'qr' | 'lcsc-results'>('choose');
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [component, setComponent] = useState<ComponentData>({
    partNumber: '',
    manufacturer: '',
    type: '',
    package: '',
    packaging: '',
    stock: 0,
    minStock: 50,
    description: '',
    datasheetUrl: '',
    location: '',
    specs: [],
  });
  
  // LCSC search state
  const [lcscResults, setLcscResults] = useState<LCSCProduct[]>([]);
  const [isSearchingLCSC, setIsSearchingLCSC] = useState(false);
  const [scannedPartNumber, setScannedPartNumber] = useState('');
  
  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<{
    manufacturer: string[];
    type: string[];
    package: string[];
    packaging: string[];
  }>({ manufacturer: [], type: [], package: [], packaging: [] });

  // Search LCSC for part details
  const searchLCSCForPart = async (partNumber: string) => {
    setIsSearchingLCSC(true);
    try {
      const results = await searchLCSC(partNumber);
      setLcscResults(results);
      if (results.length > 0) {
        setMode('lcsc-results');
      } else {
        // No results, go to manual entry
        setComponent(prev => ({ ...prev, partNumber }));
        setMode('manual');
        alert('No results found on LCSC. Please enter details manually.');
      }
    } catch (error) {
      console.error('LCSC search error:', error);
      setComponent(prev => ({ ...prev, partNumber }));
      setMode('manual');
      alert('Error searching LCSC. Please enter details manually.');
    } finally {
      setIsSearchingLCSC(false);
    }
  };

  // Load autocomplete suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [manufacturers, types, packages, packagings] = await Promise.all([
          getDistinctFieldValues('manufacturer'),
          getDistinctFieldValues('type'),
          getDistinctFieldValues('package'),
          getDistinctFieldValues('packaging'),
        ]);
        setSuggestions({
          manufacturer: manufacturers,
          type: types,
          package: packages,
          packaging: packagings,
        });
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (mode === 'qr') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 30, 
          qrbox: { width: 350, height: 350 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Parse LCSC QR code format: {pbn:xxx,on:xxx,pc:xxx,pm:QS6M3TR,qty:2,...}
          try {
            // Check if it's LCSC format (starts with { and contains pm: and qty:)
            if (decodedText.startsWith('{') && decodedText.includes('pm:') && decodedText.includes('qty:')) {
              // Parse LCSC format
              const lcscData: Record<string, string> = {};
              // Remove curly braces and split by comma
              const pairs = decodedText.slice(1, -1).split(',');
              pairs.forEach(pair => {
                const [key, value] = pair.split(':');
                if (key && value !== undefined) {
                  lcscData[key.trim()] = value.trim();
                }
              });

              const partNum = lcscData.pm || '';
              const qty = parseInt(lcscData.qty || '0', 10);
              
              setScannedPartNumber(partNum);
              setComponent({
                ...component,
                stock: qty,
                specs: lcscData.pc ? [{ name: 'LCSC Part Code', value: lcscData.pc }] : [],
              });
              
              scanner.clear();
              
              // Search LCSC for component details
              searchLCSCForPart(partNum);
            } else {
              // Try parsing as JSON
              const data = JSON.parse(decodedText);
              setComponent({
                partNumber: data.partNumber || '',
                manufacturer: data.manufacturer || '',
                type: data.type || '',
                package: data.package || '',
                packaging: data.packaging || '',
                stock: data.stock || 0,
                minStock: data.minStock || 50,
                description: data.description || '',
                datasheetUrl: data.datasheetUrl || '',
                location: data.location || '',
                specs: data.specs || [],
              });
              scanner.clear();
              setMode('manual'); // Switch to manual mode to review/edit
            }
          } catch (e) {
            // If not JSON or LCSC format, treat as part number
            setComponent({ ...component, partNumber: decodedText });
            scanner.clear();
            setMode('manual');
          }
        },
        (error) => {
          // QR scanning error (can be ignored for continuous scanning)
        }
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [mode]);

  const handleAddSpec = () => {
    setComponent({
      ...component,
      specs: [...component.specs, { name: '', value: '' }],
    });
  };

  const handleRemoveSpec = (index: number) => {
    const newSpecs = component.specs.filter((_, i) => i !== index);
    setComponent({ ...component, specs: newSpecs });
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...component.specs];
    newSpecs[index][field] = value;
    setComponent({ ...component, specs: newSpecs });
  };

  const handleLocationSelect = (row: number, col: number) => {
    // Count from bottom: row 0 is the bottom, so row 13 becomes 1, row 0 becomes 14
    const location = `Shelf ${String.fromCharCode(65 + col)}${14 - row}`;
    setComponent({ ...component, location });
    setShowShelfPicker(false);
  };

  const applyLCSCResult = (result: LCSCProduct) => {
    setComponent({
      ...component,
      partNumber: result.partNumber,
      manufacturer: result.manufacturer,
      description: result.description,
      package: result.package,
      packaging: result.packaging,
      datasheetUrl: result.datasheet || '',
      specs: [
        ...component.specs,
        { name: 'LCSC Part Number', value: result.lcscPartNumber },
        { name: 'LCSC Stock', value: result.inStock.toString() },
      ],
    });
    setMode('manual');
  };

  const handleSubmit = () => {
    if (!component.partNumber || !component.manufacturer) {
      alert('Part Number and Manufacturer are required');
      return;
    }
    onAdd(component);
    onClose();
  };

  const getColors = () => {
    if (theme === 'light') {
      return {
        card: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textLabel: 'text-gray-600',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'border-gray-300 hover:bg-gray-50 text-gray-700',
        input: 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900',
        badge: 'bg-blue-100 text-blue-800',
        borderCell: 'border-gray-300',
        borderCellHover: 'hover:border-blue-500',
      };
    }
    if (theme === 'dark') {
      return {
        card: 'bg-[#262626]',
        border: 'border-[#404040]',
        text: 'text-[#e5e5e5]',
        textSecondary: 'text-gray-500',
        textLabel: 'text-gray-400',
        accent: 'text-[#dc2626]',
        button: 'bg-[#dc2626] hover:bg-[#b91c1c]',
        buttonSecondary: 'border-[#404040] hover:bg-[#404040] text-gray-400',
        input: 'bg-[#1a1a1a] border-[#404040] focus:ring-[#dc2626] text-[#e5e5e5]',
        badge: 'bg-[#dc2626] bg-opacity-20 text-[#dc2626]',
        borderCell: 'border-[#404040]',
        borderCellHover: 'hover:border-[#dc2626]',
      };
    }
    return {
      card: 'bg-[#27272a]',
      border: 'border-[#3f3f46]',
      text: 'text-[#e4e4e7]',
      textSecondary: 'text-gray-500',
      textLabel: 'text-gray-400',
      accent: 'text-[#f59e0b]',
      button: 'bg-[#f59e0b] hover:bg-[#d97706]',
      buttonSecondary: 'border-[#3f3f46] hover:bg-[#3f3f46] text-gray-400',
      input: 'bg-[#18181b] border-[#3f3f46] focus:ring-[#f59e0b] text-[#e4e4e7]',
      badge: 'bg-[#f59e0b] bg-opacity-20 text-[#f59e0b]',
      borderCell: 'border-[#3f3f46]',
      borderCellHover: 'hover:border-[#f59e0b]',
    };
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className={`${colors.card} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
          <h3 className={colors.text}>Add New Component</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {mode === 'choose' && (
            <div className="space-y-4">
              <p className={`${colors.textSecondary} text-center mb-8`}>
                Choose how you'd like to add a component
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('manual')}
                  className={`p-8 border-2 rounded-lg ${colors.borderCell} ${colors.borderCellHover} transition-all hover:shadow-lg`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${colors.badge} flex items-center justify-center`}>
                      <Edit className={`w-8 h-8 ${colors.accent}`} />
                    </div>
                    <div>
                      <h4 className={colors.text}>Manual Entry</h4>
                      <p className={`${colors.textSecondary} text-sm mt-2`}>
                        Enter component details manually
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('qr')}
                  className={`p-8 border-2 rounded-lg ${colors.borderCell} ${colors.borderCellHover} transition-all hover:shadow-lg`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${colors.badge} flex items-center justify-center`}>
                      <QrCode className={`w-8 h-8 ${colors.accent}`} />
                    </div>
                    <div>
                      <h4 className={colors.text}>Scan QR Code</h4>
                      <p className={`${colors.textSecondary} text-sm mt-2`}>
                        Scan component QR code to import data
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === 'qr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className={colors.text}>Scan QR Code</h4>
                <button
                  onClick={() => setMode('choose')}
                  className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
                >
                  Back
                </button>
              </div>
              {isSearchingLCSC ? (
                <div className={`${colors.card} border ${colors.border} rounded-lg p-8 text-center`}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                    <p className={colors.textSecondary}>Searching LCSC for component details...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`${colors.card} border ${colors.border} rounded-lg p-4`}>
                    <div id="qr-reader" className="w-full"></div>
                  </div>
                  <p className={`${colors.textSecondary} text-sm text-center`}>
                    Position the QR code within the frame to scan
                  </p>
                </>
              )}
            </div>
          )}

          {mode === 'lcsc-results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className={colors.text}>LCSC Search Results for &quot;{scannedPartNumber}&quot;</h4>
                <button
                  onClick={() => setMode('manual')}
                  className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
                >
                  Manual Entry
                </button>
              </div>
              
              <div className="space-y-3">
                {lcscResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => applyLCSCResult(result)}
                    className={`border ${colors.border} rounded-lg p-4 cursor-pointer hover:border-[#f59e0b] transition-all`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className={`${colors.text} font-semibold text-lg`}>{result.partNumber}</h5>
                        <p className={`${colors.textSecondary} text-sm`}>{result.lcscPartNumber}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${colors.badge}`}>
                        {result.inStock} in stock
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className={`${colors.textLabel} text-xs`}>Manufacturer</p>
                        <p className={`${colors.text} text-sm`}>{result.manufacturer || 'N/A'}</p>
                      </div>
                      <div>
                        <p className={`${colors.textLabel} text-xs`}>Package</p>
                        <p className={`${colors.text} text-sm`}>{result.package || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <p className={`${colors.textSecondary} text-sm line-clamp-2`}>
                      {result.description || 'No description available'}
                    </p>
                    
                    {result.datasheet && (
                      <a
                        href={result.datasheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-[#f59e0b] text-sm mt-2 inline-block hover:underline`}
                      >
                        View Datasheet
                      </a>
                    )}
                  </div>
                ))}
              </div>
              
              {lcscResults.length === 0 && (
                <div className={`${colors.card} border ${colors.border} rounded-lg p-8 text-center`}>
                  <p className={colors.textSecondary}>No results found</p>
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className={colors.text}>Component Details</h4>
                <button
                  onClick={() => setMode('choose')}
                  className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
                >
                  Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Part Number */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Part Number *
                  </label>
                  <input
                    type="text"
                    value={component.partNumber}
                    onChange={(e) => setComponent({ ...component, partNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                    placeholder="e.g., LM358N"
                  />
                </div>

                {/* Manufacturer */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    list="manufacturer-list"
                    value={component.manufacturer}
                    onChange={(e) => setComponent({ ...component, manufacturer: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                    placeholder="e.g., Texas Instruments"
                  />
                  <datalist id="manufacturer-list">
                    {suggestions.manufacturer.map((manufacturer) => (
                      <option key={manufacturer} value={manufacturer} />
                    ))}
                  </datalist>
                </div>

                {/* Type */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Type
                  </label>
                  <input
                    type="text"
                    list="type-list"
                    value={component.type}
                    onChange={(e) => setComponent({ ...component, type: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                    placeholder="e.g., Op-Amp"
                  />
                  <datalist id="type-list">
                    {suggestions.type.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>

                {/* Package */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Package
                  </label>
                  <input
                    type="text"
                    list="package-list"
                    value={component.package}
                    onChange={(e) => setComponent({ ...component, package: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                    placeholder="e.g., DIP-8"
                  />
                  <datalist id="package-list">
                    {suggestions.package.map((pkg) => (
                      <option key={pkg} value={pkg} />
                    ))}
                  </datalist>
                </div>

                {/* Packaging */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Packaging
                  </label>
                  <input
                    type="text"
                    list="packaging-list"
                    value={component.packaging}
                    onChange={(e) => setComponent({ ...component, packaging: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                    placeholder="e.g., DIP"
                  />
                  <datalist id="packaging-list">
                    {suggestions.packaging.map((packaging) => (
                      <option key={packaging} value={packaging} />
                    ))}
                  </datalist>
                </div>

                {/* Stock */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={component.stock}
                    onChange={(e) => setComponent({ ...component, stock: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Min Stock
                  </label>
                  <input
                    type="number"
                    value={component.minStock}
                    onChange={(e) => setComponent({ ...component, minStock: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className={`block ${colors.textLabel} text-sm mb-2`}>
                    Location
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowShelfPicker(true)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input} flex items-center justify-between hover:bg-opacity-50`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {component.location || 'Select location'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block ${colors.textLabel} text-sm mb-2`}>
                  Description
                </label>
                <textarea
                  value={component.description}
                  onChange={(e) => setComponent({ ...component, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                  rows={3}
                  placeholder="Brief description of the component"
                />
              </div>

              {/* Datasheet URL */}
              <div>
                <label className={`block ${colors.textLabel} text-sm mb-2`}>
                  Datasheet URL
                </label>
                <input
                  type="url"
                  value={component.datasheetUrl}
                  onChange={(e) => setComponent({ ...component, datasheetUrl: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                  placeholder="https://example.com/datasheet.pdf"
                />
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`${colors.textLabel} text-sm`}>
                    Specifications
                  </label>
                  <button
                    onClick={handleAddSpec}
                    className={`px-3 py-1 text-white rounded-lg text-sm flex items-center gap-1 ${colors.button}`}
                  >
                    <Plus className="w-3 h-3" />
                    Add Spec
                  </button>
                </div>
                {component.specs.length > 0 ? (
                  <div className="space-y-2">
                    {component.specs.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={spec.name}
                          onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                          placeholder="Name"
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                          placeholder="Value"
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                        />
                        <button
                          onClick={() => handleRemoveSpec(index)}
                          className={`p-2 border rounded-lg ${colors.buttonSecondary}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${colors.textSecondary} text-sm text-center py-4`}>
                    No specifications added yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'manual' && (
          <div className={`p-4 border-t ${colors.border} flex justify-end gap-2`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 text-white rounded-lg ${colors.button}`}
            >
              Add Component
            </button>
          </div>
        )}
      </div>

      {/* Shelf Picker Modal */}
      {showShelfPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
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
                      const cellLocation = `Shelf ${String.fromCharCode(65 + colIndex)}${14 - rowIndex}`;
                      const isSelected = component.location === cellLocation;
                      
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleLocationSelect(rowIndex, colIndex)}
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
                          <div className={`absolute top-1 left-1 text-xs ${isSelected ? 'text-white opacity-70' : colors.textLabel}`}>
                            {String.fromCharCode(65 + colIndex)}{rowIndex + 1}
                          </div>

                          {/* Cell Content */}
                          <div className="flex flex-col items-center justify-center h-full pt-3">
                            <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : colors.textSecondary}`} />
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
