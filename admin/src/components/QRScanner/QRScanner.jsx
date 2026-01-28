import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

// (optional) worker path set
QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

const QRScanner = ({ onScanSuccess }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [error, setError] = useState("");
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        if (scanned) return;

        setScanned(true);
        scannerRef.current.stop();

        onScanSuccess(result.data);
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current.start().catch((err) => {
      setError("Camera access denied");
      console.error(err);
    });

    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
    };
  }, [scanned]);

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", maxWidth: 400 }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default QRScanner;
