export function ScannerTrack() {
  return (
    <div className="scanner-track" aria-hidden="true">
      <span className="scanner-label">MARKET SCAN</span>
      <div className="scanner-line">
        <span className="scanner-marker" style={{ animation: 'scanner-sweep 2.5s ease-in-out infinite alternate' }} />
      </div>
    </div>
  );
}
