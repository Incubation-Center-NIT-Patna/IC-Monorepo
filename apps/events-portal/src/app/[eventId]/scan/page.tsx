"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "../../../lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QRScannerPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();
  
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isScanning) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    let scanner: Html5QrcodeScanner | null = null;

    const initTimer = setTimeout(() => {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          setIsScanning(false);
          processScan(decodedText);
        },
        (error) => {
          // Ignore normal scan errors
        }
      );
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (scanner) {
        scanner.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const processScan = async (token: string) => {
    setIsProcessing(true);
    setScanError(null);
    setScanResult(null);

    try {
      const data = await fetchApi(`/events/${eventId}/checkpoints/scan`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setScanResult(data.data);
    } catch (err: any) {
      setScanError(err.message || "Invalid QR code or network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setScanError(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-md mx-auto w-full bg-zinc-900/40 rounded-3xl border border-zinc-800 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <Link href={`/${eventId}`} className="text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h2 className="font-semibold text-zinc-100">Scan Checkpoint</h2>
        <div className="w-16"></div>
      </div>

      <div className="p-6">
        {isScanning && !isProcessing && (
          <div className="w-full">
            <div id="qr-reader" className="w-full mx-auto overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"></div>
            <p className="text-center text-sm text-zinc-500 mt-4">Point your camera at the QR code</p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-indigo-400 font-medium">Verifying checkpoint...</p>
          </div>
        )}

        {scanResult && !isProcessing && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-100 mb-2">Checkpoint Unlocked!</h3>
            <p className="text-green-400 font-bold mb-6">+{scanResult.pointsAwarded} Points</p>
            
            {scanResult.resourceUnlocked && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl mb-6 text-left">
                <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">Resource Unlocked</div>
                <div className="font-semibold text-zinc-100">{scanResult.resourceUnlocked.name}</div>
                {scanResult.resourceUnlocked.description && (
                  <div className="text-sm text-zinc-400 mt-1">{scanResult.resourceUnlocked.description}</div>
                )}
              </div>
            )}

            <button 
              onClick={() => router.push(`/${eventId}`)} 
              className="w-full bg-gradient-to-r from-cyan-500 to-green-500 text-black py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {scanError && !isProcessing && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Scan Failed</h3>
            <p className="text-zinc-500 mb-8">{scanError}</p>
            
            <button 
              onClick={handleScanAgain} 
              className="w-full bg-zinc-800 text-zinc-100 py-3 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
