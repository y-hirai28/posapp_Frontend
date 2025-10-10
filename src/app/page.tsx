'use client'

import { useState } from 'react'
import { api, Product, PurchaseItem } from '@/lib/api'

interface CartItem extends Product {
  quantity: number
  subtotal: number
}

export default function Home() {
  const [productCode, setProductCode] = useState('')
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productNotFound, setProductNotFound] = useState(false)

  const handleLoadProduct = async () => {
    if (!productCode.trim()) {
      setError('商品コードを入力してください')
      return
    }

    setLoading(true)
    setError('')
    setProductNotFound(false)
    
    try {
      const product = await api.getProductByCode(productCode)
      setCurrentProduct(product)
      setProductNotFound(false)
    } catch (err) {
      setCurrentProduct(null)
      setProductNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!currentProduct) return

    const existingItem = cart.find(item => item.prd_id === currentProduct.prd_id)

    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.prd_id === currentProduct.prd_id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      )
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        ...currentProduct,
        quantity: 1,
        subtotal: currentProduct.price
      }
      setCart([...cart, newItem])
    }

    setProductCode('')
    setCurrentProduct(null)
    setProductNotFound(false)
  }

  const handlePurchase = async () => {
    if (cart.length === 0) {
      setError('カートが空です')
      return
    }

    setLoading(true)
    setError('')

    try {
      const purchaseItems: PurchaseItem[] = cart.map(item => ({
        product_id: item.prd_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.subtotal
      }))

      await api.createPurchase({ items: purchaseItems })
      const taxIncludedTotal = Math.floor(totalAmount * 1.1)
      setCart([])
      alert(`購入が完了しました\n\n合計金額（税込）: ¥${taxIncludedTotal.toLocaleString()}`)
    } catch (err) {
      setError('購入処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">POSアプリ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品読み込みエリア */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">商品読み込み</h2>
            
            {/* ①商品コード入力エリア */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品コード
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="商品コードを入力"
                onKeyPress={(e) => e.key === 'Enter' && handleLoadProduct()}
              />
            </div>

            {/* ②商品コード読み込みボタン */}
            <button
              onClick={handleLoadProduct}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 mb-4"
            >
              {loading ? '読み込み中...' : '商品読み込み'}
            </button>

            {error && !productNotFound && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}

            {/* ③名称表示エリア・④単価表示エリア */}
            {productNotFound && (
              <div className="border border-red-200 bg-red-50 p-4 rounded-md mb-4">
                <div className="text-red-600 font-medium">
                  商品がマスタ未登録です
                </div>
              </div>
            )}

            {currentProduct && (
              <div className="border border-gray-200 p-4 rounded-md mb-4">
                <div className="mb-2">
                  <span className="font-medium">商品名: </span>
                  <span>{currentProduct.name}</span>
                </div>
                <div className="mb-4">
                  <span className="font-medium">単価: </span>
                  <span className="text-lg font-bold">¥{currentProduct.price.toLocaleString()}</span>
                </div>
                
                {/* ⑤購入リストへ追加ボタン */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  カートに追加
                </button>
              </div>
            )}
          </div>

          {/* ⑥購入品目リスト */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">購入リスト</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">商品がありません</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                  <div key="header-name">名称</div>
                  <div key="header-quantity">数量</div>
                  <div key="header-price">単価</div>
                  <div key="header-total">合計</div>
                </div>

                {cart.map((item) => (
                  <div key={item.prd_id} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
                    <div>{item.name}</div>
                    <div>{item.quantity}</div>
                    <div>¥{item.price.toLocaleString()}</div>
                    <div>¥{item.subtotal.toLocaleString()}</div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4 text-lg font-bold">
                  <span>合計金額:</span>
                  <span>¥{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* ⑦購入ボタン */}
            <button
              onClick={handlePurchase}
              disabled={cart.length === 0 || loading}
              className="w-full mt-6 bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-gray-400 font-semibold"
            >
              {loading ? '処理中...' : '購入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}