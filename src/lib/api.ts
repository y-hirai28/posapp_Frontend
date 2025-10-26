const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-1-py-oshima1.azurewebsites.net/api'

export interface Product {
  prd_id: number
  code: string
  name: string
  price: number
}

export interface PurchaseItem {
  code: string            // 商品コード
  qty: number             // 数量
}

export interface PurchaseRequest {
  items: PurchaseItem[]
  emp_cd?: string         // レジ担当者コード（省略可）
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
    const requestBody = JSON.stringify(purchase)
    console.log('Request body JSON:', requestBody)

    const response = await fetch(`${API_BASE_URL}/purchases/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      // 200/201以外の場合はレスポンスボディを取得してエラー表示
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      console.log('Error response:', errorData)
      const errorMessage = errorData.detail || JSON.stringify(errorData) || `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }
    return response.json()
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  }
}
