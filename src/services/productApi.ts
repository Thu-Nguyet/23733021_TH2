import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';
import { PRICE_MULTIPLIER, STALE_TIME_MS } from '@constants/student';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<any[]>('/products?limit=12');
  return response.data.map((item) => ({
    id: item.id,
    title: item.title,
    price: Math.round(item.price * PRICE_MULTIPLIER),
    description: item.description,
    category: item.category,
    image: item.image,
    rating: item.rating,
  }));
};

export const fetchProductById = async (id: string | number): Promise<Product> => {
  const response = await apiClient.get<any>(`/products/${id}`);
  const item = response.data;
  return {
    id: item.id,
    title: item.title,
    price: Math.round(item.price * PRICE_MULTIPLIER),
    description: item.description,
    category: item.category,
    image: item.image,
    rating: item.rating,
  };
};

export const useProductsQuery = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: STALE_TIME_MS,
  });
};
