import React, { useState, useEffect } from 'react'
import './OfflineVault.css'

const VAULT_KEY = 'valuetrip_offline_vault'

export default function OfflineVault({ cachedResults, onRestore }) {
  const [vault, setVault] = useState(null)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [whatIfBudget, setWhatIfBudget] = useState(200)
  const [whatIfServiceWeight, setWhatIfServiceWeight] = useState(50)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VAULT_KEY)
      if (raw) setVault(JSON.parse(raw))
    } catch (_) {}
  }, [])

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  useEffect(() => {
    if (!cachedResults) return
    try {
      const payload = { data: cachedResults, ts: Date.now() }
      localStorage.setItem(VAULT_KEY, JSON.stringify(payload))
      setVault(payload)
    } catch (_) {}
  }, [cachedResults])

  const handleRestore = () => {
    if (vault?.data) onRestore?.(vault.data)
  }

  const filteredByWhatIf = () => {
    if (!vault?.data?.options && !vault?.data?.deals) return null
    const list = vault.data.options || vault.data.deals || []
    const budget = whatIfBudget
    const serviceWeight = whatIfServiceWeight / 100
    const priceWeight = 1 - serviceWeight
    const withScore = list.map((o) => {
      const price = o.cheapest_price ?? 0
      const score = (o.value_score ?? 5) / 10
      const fit = budget > 0 && price <= budget
        ? priceWeight * (1 - price / budget) + serviceWeight * score
        : serviceWeight * score
      return { ...o, _fit: fit }
    })
    return withScore.sort((a, b) => b._fit - a._fit).slice(0, 5)
  }

  const whatIfList = filteredByWhatIf()

  return (
    <section className="offline-vault">
      <div className="section-header">
        <h2>Offline Value Vault</h2>
        <p className="section-desc">Cached search results & ValueScores for offline access. What-if: tweak budget and service weight without internet.</p>
      </div>
      <div className="vault-content">
      {offline && <div className="offline-banner">You are offline. Showing cached data.</div>}
      {vault ? (
        <>
          <p className="vault-meta">Last saved: {new Date(vault.ts).toLocaleString()}</p>
          <button type="button" className="restore-btn" onClick={handleRestore}>Restore this search</button>
          <div className="what-if">
            <h3>What-if simulator</h3>
            <label>Max budget ({vault.data?.currency || 'GBP'}) <input type="number" min={0} step={10} value={whatIfBudget} onChange={(e) => setWhatIfBudget(Number(e.target.value))} /></label>
            <label>Service weight: {whatIfServiceWeight}% <input type="range" min={0} max={100} value={whatIfServiceWeight} onChange={(e) => setWhatIfServiceWeight(Number(e.target.value))} /></label>
            {whatIfList && whatIfList.length > 0 && (
              <ul className="what-if-list">
                {whatIfList.map((o, i) => (
                  <li key={o.id || i}>
                    {o.carrier || o.name || 'Deal'} · {o.cheapest_price != null ? (vault.data?.currency || 'GBP') + ' ' + o.cheapest_price.toFixed(2) : ''} · ValueScore {o.value_score ?? '—'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <p className="empty-vault">Run a search to cache results here for offline use.</p>
      )}
      </div>
    </section>
  )
}
