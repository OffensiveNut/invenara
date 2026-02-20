import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { InventoryPage } from '@/pages/InventoryPage';
import { PickingPage } from '@/pages/PickingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ComponentDetailPage } from '@/pages/ComponentDetailPage';
import { AddComponent } from '@/components/AddComponent';
import { createComponent, updateComponent, getComponentByPartNumber, updateComponentStock } from '@/services/components';
import type { Component } from '@/types';

export default function App() {
  const [currentView, setCurrentView] = useState<'inventory' | 'bom' | 'settings'>('inventory');
  const [theme, setTheme] = useState<'light' | 'dark' | 'bomist'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [inventoryKey, setInventoryKey] = useState(0);

  const handleAddComponent = async (component: Omit<Component, 'id'>) => {
    try {
      // Check if component already exists
      const existingComponent = await getComponentByPartNumber(component.partNumber);
      
      if (existingComponent) {
        // Component exists, prompt user
        const shouldIncreaseStock = window.confirm(
          `Component "${component.partNumber}" already exists with stock of ${existingComponent.stock}.\n\n` +
          `Do you want to increase the stock by ${component.stock}?\n\n` +
          `New stock will be: ${existingComponent.stock + component.stock}`
        );
        
        if (shouldIncreaseStock) {
          // Update stock
          const newStock = existingComponent.stock + component.stock;
          await updateComponentStock(existingComponent.id, newStock, 'add', `Added ${component.stock} units via QR scan`);
          setShowAddComponent(false);
          setInventoryKey(prev => prev + 1);
          alert(`Stock updated successfully! New stock: ${newStock}`);
        } else {
          // User cancelled, keep the modal open
          return;
        }
      } else {
        // Component doesn't exist, create new
        await createComponent(component);
        setShowAddComponent(false);
        setInventoryKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding component:', error);
      alert('Failed to add component. Please try again.');
    }
  };

  const handleSaveComponent = async (component: Component) => {
    try {
      const updated = await updateComponent(component.id, component);
      setSelectedComponent(updated);
    } catch (error) {
      console.error('Error updating component:', error);
      alert('Failed to update component. Please try again.');
    }
  };

  const getBackgroundColor = () => {
    if (theme === 'light') return 'bg-gray-50';
    if (theme === 'dark') return 'bg-[#1a1a1a]';
    return 'bg-[#18181b]';
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)}
        theme={theme}
      />
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as 'inventory' | 'bom' | 'settings')}
        theme={theme}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'inventory' && (
          selectedComponent ? (
            <ComponentDetailPage
              component={selectedComponent}
              onBack={() => {
                setSelectedComponent(null);
                setInventoryKey(prev => prev + 1); // Refresh inventory
              }}
              onSave={handleSaveComponent}
              theme={theme}
            />
          ) : (
            <InventoryPage
              key={inventoryKey}
              theme={theme}
              onComponentClick={(comp) => setSelectedComponent(comp)}
              onAddComponent={() => setShowAddComponent(true)}
            />
          )
        )}
        {currentView === 'bom' && <PickingPage theme={theme} />}
        {currentView === 'settings' && (
          <SettingsPage
            currentTheme={theme}
            onThemeChange={(newTheme) => setTheme(newTheme as 'light' | 'dark' | 'bomist')}
          />
        )}
      </main>

      {/* Add Component Modal */}
      {showAddComponent && (
        <AddComponent
          theme={theme}
          onClose={() => setShowAddComponent(false)}
          onAdd={handleAddComponent}
        />
      )}
    </div>
  );
}

