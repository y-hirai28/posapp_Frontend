const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Product {
  prd_id: number
  code: string
  name: string
  price: number
}

export interface PurchaseItem {
  product_id: number      // 商品一意キー
  product_code: string    // 商品コード
  product_name: string    // 商品名称
  unit_price: number      // 商品単価
}

export interface PurchaseRequest {
  items: PurchaseItem[]
  emp_cd?: string         // レジ担当者コード
  store_cd?: string       // 店舗コード
  pos_no?: string         // POS機ID
}

export interface PurchaseResponse {
  success: boolean        // 成否
  trd_id: number         // 取引一意キー
  total_amt: number      // 合計金額（税込）
  total_amt_ex_tax: number  // 合計金額（税抜）
}

export const api = {
  async getProductByCode(productCode: string): Promise<Product | null> {
    console.log('Fetching product with code:', productCode)
    console.log('API_BASE_URL:', API_BASE_URL)
    const response = await fetch(`${API_BASE_URL}/products/${productCode}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    const data = await response.json()
    return data  // NULLの場合もそのまま返す
  },

  async createPurchase(purchase: PurchaseRequest): Promise<PurchaseResponse> {
    console.log('Creating purchase with data:', purchase)
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
