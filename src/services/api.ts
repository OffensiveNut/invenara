import type { Component, ComponentFormData, BOMItem, PickingHistory } from '@/types';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store (in production, this would be API calls)
let componentsStore: Component[] = [
  {
    id: '1',
    partNumber: 'LM358N',
    manufacturer: 'Texas Instruments',
    type: 'Op-Amp',
    package: 'DIP-8',
    packaging: 'DIP',
    stock: 450,
    minStock: 50,
    description: 'Dual operational amplifier, low power',
    datasheetUrl: 'https://www.ti.com/lit/ds/symlink/lm358-n.pdf',
    location: 'Shelf A1',
    specs: [
      { name: 'Supply Voltage', value: '±2.0V to ±36V' },
      { name: 'Output Voltage Swing', value: '±1.0V to ±35V' },
      { name: 'Slew Rate', value: '0.5V/µs' },
    ],
  },
  {
    id: '2',
    partNumber: 'NE555P',
    manufacturer: 'STMicroelectronics',
    type: 'Timer IC',
    package: 'DIP-8',
    packaging: 'DIP',
    stock: 320,
    minStock: 50,
    description: 'Precision timer IC, 100kHz',
    datasheetUrl: 'https://www.st.com/resource/en/datasheet/ne555.pdf',
    location: 'Shelf A2',
    specs: [
      { name: 'Supply Voltage', value: '4.5V to 16V' },
      { name: 'Output Voltage', value: 'Vcc-1.5V' },
      { name: 'Frequency Range', value: '0.001Hz to 300kHz' },
    ],
  },
  {
    id: '3',
    partNumber: 'ATmega328P',
    manufacturer: 'Microchip',
    type: 'Microcontroller',
    package: 'DIP-28',
    packaging: 'DIP',
    stock: 85,
    minStock: 50,
    description: '8-bit AVR microcontroller, 32KB flash',
    datasheetUrl: 'https://ww1.microchip.com/downloads/en/DeviceDoc/ATmega328P-DS-DS40002061B.pdf',
    location: 'Shelf B1',
    specs: [
      { name: 'Clock Speed', value: '16MHz' },
      { name: 'Flash Memory', value: '32KB' },
      { name: 'SRAM', value: '2KB' },
    ],
  },
  {
    id: '4',
    partNumber: '1N4148',
    manufacturer: 'ON Semiconductor',
    type: 'Diode',
    package: 'DO-35',
    packaging: 'DO',
    stock: 1200,
    minStock: 50,
    description: 'Fast switching diode, 100V 200mA',
    datasheetUrl: 'https://www.onsemi.com/pdf/datasheet/1n4148-d.pdf',
    location: 'Shelf C1',
    specs: [
      { name: 'Reverse Voltage', value: '100V' },
      { name: 'Forward Current', value: '200mA' },
      { name: 'Reverse Recovery Time', value: '4ns' },
    ],
  },
  {
    id: '5',
    partNumber: 'BC547',
    manufacturer: 'Fairchild',
    type: 'Transistor',
    package: 'TO-92',
    packaging: 'TO',
    stock: 680,
    minStock: 50,
    description: 'NPN general purpose transistor',
    datasheetUrl: 'https://www.fairchildsemi.com/datasheets/BC/BC547.pdf',
    location: 'Shelf C2',
    specs: [
      { name: 'Collector-Emitter Voltage', value: '45V' },
      { name: 'Collector Current', value: '100mA' },
      { name: 'hFE', value: '110-800' },
    ],
  },
];

let pickingHistoryStore: PickingHistory[] = [
  {
    id: '1',
    projectName: 'Arduino Weather Station',
    items: [
      { id: '1', partNumber: 'LM358N', manufacturer: 'TI', required: 5, available: 450, location: 'A1' },
      { id: '2', partNumber: 'NE555P', manufacturer: 'ST', required: 3, available: 320, location: 'A2' },
    ],
    completedAt: '2024-12-28T10:30:00',
    totalItems: 2,
  },
];

export const componentsApi = {
  async getAll(): Promise<Component[]> {
    await delay(300);
    return [...componentsStore];
  },

  async getById(id: string): Promise<Component | null> {
    await delay(200);
    return componentsStore.find(c => c.id === id) || null;
  },

  async create(data: ComponentFormData): Promise<Component> {
    await delay(400);
    const newComponent: Component = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    componentsStore.push(newComponent);
    return newComponent;
  },

  async update(id: string, data: Partial<ComponentFormData>): Promise<Component> {
    await delay(400);
    const index = componentsStore.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Component not found');
    
    componentsStore[index] = { ...componentsStore[index], ...data };
    return componentsStore[index];
  },

  async delete(id: string): Promise<void> {
    await delay(300);
    componentsStore = componentsStore.filter(c => c.id !== id);
  },

  async search(query: string): Promise<Component[]> {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return componentsStore.filter(c =>
      c.partNumber.toLowerCase().includes(lowerQuery) ||
      c.manufacturer.toLowerCase().includes(lowerQuery) ||
      c.type.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
    );
  },
};

export const pickingApi = {
  async getHistory(): Promise<PickingHistory[]> {
    await delay(300);
    return [...pickingHistoryStore];
  },

  async create(projectName: string, items: BOMItem[]): Promise<PickingHistory> {
    await delay(400);
    const newHistory: PickingHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectName,
      items,
      completedAt: new Date().toISOString(),
      totalItems: items.length,
    };
    pickingHistoryStore.push(newHistory);
    
    // Update component stock
    items.forEach(item => {
      const component = componentsStore.find(c => c.partNumber === item.partNumber);
      if (component) {
        component.stock = Math.max(0, component.stock - item.required);
      }
    });
    
    return newHistory;
  },
};
