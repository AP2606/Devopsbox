import Card from '../components/Card.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const history = [
  { id: 1, title: 'Fix Broken CI Pipeline', status: 'Completed' },
  { id: 2, title: 'Debug Dockerfile', status: 'In Progress' },
  { id: 3, title: 'Kubernetes Misconfigured Deployment', status: 'Yet to Start' },
]
const counts = [
  { name: 'Completed', value: 1 },
  { name: 'In Progress', value: 1 },
  { name: 'Yet to Start', value: 1 },
]
const completed = history.filter(h => h.status === 'Completed').length
const total = history.length
const pct = Math.round((completed / total) * 100)

export default function Progress() {
  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold'>📈 Progress</h2>

      <Card>
        <div className='flex items-center justify-between'>
          <p className='text-lg'>Overall Completion</p>
          <p className='text-xl font-semibold'>{pct}%</p>
        </div>
        <div className='w-full h-3 bg-gray-200 rounded-full mt-3'>
          <div className='h-3 bg-green-500 rounded-full' style={{ width: `${pct}%` }}></div>
        </div>
      </Card>

      <Card className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={counts} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey='value' />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className='text-lg font-semibold mb-3'>Challenge History</h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left'>
            <thead>
              <tr className='text-gray-700'>
                <th className='py-2 pr-4'>ID</th>
                <th className='py-2 pr-4'>Title</th>
                <th className='py-2 pr-4'>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id} className='border-t'>
                  <td className='py-2 pr-4'>{item.id}</td>
                  <td className='py-2 pr-4'>{item.title}</td>
                  <td className='py-2 pr-4'>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
