import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import Card from '../components/Card.jsx' 
import { fetchChallenges } from '../services/api.js'

export default function Progress() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch all challenges to calculate progress and display history
    fetchChallenges()
      .then(data => {
        // Challenges are returned in an array
        setChallenges(data)
      })
      .catch(err => {
        console.error("Error fetching challenges for progress:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false))
  }, [])

  // Use useMemo to efficiently calculate stats only when challenges data changes
  const { completedCount, activeCount, pendingCount, totalChallenges, completionPct, countsData } = useMemo(() => {
    if (challenges.length === 0) {
      return { completedCount: 0, activeCount: 0, pendingCount: 0, totalChallenges: 0, completionPct: 0, countsData: [] };
    }

    const completed = challenges.filter(c => c.status === 'completed').length
    const active = challenges.filter(c => c.status === 'active').length
    const pending = challenges.filter(c => c.status === 'pending').length
    const total = challenges.length
    
    // Calculate percentage (handle division by zero if somehow total is 0)
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0

    // Data structure for the Bar Chart
    const counts = [
      { name: 'Completed', value: completed, fill: '#16a34a' },
      { name: 'In Progress', value: active, fill: '#2563eb' },
      { name: 'Yet to Start', value: pending, fill: '#60a5fa' },
    ]

    return { 
      completedCount: completed, 
      activeCount: active, 
      pendingCount: pending, 
      totalChallenges: total, 
      completionPct: pct, 
      countsData: counts 
    }
  }, [challenges])

  if (loading) return <p className="text-center py-8 text-lg font-medium">Loading progress report...</p>
  if (error) return <p className="text-red-600 text-center py-8 text-lg font-medium">Error loading progress: {error}</p>
  if (totalChallenges === 0) return <p className="text-center py-8 text-gray-500">No challenges found to display progress.</p>

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <h2 className='text-3xl font-bold text-gray-800'>📈 Progress Report</h2>
      <p className="text-gray-600">Track your journey through the DevOps challenges.</p>

      {/* Overall Completion Card */}
      <Card className="shadow-lg">
        <div className='flex items-center justify-between'>
          <p className='text-lg font-medium text-gray-700'>Overall Completion</p>
          <p className='text-3xl font-extrabold text-green-600'>{completionPct}%</p>
        </div>
        <div className='w-full h-4 bg-gray-200 rounded-full mt-3 overflow-hidden'>
          <div 
            className='h-4 bg-green-500 rounded-full transition-all duration-500 ease-out' 
            style={{ width: `${completionPct}%` }}
          ></div>
        </div>
        <p className='text-sm text-gray-500 mt-2'>You have completed {completedCount} out of {totalChallenges} challenges.</p>
      </Card>

      {/* Bar Chart */}
      <Card className='h-96 p-6 shadow-lg'>
        <h3 className='text-xl font-semibold mb-4 text-gray-800'>Challenge Status Breakdown</h3>
        <ResponsiveContainer width='100%' height='80%'>
          <BarChart data={countsData} margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
            <CartesianGrid strokeDasharray='3 3' stroke="#e5e7eb" />
            <XAxis dataKey='name' className="text-sm" />
            <YAxis allowDecimals={false} className="text-sm" />
            <Tooltip 
              contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Bar 
              dataKey='value' 
              name="Challenges" 
              // Use the fill property defined in countsData for coloring
              fill="#2563eb" // Default fill in case data doesn't have it
              // Custom bar styling using fill property from data
              
              >
              {countsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Challenge History Table */}
      <Card className="shadow-lg">
        <h3 className='text-xl font-semibold mb-4 text-gray-800'>Challenge History</h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr className='text-gray-700 uppercase tracking-wider text-sm'>
                <th className='py-3 px-4'>ID</th>
                <th className='py-3 px-4'>Title</th>
                <th className='py-3 px-4'>Status</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {challenges.map(item => (
                <tr key={item.id} className='hover:bg-gray-50 transition duration-150'>
                  <td className='py-3 px-4 font-mono text-xs text-gray-500'>{item.id}</td>
                  <td className='py-3 px-4 font-medium text-gray-800'>{item.title}</td>
                  <td className='py-3 px-4'>
                    <span 
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status === 'pending' ? 'Yet to Start' : item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {challenges.length === 0 && (
          <p className="text-center py-4 text-gray-500">No challenges data to display.</p>
        )}
      </Card>
    </div>
  )
}

