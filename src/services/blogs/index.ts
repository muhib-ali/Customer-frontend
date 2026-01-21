import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_CUSTOMER_API_URL || 'http://localhost:3002';

export interface BlogItem {
  id: string;
  heading: string;
  paragraph: string;
  blog_img?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogsResponse {
  success: boolean;
  message: string;
  data: {
    blogs: BlogItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BlogResponse {
  success: boolean;
  message: string;
  data: BlogItem;
}

export interface BlogQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'heading';
  order?: 'ASC' | 'DESC';
}

// Get all blogs
export async function getAllBlogs(params?: BlogQueryParams): Promise<BlogsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.order) queryParams.append('order', params.order);

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/blogs?${queryParams.toString()}`
      : `${API_BASE_URL}/blogs`;

    const response = await axios.get<BlogsResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

// Get blog by ID
export async function getBlogById(id: string): Promise<BlogResponse> {
  try {
    const response = await axios.get<BlogResponse>(`${API_BASE_URL}/blogs/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    throw error;
  }
}