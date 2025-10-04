import { supabase } from '../lib/supabase';

export interface AvailableReceptionItem {
  id: string;
  item_description: string;
  work_group: string;
  price: number;
  quantity: number;
  transaction_type: string;
  motor_service_description: string;
  motor_inventory_number: string;
  subdivision_name: string | null;
  reception_number: string;
  reception_date: string;
  position_number: number;
}

export interface CreateUpdParams {
  counterpartyId: string;
  subdivisionId?: string;
  documentNumber: string;
  documentDate: string;
  itemIds: string[];
}

export async function getAvailableReceptionItems(
  counterpartyId: string,
  subdivisionId?: string
): Promise<AvailableReceptionItem[]> {
  let query = supabase
    .from('reception_items')
    .select(`
      id,
      item_description,
      work_group,
      price,
      quantity,
      transaction_type,
      accepted_motors!inner (
        position_in_reception,
        motor_service_description,
        motor_inventory_number,
        subdivision_id,
        subdivisions (
          name
        ),
        receptions!inner (
          id,
          reception_number,
          reception_date,
          counterparty_id
        )
      )
    `)
    .is('upd_document_id', null)
    .eq('accepted_motors.receptions.counterparty_id', counterpartyId);

  if (subdivisionId) {
    query = query.eq('accepted_motors.subdivision_id', subdivisionId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    item_description: item.item_description,
    work_group: item.work_group,
    price: item.price,
    quantity: item.quantity,
    transaction_type: item.transaction_type,
    motor_service_description: item.accepted_motors.motor_service_description,
    motor_inventory_number: item.accepted_motors.motor_inventory_number,
    subdivision_name: item.accepted_motors.subdivisions?.name || null,
    reception_number: item.accepted_motors.receptions.reception_number,
    reception_date: item.accepted_motors.receptions.reception_date,
    position_number: item.accepted_motors.position_in_reception,
  }));
}

export async function createUpdAndLinkItems(
  params: CreateUpdParams
): Promise<string> {
  const { data, error } = await supabase.rpc('create_upd_and_link_items', {
    p_counterparty_id: params.counterpartyId,
    p_subdivision_id: params.subdivisionId || null,
    p_document_number: params.documentNumber,
    p_document_date: params.documentDate,
    p_item_ids: params.itemIds,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCounterparties() {
  const { data, error } = await supabase
    .from('counterparties')
    .select('id, name, inn')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getSubdivisions() {
  const { data, error } = await supabase
    .from('subdivisions')
    .select('id, name, code')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}
