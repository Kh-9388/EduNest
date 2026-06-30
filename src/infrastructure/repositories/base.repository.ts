import { supabase } from '@/infrastructure/supabase/client';
import type { QueryFilters, PaginatedResponse } from '@/domain/types';
import { DEFAULT_PAGE_SIZE } from '@/domain/constants';

export class BaseRepository<T> {
  constructor(protected tableName: string) {}

  async findAll(filters?: QueryFilters): Promise<PaginatedResponse<T>> {
    const page = filters?.page || 1;
    const pageSize = Math.min(filters?.pageSize || DEFAULT_PAGE_SIZE, 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.sortBy) {
      const order = filters.sortOrder || 'asc';
      query = query.order(filters.sortBy, { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !['page', 'pageSize', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query.range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: (data || []) as T[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async softDelete(id: string, statusField = 'status', deletedStatus = 'inactive'): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ [statusField]: deletedStatus } as never)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
