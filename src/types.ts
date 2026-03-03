// Common types used across the CLI

export interface Token {
  id: number;
  name: string;
  symbol: string;
  status: string;
  price?: string | number;
  chain_id: number;
  [key: string]: any;
}

export interface Offer {
  id: number;
  token_id: number;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  status: string;
  address: string;
  [key: string]: any;
}

export interface Order {
  id: number;
  offer_id: number;
  buyer_address: string;
  seller_address: string;
  amount: string;
  status: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data?: T;
  statusCode?: number;
  message?: string;
  error?: string;
}

export type OutputFormat = 'table' | 'json' | 'plain';
