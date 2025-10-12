const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Product {
  prd_id: number
  code: string
  name: string
  price: number
}

export interface PurchaseItem {
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Purchase {
  trd_id?: number
  datetime?: string
  emp_cd?: string
  store_cd?: string
  pos_no?: string
  total_amt: number
  details?: PurchaseItem[]
}

export const api = {
  async getProductByCode(productCode: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${productCode}`)
    if (!response.ok) {
      throw new Error('Product not found')
    }
    return response.json()
  },

  async createPurchase(purchase: { items: PurchaseItem[] }): Promise<Purchase> {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    })
    if (!response.ok) {
      throw new Error('Failed to create purchase')
    }
    return response.json()
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  }
}