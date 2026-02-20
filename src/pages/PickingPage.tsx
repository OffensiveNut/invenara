import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, AlertCircle, CheckCircle, Package, Search, Upload, X, History, Check } from 'lucide-react';
import { getComponents } from '@/services/components';
import { 
  getActivePickingList, 
  createPickingList, 
  addPickingListItem,
  updatePickingListItemQuantity,
  removePickingListItem,
  confirmPickup,
  getPickingHistory,
  getNextProjectNumber
} from '@/services/picking';
import type { Component } from '@/types';

interface BOMItem {
  id: string;
  partNumber: string;
  manufacturer: string;
  required: number;
  available: number;
  location: string;
}

interface PickingHistory {
  id: string;
  projectName: string;
  items: BOMItem[];
  completedAt: string;
  totalItems: number;
}

interface BOMViewProps {
  theme: string;
}

export function PickingPage({ theme }: BOMViewProps) {
  const [availableComponents, setAvailableComponents] = useState<Component[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [pickingHistory, setPickingHistory] = useState<PickingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPickingListId, setCurrentPickingListId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<PickingHistory | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [components, activeList, history, nextNum] = await Promise.all([
        getComponents(),
        getActivePickingList(),
        getPickingHistory(),
        getNextProjectNumber()
      ]);

      setAvailableComponents(components);
      setPickingHistory(history);

      if (activeList) {
        setCurrentPickingListId(activeList.id);
        setProjectName(activeList.projectName);
        setBomItems(activeList.items);
      } else {
        setProjectName(`Take Out ${String(nextNum).padStart(3, '0')}`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getColors = () => {
    if (theme === 'light') {
      return {
        card: 'bg-white',
        cardDark: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textTertiary: 'text-gray-600',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'border-gray-300 hover:bg-gray-50 text-gray-700',
        input: 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900',
        success: 'text-green-600 bg-green-50',
        warning: 'text-yellow-600 bg-yellow-50',
        danger: 'text-red-600 bg-red-50',
        tableHeader: 'bg-gray-50',
        tableRow: 'hover:bg-gray-50',
      };
    }
    if (theme === 'dark') {
      return {
        card: 'bg-[#262626]',
        cardDark: 'bg-[#1a1a1a]',
        border: 'border-[#404040]',
        text: 'text-[#e5e5e5]',
        textSecondary: 'text-gray-500',
        textTertiary: 'text-gray-400',
        accent: 'text-[#dc2626]',
        button: 'bg-[#dc2626] hover:bg-[#b91c1c]',
        buttonSecondary: 'border-[#404040] hover:bg-[#404040] text-gray-400',
        input: 'bg-[#1a1a1a] border-[#404040] focus:ring-[#dc2626] text-[#e5e5e5]',
        success: 'text-green-400 bg-green-950',
        warning: 'text-yellow-400 bg-yellow-950',
        danger: 'text-red-400 bg-red-950',
        tableHeader: 'bg-[#1a1a1a]',
        tableRow: 'hover:bg-[#2a2a2a]',
      };
    }
    return {
      card: 'bg-[#27272a]',
      cardDark: 'bg-[#18181b]',
      border: 'border-[#3f3f46]',
      text: 'text-[#e4e4e7]',
      textSecondary: 'text-gray-500',
      textTertiary: 'text-gray-400',
      accent: 'text-[#f59e0b]',
      button: 'bg-[#f59e0b] hover:bg-[#d97706]',
      buttonSecondary: 'border-[#3f3f46] hover:bg-[#3f3f46] text-gray-400',
      input: 'bg-[#18181b] border-[#3f3f46] focus:ring-[#f59e0b] text-[#e4e4e7]',
      success: 'text-green-400 bg-green-950',
      warning: 'text-yellow-400 bg-yellow-950',
      danger: 'text-red-400 bg-red-950',
      tableHeader: 'bg-[#18181b]',
      tableRow: 'hover:bg-[#2a2a2e]',
    };
  };

  const colors = getColors();

  const handleAddItem = async () => {
    if (!searchTerm || quantity <= 0) return;

    const component = filteredComponents.find(c => c.partNumber === searchTerm);
    if (!component) return;

    try {
      // Create picking list if it doesn't exist
      let listId = currentPickingListId;
      if (!listId) {
        listId = await createPickingList(projectName);
        setCurrentPickingListId(listId);
      }

      // Add item to picking list
      await addPickingListItem(
        listId,
        component.id,
        component.partNumber,
        component.manufacturer,
        quantity,
        component.stock,
        component.location
      );

      const newItem: BOMItem = {
        id: Date.now().toString(),
        partNumber: component.partNumber,
        manufacturer: component.manufacturer,
        required: quantity,
        available: component.stock,
        location: component.location,
      };

      setBomItems([...bomItems, newItem]);
      setSearchTerm('');
      setQuantity(1);
      setIsAddingItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removePickingListItem(id);
      setBomItems(bomItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      await updatePickingListItemQuantity(id, Math.max(0, newQuantity));
      setBomItems(bomItems.map(item =>
        item.id === id ? { ...item, required: Math.max(0, newQuantity) } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const getStatus = (required: number, available: number) => {
    if (available >= required) {
      return { label: 'Available', color: colors.success, icon: CheckCircle };
    }
    return { label: 'Insufficient', color: colors.danger, icon: AlertCircle };
  };

  const calculateTotals = () => {
    const totalItems = bomItems.length;
    const availableCount = bomItems.filter(item => item.available >= item.required).length;
    const shortageCount = bomItems.filter(item => item.available < item.required).length;
    
    return { totalItems, availableCount, shortageCount };
  };

  const totals = calculateTotals();

  const exportBOM = () => {
    // Create CSV content
    const headers = ['Part Number', 'Manufacturer', 'Required', 'Available', 'Location', 'Status'];
    const rows = bomItems.map(item => [
      item.partNumber,
      item.manufacturer,
      item.required,
      item.available,
      item.location,
      item.available >= item.required ? 'Available' : 'Insufficient'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_BOM.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importBOM = () => {
    const lines = importText.trim().split('\n');
    const headers = lines[0].split(',');

    const newItems: BOMItem[] = lines.slice(1).map(line => {
      const values = line.split(',');
      const partNumber = values[headers.indexOf('Part Number')];
      // const manufacturer = values[headers.indexOf('Manufacturer')];
      const required = parseInt(values[headers.indexOf('Required')], 10);
      // const available = parseInt(values[headers.indexOf('Available')], 10);
      // const location = values[headers.indexOf('Location')];

      const component = availableComponents.find(c => c.partNumber === partNumber);
      if (!component) return null;

      return {
        id: Date.now().toString(),
        partNumber: component.partNumber,
        manufacturer: component.manufacturer,
        required: required || 0,
        available: component.stock,
        location: component.location,
      };
    }).filter((item): item is BOMItem => item !== null);

    setBomItems(newItems);
    setShowImportModal(false);
    setImportText('');
  };

  const filteredComponents = availableComponents.filter(comp =>
    comp.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmPickup = async () => {
    if (!currentPickingListId) return;

    try {await confirmPickup(currentPickingListId);
      
      // Reload data
      await loadData();
      
      setBomItems([]);
      setCurrentPickingListId(null);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error confirming pickup:', error);
      alert('Failed to confirm pickup. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-8`}>
        <div className="flex items-center justify-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.accent}`}></div>
          <span className={`ml-3 ${colors.text}`}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`${colors.text} bg-transparent border-none focus:outline-none text-2xl`}
              placeholder="Project Name"
            />
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Bill of Materials - Plan your component requirements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${colors.buttonSecondary}`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={exportBOM}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${colors.buttonSecondary}`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setIsAddingItem(true)}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Component</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className={`${colors.cardDark} rounded-lg p-4 border ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.success}`}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className={`${colors.textSecondary} text-sm`}>Total Items</p>
                <p className={`${colors.text} text-xl`}>{totals.totalItems}</p>
              </div>
            </div>
          </div>

          <div className={`${colors.cardDark} rounded-lg p-4 border ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.success}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className={`${colors.textSecondary} text-sm`}>Available</p>
                <p className={`${colors.text} text-xl`}>{totals.availableCount}</p>
              </div>
            </div>
          </div>

          <div className={`${colors.cardDark} rounded-lg p-4 border ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.danger}`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className={`${colors.textSecondary} text-sm`}>Shortages</p>
                <p className={`${colors.text} text-xl`}>{totals.shortageCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {isAddingItem && (
        <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-4 sm:p-6`}>
          <h3 className={`${colors.text} mb-4`}>Add Component to Picking List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={`block ${colors.textTertiary} text-sm mb-2`}>
                Search Component
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.textSecondary} w-4 h-4`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type part number or manufacturer..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchTerm && filteredComponents.length > 0 && (
                <div className={`mt-2 ${colors.card} border ${colors.border} rounded-lg max-h-48 overflow-y-auto`}>
                  {filteredComponents.slice(0, 5).map((comp) => (
                    <button
                      key={comp.partNumber}
                      onClick={() => setSearchTerm(comp.partNumber)}
                      className={`w-full px-4 py-2 text-left ${colors.tableRow} border-b ${colors.border} last:border-b-0`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={colors.accent}>{comp.partNumber}</p>
                          <p className={`${colors.textSecondary} text-sm`}>{comp.manufacturer}</p>
                        </div>
                        <span className={`${colors.textTertiary} text-sm`}>Stock: {comp.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={`block ${colors.textTertiary} text-sm mb-2`}>
                Quantity to Take
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input}`}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddItem}
              disabled={!searchTerm || quantity <= 0}
              className={`px-4 py-2 text-white rounded-lg ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Add to List
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setSearchTerm('');
                setQuantity(1);
              }}
              className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className={`${colors.card} rounded-lg shadow-xl max-w-2xl w-full`}>
            <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
              <div>
                <h3 className={colors.text}>Import BOM from KiCad</h3>
                <p className={`${colors.textSecondary} text-sm mt-1`}>
                  Paste CSV from KiCad BOM or any compatible format
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className={`mb-4 p-3 rounded-lg ${colors.cardDark} border ${colors.border}`}>
                <p className={`${colors.textTertiary} text-sm mb-2`}>Expected format:</p>
                <code className={`${colors.textSecondary} text-xs block`}>
                  Ref,Qnty,Value,Cmp name,Footprint,Description,Vendor<br/>
                  R1,1,10k,Resistor,0805,Carbon Film,Yageo
                </code>
              </div>
              
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className={`w-full h-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${colors.input} font-mono text-sm`}
                placeholder="Paste your BOM CSV here..."
              />
            </div>
            
            <div className={`p-4 border-t ${colors.border} flex justify-end gap-2`}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={importBOM}
                disabled={!importText.trim()}
                className={`px-4 py-2 text-white rounded-lg ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Import BOM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Pickup Button */}
      {bomItems.length > 0 && (
        <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={colors.text}>Ready to pick these components?</p>
              <p className={`${colors.textSecondary} text-sm mt-1`}>
                This will save the list to history and reduce stock levels
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
            >
              <Check className="w-5 h-5" />
              Confirm Pickup
            </button>
          </div>
        </div>
      )}

      {/* Confirm Pickup Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className={`${colors.card} rounded-lg shadow-xl max-w-md w-full`}>
            <div className={`p-6 border-b ${colors.border}`}>
              <h3 className={colors.text}>Confirm Component Pickup</h3>
              <p className={`${colors.textSecondary} text-sm mt-2`}>
                Are you sure you want to confirm picking these components? This will:
              </p>
              <ul className={`${colors.textTertiary} text-sm mt-2 space-y-1 list-disc list-inside`}>
                <li>Save this picking list to history</li>
                <li>Reduce stock levels for all items</li>
                <li>Clear the current list</li>
              </ul>
            </div>
            
            <div className="p-6">
              <div className={`${colors.cardDark} rounded-lg p-4 border ${colors.border}`}>
                <p className={`${colors.textTertiary} text-sm mb-2`}>Summary:</p>
                <p className={colors.text}><span className={colors.textSecondary}>Project:</span> {projectName}</p>
                <p className={colors.text}><span className={colors.textSecondary}>Items:</span> {bomItems.length}</p>
                <p className={colors.text}><span className={colors.textSecondary}>Total Quantity:</span> {bomItems.reduce((sum, item) => sum + item.required, 0)}</p>
              </div>
            </div>
            
            <div className={`p-4 border-t ${colors.border} flex justify-end gap-2`}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 border rounded-lg ${colors.buttonSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPickup}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${colors.button}`}
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className={`${colors.card} rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col`}>
            <div className={`p-6 border-b ${colors.border} flex items-center justify-between`}>
              <div>
                <h3 className={colors.text}>Picking History</h3>
                <p className={`${colors.textSecondary} text-sm mt-1`}>
                  View past component pickups
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedHistory(null);
                }}
                className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {pickingHistory.length === 0 ? (
                <div className={`text-center py-12 ${colors.textSecondary}`}>
                  No picking history yet
                </div>
              ) : selectedHistory ? (
                <div>
                  <button
                    onClick={() => setSelectedHistory(null)}
                    className={`mb-4 px-3 py-1 border rounded-lg ${colors.buttonSecondary} text-sm`}
                  >
                    ← Back to List
                  </button>
                  <div className={`${colors.cardDark} rounded-lg p-4 border ${colors.border} mb-4`}>
                    <h4 className={colors.text}>{selectedHistory.projectName}</h4>
                    <p className={`${colors.textSecondary} text-sm`}>{formatDate(selectedHistory.completedAt)}</p>
                  </div>
                  
                  <div className={`${colors.card} rounded-lg border ${colors.border}`}>
                    <table className="w-full">
                      <thead className={`${colors.tableHeader} border-b ${colors.border}`}>
                        <tr>
                          <th className={`px-4 py-3 text-left ${colors.textTertiary} text-sm`}>Part Number</th>
                          <th className={`px-4 py-3 text-left ${colors.textTertiary} text-sm`}>Manufacturer</th>
                          <th className={`px-4 py-3 text-left ${colors.textTertiary} text-sm`}>Quantity</th>
                          <th className={`px-4 py-3 text-left ${colors.textTertiary} text-sm`}>Location</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${colors.border}`}>
                        {selectedHistory.items.map((item) => (
                          <tr key={item.id}>
                            <td className={`px-4 py-3 ${colors.accent}`}>{item.partNumber}</td>
                            <td className={`px-4 py-3 ${colors.text}`}>{item.manufacturer}</td>
                            <td className={`px-4 py-3 ${colors.text}`}>{item.required}</td>
                            <td className={`px-4 py-3 ${colors.textTertiary}`}>{item.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pickingHistory.map((history) => (
                    <button
                      key={history.id}
                      onClick={() => setSelectedHistory(history)}
                      className={`w-full ${colors.cardDark} rounded-lg p-4 border ${colors.border} text-left ${colors.tableRow}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={colors.text}>{history.projectName}</p>
                          <p className={`${colors.textSecondary} text-sm mt-1`}>
                            {formatDate(history.completedAt)}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm ${colors.success}`}>
                          {history.totalItems} items
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOM Table */}
      <div className={`${colors.card} rounded-lg shadow-sm border ${colors.border}`}>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className={`${colors.tableHeader} border-b ${colors.border}`}>
              <tr>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Part Number</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Manufacturer</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Location</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Required</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Available</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Status</th>
                <th className={`px-6 py-3 text-left ${colors.textTertiary}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${colors.border}`}>
              {bomItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${colors.textSecondary}`}>
                    No components in BOM yet. Click "Add Component" to get started.
                  </td>
                </tr>
              ) : (
                bomItems.map((item) => {
                  const status = getStatus(item.required, item.available);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className={`transition-colors ${colors.tableRow}`}>
                      <td className="px-6 py-4">
                        <span className={colors.accent}>{item.partNumber}</span>
                      </td>
                      <td className={`px-6 py-4 ${colors.text}`}>{item.manufacturer}</td>
                      <td className={`px-6 py-4 ${colors.textTertiary}`}>{item.location}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          value={item.required}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${colors.input}`}
                        />
                      </td>
                      <td className={`px-6 py-4 ${colors.text}`}>{item.available}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className={`lg:hidden divide-y ${colors.border}`}>
          {bomItems.length === 0 ? (
            <div className={`p-12 text-center ${colors.textSecondary}`}>
              No components in BOM yet. Click "Add Component" to get started.
            </div>
          ) : (
            bomItems.map((item) => {
              const status = getStatus(item.required, item.available);
              const StatusIcon = status.icon;
              
              return (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={colors.accent}>{item.partNumber}</p>
                      <p className={`${colors.textTertiary} text-sm mt-1`}>{item.manufacturer}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={`p-2 rounded-lg ${colors.buttonSecondary} border`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className={`${colors.textSecondary} text-sm`}>Location</p>
                      <p className={`${colors.text} text-sm`}>{item.location}</p>
                    </div>
                    <div>
                      <p className={`${colors.textSecondary} text-sm`}>Available</p>
                      <p className={`${colors.text} text-sm`}>{item.available}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${colors.textSecondary} text-sm`}>Required:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.required}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className={`w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 ${colors.input}`}
                      />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}