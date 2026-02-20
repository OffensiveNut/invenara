import { supabase } from '../lib/supabase';
import type { Component } from '../types';

// Transform database row to Component type
const transformComponent = (row: any): Component => ({
  id: row.id,
  partNumber: row.part_number,
  manufacturer: row.manufacturer,
  type: row.type,
  package: row.package || '',
  packaging: row.packaging || '',
  stock: row.stock,
  minStock: row.min_stock,
  description: row.description || '',
  datasheetUrl: row.datasheet_url || '',
  location: row.location || '',
  specs: row.component_specifications?.map((spec: any) => ({
    name: spec.spec_name,
    value: spec.spec_value,
  })) || [],
});

// Get all components with their specifications
export async function getComponents(): Promise<Component[]> {
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      component_specifications (
        spec_name,
        spec_value
      )
    `)
    .order('part_number');

  if (error) throw error;
  return data.map(transformComponent);
}

// Get a single component by ID
export async function getComponentById(id: string): Promise<Component> {
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      component_specifications (
        spec_name,
        spec_value
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return transformComponent(data);
}

// Search components
export async function searchComponents(searchTerm: string): Promise<Component[]> {
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      component_specifications (
        spec_name,
        spec_value
      )
    `)
    .or(`part_number.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('part_number');

  if (error) throw error;
  return data.map(transformComponent);
}

// Check if component exists by part number
export async function getComponentByPartNumber(partNumber: string): Promise<Component | null> {
  const { data, error } = await supabase
    .from('components')
    .select(`
      *,
      component_specifications (
        spec_name,
        spec_value
      )
    `)
    .eq('part_number', partNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return transformComponent(data);
}

// Get distinct field values for autocomplete
export async function getDistinctFieldValues(field: 'manufacturer' | 'type' | 'package' | 'packaging'): Promise<string[]> {
  const { data, error } = await supabase
    .from('components')
    .select(field)
    .not(field, 'is', null)
    .not(field, 'eq', '');

  if (error) throw error;
  
  // Extract unique non-empty values and sort
  const uniqueValues = [...new Set(data.map(row => row[field]).filter(Boolean))] as string[];
  return uniqueValues.sort();
}

// Create a new component
export async function createComponent(component: Omit<Component, 'id'>): Promise<Component> {
  // Insert component
  const { data: componentData, error: componentError } = await supabase
    .from('components')
    .insert({
      part_number: component.partNumber,
      manufacturer: component.manufacturer,
      type: component.type,
      description: component.description,
      package: component.package,
      packaging: component.packaging,
      stock: component.stock,
      min_stock: component.minStock,
      location: component.location,
      datasheet_url: component.datasheetUrl,
    } as any)
    .select()
    .single();

  if (componentError) throw componentError;
  if (!componentData) throw new Error('Failed to create component');

  // Cast to any to bypass type inference issues
  const data: any = componentData;

  // Insert specifications
  if (component.specs.length > 0) {
    const specsToInsert = component.specs.map((spec) => ({
      component_id: data.id,
      spec_name: spec.name,
      spec_value: spec.value,
    }));

    const { error: specsError } = await supabase
      .from('component_specifications')
      .insert(specsToInsert as any);

    if (specsError) throw specsError;
  }

  return getComponentById(data.id);
}

// Update a component
export async function updateComponent(id: string, component: Partial<Component>): Promise<Component> {
  // Update component
  const updateData: any = {};
  if (component.partNumber !== undefined) updateData.part_number = component.partNumber;
  if (component.manufacturer !== undefined) updateData.manufacturer = component.manufacturer;
  if (component.type !== undefined) updateData.type = component.type;
  if (component.description !== undefined) updateData.description = component.description;
  if (component.package !== undefined) updateData.package = component.package;
  if (component.packaging !== undefined) updateData.packaging = component.packaging;
  if (component.stock !== undefined) updateData.stock = component.stock;
  if (component.minStock !== undefined) updateData.min_stock = component.minStock;
  if (component.location !== undefined) updateData.location = component.location;
  if (component.datasheetUrl !== undefined) updateData.datasheet_url = component.datasheetUrl;

  // @ts-ignore - Supabase type inference issue
  const { error: componentError } = await (supabase as any)
    .from('components')
    .update(updateData)
    .eq('id', id);

  if (componentError) throw componentError;

  // Update specifications if provided
  if (component.specs !== undefined) {
    // Delete existing specs
    await supabase
      .from('component_specifications')
      .delete()
      .eq('component_id', id);

    // Insert new specs
    if (component.specs.length > 0) {
      const specsToInsert = component.specs.map((spec) => ({
        component_id: id,
        spec_name: spec.name,
        spec_value: spec.value,
      }));

      const { error: specsError } = await supabase
        .from('component_specifications')
        .insert(specsToInsert as any);

      if (specsError) throw specsError;
    }
  }

  return getComponentById(id);
}

// Delete a component
export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Update component stock
export async function updateComponentStock(
  id: string,
  newStock: number,
  transactionType: 'add' | 'remove' | 'adjust' | 'picking' = 'adjust',
  notes?: string,
  pickingListId?: string
): Promise<Component> {
  // Get current component
  const { data: component, error: getError } = await supabase
    .from('components')
    .select('stock')
    .eq('id', id)
    .single();

  if (getError) throw getError;
  if (!component) throw new Error('Component not found');

  const comp: any = component;
  const quantityBefore = comp.stock;
  const quantityChange = newStock - quantityBefore;

  // Update stock
  // @ts-ignore - Supabase type inference issue
  const { error: updateError } = await (supabase as any)
    .from('components')
    .update({ stock: newStock })
    .eq('id', id);

  if (updateError) throw updateError;

  // Record transaction
  const { error: transactionError } = await supabase
    .from('stock_transactions')
    .insert({
      component_id: id,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      quantity_before: quantityBefore,
      quantity_after: newStock,
      picking_list_id: pickingListId,
      notes,
    } as any);

  if (transactionError) throw transactionError;

  return getComponentById(id);
}

// Get low stock components
export async function getLowStockComponents(): Promise<Component[]> {
  const { data, error } = await supabase
    .from('low_stock_components')
    .select('*');

  if (error) throw error;
  if (!data) return [];
  
  // Transform view data to Component format
  return data.map((row: any) => ({
    id: row.id,
    partNumber: row.part_number,
    manufacturer: row.manufacturer,
    type: row.type,
    package: '',
    packaging: '',
    stock: row.stock,
    minStock: row.min_stock,
    description: '',
    datasheetUrl: '',
    location: row.location || '',
    specs: [],
  }));
}
