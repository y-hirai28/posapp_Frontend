'use client'

import { useState } from 'react'
import { api, Product, PurchaseItem, PurchaseRequest } from '@/lib/api'
import BarcodeScanner from '@/components/BarcodeScanner'

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
  const [showScanner, setShowScanner] = useState(false)

  const handleBarcodeClick = () => {
    setShowScanner(true)
  }

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false)
    setProductCode(decodedText)

    // スキャン結果で商品を自動読み込み
    setLoading(true)
    setError('')
    setProductNotFound(false)

    try {
      const product = await api.getProductByCode(decodedText)
      if (product) {
        setCurrentProduct(product)
        setProductNotFound(false)
      } else {
        setCurrentProduct(null)
        setProductNotFound(true)
      }
    } catch (err) {
      setCurrentProduct(null)
      setProductNotFound(true)
    } finally {
      setLoading(false)
    }
  }

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
      setProductCode(product.prd_code)
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
      // 購入APIに送信するデータを作成
      const purchaseItems: PurchaseItem[] = cart.map(item => ({
        product_id: item.prd_id,      // 商品一意キー
        product_code: item.code,       // 商品コード
        product_name: item.name,       // 商品名称
        unit_price: item.price         // 商品単価
      }))

      const purchaseRequest: PurchaseRequest = {
        items: purchaseItems,
        emp_cd: '',  // レジ担当者コード（空白の場合はバックエンドで'9999999999'になる）
        // store_cd と pos_no はバックエンドで固定値が設定される
      }

      // 購入APIを呼び出し
      const response = await api.createPurchase(purchaseRequest)

      if (response.success) {
        setCart([])
        // バックエンドから返された税抜・税込金額を表示
        alert(`購入が完了しました\n\n合計金額（税抜）: ¥${response.total_amt_ex_tax.toLocaleString()}\n合計金額（税込）: ¥${response.total_amt.toLocaleString()}`)
      } else {
        setError('購入処理に失敗しました')
      }
    } catch (err) {
      setError('購入処理に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">POSアプリ</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* 商品読み込みエリア */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">商品読み込み</h2>

            {/* ①バーコードスキャンボタン */}
            <button
              onClick={handleBarcodeClick}
              disabled={loading}
              className="w-full bg-purple-500 text-white py-3 sm:py-2 px-4 rounded-md hover:bg-purple-600 active:bg-purple-700 disabled:bg-gray-400 mb-4 font-medium transition-colors active-scale flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              バーコードスキャン
            </button>

            {/* ②コード表示エリア */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品コード
              </label>
              <div className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-md bg-gray-50 min-h-[44px] flex items-center">
                {productCode || <span className="text-gray-400">コード未入力</span>}
              </div>
            </div>

            {/* ③名称表示エリア */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品名
              </label>
              <div className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-md bg-gray-50 min-h-[44px] flex items-center">
                {currentProduct ? currentProduct.name : productNotFound ? (
                  <span className="text-red-600 font-medium">商品がマスタ未登録です</span>
                ) : (
                  <span className="text-gray-400">商品未選択</span>
                )}
              </div>
            </div>

            {/* ④単価表示エリア */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                単価
              </label>
              <div className="w-full px-3 py-3 sm:py-2 text-base border border-gray-300 rounded-md bg-gray-50 min-h-[44px] flex items-center">
                {currentProduct ? (
                  <span className="text-xl sm:text-lg font-bold">¥{currentProduct.price.toLocaleString()}</span>
                ) : (
                  <span className="text-gray-400">¥0</span>
                )}
              </div>
            </div>

            {error && !productNotFound && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}

            {/* ⑤購入リストへ追加ボタン */}
            <button
              onClick={handleAddToCart}
              disabled={!currentProduct || loading}
              className="w-full bg-green-500 text-white py-3 sm:py-2 px-4 rounded-md hover:bg-green-600 active:bg-green-700 disabled:bg-gray-400 font-medium transition-colors active-scale"
            >
              購入リストへ追加
            </button>
          </div>

          {/* ⑥購入品目リスト */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">購入リスト</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">商品がありません</p>
            ) : (
              <div className="space-y-2">
                {/* モバイル用：スクロール可能なテーブル */}
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <div className="min-w-max sm:min-w-0">
                    <div className="grid grid-cols-4 gap-2 text-xs sm:text-sm font-medium text-gray-700 border-b pb-2">
                      <div key="header-name" className="truncate">名称</div>
                      <div key="header-quantity" className="text-center">数量</div>
                      <div key="header-price" className="text-right">単価</div>
                      <div key="header-total" className="text-right">合計</div>
                    </div>

                    {cart.map((item) => (
                      <div key={item.prd_id} className="grid grid-cols-4 gap-2 text-xs sm:text-sm py-2 border-b">
                        <div className="truncate">{item.name}</div>
                        <div className="text-center">{item.quantity}</div>
                        <div className="text-right">¥{item.price.toLocaleString()}</div>
                        <div className="text-right font-medium">¥{item.subtotal.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 text-base sm:text-lg font-bold">
                  <span>合計金額:</span>
                  <span className="text-lg sm:text-xl">¥{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* ⑦購入ボタン */}
            <button
              onClick={handlePurchase}
              disabled={cart.length === 0 || loading}
              className="w-full mt-6 bg-red-500 text-white py-3 sm:py-3 px-4 rounded-md hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 font-semibold transition-colors active-scale"
            >
              {loading ? '処理中...' : '購入'}
            </button>
          </div>
        </div>
      </div>

      {/* バーコードスキャナー */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}