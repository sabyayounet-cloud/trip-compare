import React, { useState, useEffect } from 'react'
import * as api from '../api'
import './CommunityWatchdog.css'

export default function CommunityWatchdog() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState('')
  const [submitText, setSubmitText] = useState('')
  const [submitAuthor, setSubmitAuthor] = useState('')
  const [submitLocation, setSubmitLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [complaints, setComplaints] = useState([])
  const [complaintsLoading, setComplaintsLoading] = useState(true)
  const [complaintFilter, setComplaintFilter] = useState('')
  const [complaintProviderId, setComplaintProviderId] = useState('')
  const [complaintProviderName, setComplaintProviderName] = useState('')
  const [complaintIssueType, setComplaintIssueType] = useState('cancellation')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [complaintDealId, setComplaintDealId] = useState('')
  const [complaintSubmitting, setComplaintSubmitting] = useState(false)

  const fetchTips = async (loc) => {
    setLoading(true)
    try {
      const data = await api.getCommunityTips(loc || null)
      setTips(data.tips || [])
    } catch (e) {
      setTips([])
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaints = async (providerId) => {
    setComplaintsLoading(true)
    try {
      const data = await api.getComplaints(providerId || null)
      setComplaints(data.complaints || [])
    } catch (e) {
      setComplaints([])
    } finally {
      setComplaintsLoading(false)
    }
  }

  useEffect(() => { fetchTips(location) }, [location])
  useEffect(() => { fetchComplaints(complaintFilter || undefined) }, [complaintFilter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!submitText.trim()) return
    setSubmitting(true)
    try {
      const tip = await api.postCommunityTip({ author: submitAuthor || 'Anonymous', text: submitText.trim(), location: submitLocation.trim() })
      setTips((prev) => [tip, ...prev])
      setSubmitText('')
      setSubmitAuthor('')
      setSubmitLocation('')
    } catch (_) {}
    setSubmitting(false)
  }

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    if (!complaintProviderId.trim() || !complaintProviderName.trim() || !complaintDescription.trim()) return
    setComplaintSubmitting(true)
    try {
      const created = await api.postComplaint({
        provider_id: complaintProviderId.trim(),
        provider_name: complaintProviderName.trim(),
        issue_type: complaintIssueType,
        description: complaintDescription.trim(),
        deal_id: complaintDealId.trim(),
      })
      setComplaints((prev) => [created, ...prev])
      setComplaintProviderId('')
      setComplaintProviderName('')
      setComplaintDescription('')
      setComplaintDealId('')
    } catch (_) {}
    setComplaintSubmitting(false)
  }

  return (
    <section className="community-watchdog">
      <div className="section-header">
        <h2>Community Service Watchdog</h2>
        <p className="section-desc">Real-time tips on provider service (e.g. delays at Schiphol). AI-moderated; integrates into ValueScore. Flag post-booking issues and track resolution.</p>
      </div>
      <div className="filter-row">
        <label>Filter by location (e.g. AMS, LHR)</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="AMS" maxLength={5} />
      </div>
      {loading ? <p>Loading tips…</p> : (
        <ul className="tips-list">
          {tips.length === 0 ? <li className="empty">No tips yet. Submit one below.</li> : tips.map((t) => (
            <li key={t.id}>
              <span className="tip-location">{t.location || '—'}</span>
              <span className="tip-text">{t.text}</span>
              <span className="tip-meta">— {t.author} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''} · ↑{t.upvotes ?? 0}</span>
            </li>
          ))}
        </ul>
      )}
      <form className="submit-tip" onSubmit={handleSubmit}>
        <h3>Submit a tip</h3>
        <textarea value={submitText} onChange={(e) => setSubmitText(e.target.value)} placeholder="e.g. Current delays at Schiphol—avoid this airline" rows={2} />
        <input type="text" value={submitAuthor} onChange={(e) => setSubmitAuthor(e.target.value)} placeholder="Name (optional)" />
        <input type="text" value={submitLocation} onChange={(e) => setSubmitLocation(e.target.value)} placeholder="Location code (e.g. AMS)" />
        <button type="submit" disabled={submitting || !submitText.trim()}>{submitting ? 'Submitting…' : 'Submit tip'}</button>
      </form>

      <div className="complaints-section">
        <h3>Complaint & Resolution Tracker</h3>
        <p className="section-desc">Flag an issue with a provider (OTA, airline, hotel). We use this to update ValueScore and share resolution success rates.</p>
        <div className="filter-row">
          <label>Filter complaints by provider ID</label>
          <input type="text" value={complaintFilter} onChange={(e) => setComplaintFilter(e.target.value)} placeholder="e.g. travelpayouts, gotogate" />
        </div>
        {complaintsLoading ? <p>Loading complaints…</p> : (
          <ul className="complaints-list">
            {complaints.length === 0 ? <li className="empty">No complaints yet. Submit one below.</li> : complaints.map((c) => (
              <li key={c.id} className="complaint-item">
                <span className="complaint-provider">{c.provider_name || c.provider_id}</span>
                <span className="complaint-type">{c.issue_type}</span>
                <span className="complaint-desc">{c.description}</span>
                <span className="complaint-meta">Status: {c.status} · {c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
        <form className="submit-complaint" onSubmit={handleComplaintSubmit}>
          <h4>Flag an issue / Submit complaint</h4>
          <input type="text" value={complaintProviderId} onChange={(e) => setComplaintProviderId(e.target.value)} placeholder="Provider ID (e.g. travelpayouts)" required />
          <input type="text" value={complaintProviderName} onChange={(e) => setComplaintProviderName(e.target.value)} placeholder="Provider name (e.g. Travelpayouts)" required />
          <select value={complaintIssueType} onChange={(e) => setComplaintIssueType(e.target.value)}>
            <option value="cancellation">Cancellation</option>
            <option value="delay">Delay</option>
            <option value="refund">Refund</option>
            <option value="scam">Scam / Fraud</option>
            <option value="other">Other</option>
          </select>
          <textarea value={complaintDescription} onChange={(e) => setComplaintDescription(e.target.value)} placeholder="Describe the issue…" rows={2} required />
          <input type="text" value={complaintDealId} onChange={(e) => setComplaintDealId(e.target.value)} placeholder="Deal/booking ID (optional)" />
          <button type="submit" disabled={complaintSubmitting || !complaintDescription.trim()}>{complaintSubmitting ? 'Submitting…' : 'Submit complaint'}</button>
        </form>
      </div>
    </section>
  )
}
