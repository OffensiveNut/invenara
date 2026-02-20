import { supabase } from '../lib/supabase';
import type { BOMItem, PickingHistory } from '../types';

// Get next project number
export async function getNextProjectNumber(): Promise<number> {
  const { data, error } = await supabase.rpc('get_next_project_number');

  if (error) throw error;
  return data;
}

// Create a new picking list
export async function createPickingList(projectName: string): Promise<string> {
  const projectNumber = await getNextProjectNumber();

  const { data, error } = await supabase
    .from('picking_lists')
    .insert({
      project_name: projectName,
      project_number: projectNumber,
      status: 'active',
    } as any)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create picking list');
  
  const listData: any = data;
  return listData.id;
}

// Add item to picking list
export async function addPickingListItem(
  pickingListId: string,
  componentId: string,
  partNumber: string,
  manufacturer: string,
  requiredQuantity: number,
  availableQuantity: number,
  location: string
): Promise<void> {
  const { error } = await supabase
    .from('picking_list_items')
    .insert({
      picking_list_id: pickingListId,
      component_id: componentId,
      part_number: partNumber,
      manufacturer,
      required_quantity: requiredQuantity,
      available_quantity: availableQuantity,
      location,
      status: 'pending',
    } as any);

  if (error) throw error;
}

// Update picking list item quantity
export async function updatePickingListItemQuantity(
  itemId: string,
  requiredQuantity: number
): Promise<void> {
  // @ts-ignore - Supabase type inference issue
  const { error } = await (supabase as any)
    .from('picking_list_items')
    .update({ required_quantity: requiredQuantity })
    .eq('id', itemId);

  if (error) throw error;
}

// Remove item from picking list
export async function removePickingListItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('picking_list_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// Get active picking list
export async function getActivePickingList(): Promise<{
  id: string;
  projectName: string;
  projectNumber: number;
  items: BOMItem[];
} | null> {
  const { data, error } = await supabase
    .from('picking_lists')
    .select(`
      id,
      project_name,
      project_number,
      picking_list_items (
        id,
        part_number,
        manufacturer,
        required_quantity,
        available_quantity,
        location
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No active picking list
    throw error;
  }

  const listData: any = data;

  return {
    id: listData.id,
    projectName: listData.project_name,
    projectNumber: listData.project_number,
    items: listData.picking_list_items.map((item: any) => ({
      id: item.id,
      partNumber: item.part_number,
      manufacturer: item.manufacturer,
      required: item.required_quantity,
      available: item.available_quantity,
      location: item.location,
    })),
  };
}

// Confirm pickup and reduce stock
export async function confirmPickup(pickingListId: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_component_pickup', {
    p_picking_list_id: pickingListId,
  } as any);

  if (error) throw error;
}

// Get picking history
export async function getPickingHistory(): Promise<PickingHistory[]> {
  const { data, error } = await supabase
    .from('picking_lists')
    .select(`
      id,
      project_name,
      completed_at,
      total_items,
      picking_list_items (
        id,
        part_number,
        manufacturer,
        required_quantity,
        available_quantity,
        location
      )
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) throw error;

  return data.map((list: any) => ({
    id: list.id,
    projectName: list.project_name,
    completedAt: list.completed_at,
    totalItems: list.total_items || 0,
    items: list.picking_list_items.map((item: any) => ({
      id: item.id,
      partNumber: item.part_number,
      manufacturer: item.manufacturer,
      required: item.required_quantity,
      available: item.available_quantity,
      location: item.location,
    })),
  }));
}

// Load picking list from history
export async function loadPickingListFromHistory(historyId: string): Promise<{
  projectName: string;
  items: BOMItem[];
}> {
  const { data, error } = await supabase
    .from('picking_lists')
    .select(`
      project_name,
      picking_list_items (
        part_number,
        manufacturer,
        required_quantity,
        location,
        component_id
      )
    `)
    .eq('id', historyId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Picking list not found');

  const historyData: any = data;

  // Get current stock for each component
  const componentIds = historyData.picking_list_items.map((item: any) => item.component_id);
  const { data: components, error: componentsError } = await supabase
    .from('components')
    .select('id, stock')
    .in('id', componentIds);

  if (componentsError) throw componentsError;
  if (!components) throw new Error('Components not found');

  const comps: any[] = components;
  const stockMap = new Map(comps.map((c) => [c.id, c.stock]));

  return {
    projectName: `${historyData.project_name} (Copy)`,
    items: historyData.picking_list_items.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      partNumber: item.part_number,
      manufacturer: item.manufacturer,
      required: item.required_quantity,
      available: stockMap.get(item.component_id) || 0,
      location: item.location,
    })),
  };
}
