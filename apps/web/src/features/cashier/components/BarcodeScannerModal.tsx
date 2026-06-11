import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import type { FormEvent } from 'react';
import { Camera, Keyboard, ScanLine } from 'lucide-react';
import { appConfig, isScannerOriginSupported } from '../../../app/config/app';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';

function getScannerErrorMessage(error: unknown) {
  const cameraError = error as DOMException | undefined;

  if (cameraError?.name === 'NotAllowedError') {
    return 'Akses kamera ditolak. Izinkan akses kamera atau gunakan input manual.';
  }

  if (cameraError?.name === 'NotFoundError') {
    return 'Kamera tidak ditemukan pada perangkat ini.';
  }

  if (!isScannerOriginSupported()) {
    return `Scanner kamera membutuhkan HTTPS atau host lokal: ${appConfig.scanner.allowedHttpHosts.join(', ')}.`;
  }

  return 'Kamera belum dapat digunakan. Gunakan input manual atau coba buka ulang scanner.';
}

interface BarcodeScannerModalProps {
  isOpen: boolean;
  manualCode: string;
  onClose: () => void;
  onCodeChange: (code: string) => void;
  onLookup: (code: string) => boolean;
}

export function BarcodeScannerModal({ isOpen, manualCode, onClose, onCodeChange, onLookup }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [cameraStatus, setCameraStatus] = useState('Menyiapkan kamera...');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedCode, setDetectedCode] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    let isMounted = true;
    const codeReader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: appConfig.scanner.delayBetweenScanAttempts,
      delayBetweenScanSuccess: appConfig.scanner.delayBetweenScanSuccess,
    });

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage('Browser tidak mendukung akses kamera.');
        setCameraStatus('Gunakan input manual.');
        return;
      }

      setErrorMessage('');
      setDetectedCode('');
      setCameraStatus('Meminta akses kamera...');

      try {
        const controls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: appConfig.scanner.cameraWidth },
              height: { ideal: appConfig.scanner.cameraHeight },
            },
          },
          videoRef.current ?? undefined,
          (result, _error, scannerControls) => {
            if (!result || !isMounted) return;

            const code = result.getText().trim();
            setDetectedCode(code);
            onCodeChange(code);
            const isFound = onLookup(code);

            if (isFound) {
              scannerControls.stop();
            } else {
              setErrorMessage(`Order ${code} tidak ditemukan.`);
            }
          },
        );

        controlsRef.current = controls;
        if (isMounted) {
          setCameraStatus('Arahkan kamera ke barcode order.');
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(getScannerErrorMessage(error));
        setCameraStatus('Gunakan input manual.');
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen, onCodeChange, onLookup]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = manualCode.trim();
    if (!code) {
      setErrorMessage('Order code wajib diisi.');
      return;
    }

    const isFound = onLookup(code);
    if (!isFound) {
      setErrorMessage(`Order ${code} tidak ditemukan.`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode Order" className="max-w-2xl">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
          <div className="relative aspect-video">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-28 w-64 rounded-xl border-2 border-primary-400 shadow-[0_0_0_999px_rgba(2,6,23,0.45)]" />
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white">
              <Camera className="h-4 w-4" />
              {cameraStatus}
            </div>
          </div>
        </div>

        {detectedCode ? (
          <div className="flex items-center gap-2 rounded-xl bg-primary-50 p-3 text-sm font-semibold text-primary-800">
            <ScanLine className="h-4 w-4" />
            Terbaca: {detectedCode}
          </div>
        ) : null}

        {errorMessage ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">{errorMessage}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 p-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Input manual order code</label>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={manualCode}
              onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
              placeholder={appConfig.orderCodeExample}
            />
            <Button type="submit" className="h-10">
              <Keyboard className="mr-2 h-4 w-4" />
              Gunakan Kode
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
