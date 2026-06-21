import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check, Share2, Brain } from 'lucide-react';

interface ShareAppQRCodeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareAppQRCode({ isOpen, onClose }: ShareAppQRCodeProps) {
  const [copied, setCopied] = useState(false);

  // Use current URL or a specific app URL
  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://clinicalpro.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('share-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'ClinicalPro-QR.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ClinicalPro',
          text: 'Check out ClinicalPro - Professional development for healthcare clinicians',
          url: appUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h2 className="font-semibold">Share ClinicalPro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <QRCodeSVG
              id="share-qr-code"
              value={appUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/favicon.ico',
                height: 30,
                width: 30,
                excavate: true,
              }}
            />
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                ClinicalPro
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Scan to open the app
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          {/* URL Display */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
            <span className="flex-1 text-sm text-gray-600 truncate px-2">
              {appUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
