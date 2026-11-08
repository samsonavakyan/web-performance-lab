import { useEffect, useRef, useState } from 'react';
import type { Mode } from '../types';

type Snapshot = { revision: number; capturedAt: string; assets: { symbol: string; price: number }[] };
async function connect(): Promise<void> {
  if (!window.isSecureContext || !('serviceWorker' in navigator))
    throw new Error('Use localhost or HTTPS in a browser that supports this case.');
  await navigator.serviceWorker.register('/lab-sw.js', { scope: '/', updateViaCache: 'none' });
  await new Promise<void>((resolve, reject) => {
    const check = () => {
      if (navigator.serviceWorker.controller?.scriptURL === new URL('/lab-sw.js', location.href).href) {
        cleanup();
        resolve();
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('controllerchange', check);
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Setup timed out. Reload the page online and try again.'));
    }, 10000);
    navigator.serviceWorker.addEventListener('controllerchange', check);
    check();
  });
}
export function SavedSnapshot({ mode }: { mode: Mode }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('Preparing');
  const current = useRef<AbortController | null>(null);
  const operation = useRef(0);
  useEffect(() => {
    let active = true;
    connect()
      .then(() => {
        if (active) {
          setReady(true);
          setMessage('Ready');
        }
      })
      .catch((error: Error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
      ++operation.current;
      current.current?.abort();
    };
  }, []);
  async function load() {
    const id = ++operation.current;
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setBusy(true);
    setSnapshot(null);
    setSource('');
    setMessage('Loading');
    const timer = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`/api/lab/snapshot?mode=${mode}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Snapshot unavailable');
      const data = (await response.json()) as Snapshot;
      if (
        !data ||
        !Number.isInteger(data.revision) ||
        !Number.isFinite(Date.parse(data.capturedAt)) ||
        !Array.isArray(data.assets) ||
        !data.assets.every((asset) => asset && typeof asset.symbol === 'string' && Number.isFinite(asset.price))
      ) {
        throw new Error('Snapshot unavailable');
      }
      if (id !== operation.current) return;
      setSnapshot(data);
      setSource(response.headers.get('X-Lab-Source') || 'network');
      setMessage('Loaded');
    } catch {
      if (id === operation.current) setMessage('Snapshot unavailable. Check the connection or load online first.');
    } finally {
      clearTimeout(timer);
      if (id === operation.current) setBusy(false);
    }
  }
  async function reset() {
    ++operation.current;
    current.current?.abort();
    setBusy(true);
    try {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith('marketlab-snapshot-')).map((name) => caches.delete(name)),
      );
      setSnapshot(null);
      setSource('');
      setMessage('Reset complete');
    } catch {
      setMessage('Reset unavailable');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p>
        Keep this page open. Load a snapshot online, select Offline in DevTools Network, then load again. Restore Online
        before resetting. Saved data shows its original capture time.
      </p>
      <div className="advanced-controls">
        <button disabled={!ready || busy} onClick={load}>
          Load snapshot
        </button>
        <button disabled={!ready || busy} onClick={reset}>
          Reset snapshot
        </button>
        <span role="status">{message}</span>
      </div>
      {snapshot && (
        <div className="snapshot-result">
          <p>
            Source: <strong>{source}</strong>
          </p>
          <p>
            Revision: <span data-revision>{snapshot.revision}</span> · Captured: {snapshot.capturedAt}
          </p>
          {snapshot.assets.map((asset) => (
            <div className="query-row" key={asset.symbol}>
              <span>{asset.symbol}</span>
              <span>{asset.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
