export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  const map = {
    'completed': 'badge badge-green',
    'yet to start': 'badge badge-blue',
    'in progress': 'badge badge-blue',
  }
  const cls = map[s] || 'badge badge-gray'
  return <span className={cls}>{status}</span>
}
