'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // 二重初期化を防ぐ
    if (hasInitialized.current) return
    hasInitialized.current = true

    const startScanner = async () => {
      try {
        // カメラIDを取得
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          const scanner = new Html5Qrcode('barcode-reader')
          scannerRef.current = scanner

          // バックカメラを優先的に選択
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          ) || devices[0]

          // スキャン開始
          await scanner.start(
            backCamera.id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // スキャン成功
              onScanSuccess(decodedText)
              stopScanner()
            },
            (errorMessage) => {
              // スキャン失敗（通常のエラーなので無視）
            }
          )
          setIsScanning(true)
        } else {
          setError('カメラが見つかりませんでした')
        }
      } catch (err) {
        console.error('Scanner error:', err)
        setError('カメラの起動に失敗しました。カメラの使用を許可してください。')
      }
    }

    startScanner()

    // クリーンアップ
    return () => {
      stopScanner()
    }
  }, []) // 空の依存配列で一度だけ実行

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        setIsScanning(false)
      } catch (err) {
        console.error('Stop scanner error:', err)
      }
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">バーコードスキャン</h2>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-300 text-2xl font-bold px-3 py-1"
        >
          ×
        </button>
      </div>

      {/* スキャナーエリア */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div id="barcode-reader" className="w-full max-w-md"></div>

        {error && (
          <div className="mt-4 bg-red-500 text-white px-4 py-3 rounded-md max-w-md">
            {error}
          </div>
        )}

        {isScanning && (
          <div className="mt-4 text-white text-center">
            <p className="text-sm">バーコードをカメラに向けてください</p>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="bg-gray-900 p-4">
        <button
          onClick={handleClose}
          className="w-full bg-gray-700 text-white py-3 px-4 rounded-md hover:bg-gray-600 active:bg-gray-800 font-medium transition-colors active-scale"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
