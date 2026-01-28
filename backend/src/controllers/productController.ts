import { Request, Response } from 'express';
import { Product } from '../types';

// Mock data - replace with database in production
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 29.99,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'general',
    stock: 100,
  },
];

export const getAllProducts = (req: Request, res: Response) => {
  res.json(mockProducts);
};

export const getProductById = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
};
