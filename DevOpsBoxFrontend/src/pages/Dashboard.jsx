import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../components/Card.jsx' 
import { fetchStats } from '../services/api.js' 


const COLORS = {
  completed: '#16a34a', // Tailwind green-600 (Completed)
  pending: '#60a5fa',  // Tailwind blue-400 (Yet to Start)
  active: '#2563eb',   // Tailwind blue-600 (In Progress)
}

export default function Dashboard() {
  const [stats, setStats] = useState({ completed: 0, active: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch real-time statistics from the backend
    fetchStats()
      .then(data => {
        // Ensure data is structured correctly even if API only returns existing statuses
        setStats({
          completed: data.completed || 0,
          active: data.active || 0,
          pending: data.pending || 0
        })
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center py-8 text-lg font-medium">Loading dashboard data...</p>
  if (error) return <p className="text-red-600 text-center py-8 text-lg font-medium">Error loading stats: {error}</p>

  // Prepare data for the Pie Chart
  const chartData = [
    { name: 'Completed', value: stats.completed, status: 'completed' },
    { name: 'Yet to Start', value: stats.pending, status: 'pending' },
    { name: 'In Progress', value: stats.active, status: 'active' },
  ]
  // Filter out entries with zero value for cleaner visualization
  const filteredChartData = chartData.filter(d => d.value > 0);
  
  // Calculate total for display
  const totalChallenges = stats.completed + stats.active + stats.pending;

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <h2 className='text-3xl font-bold text-gray-800'>📊 Challenge Dashboard</h2>
      <p className="text-gray-600">Overview of your progress across all **{totalChallenges}** available challenges.</p>

      {/* Status Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        
        <Card className='bg-green-50 border-l-4 border-green-500 shadow-lg'>
          <h3 className='text-lg font-semibold text-green-700'>✅ Challenges Completed</h3>
          <p className='text-4xl font-extrabold mt-2 text-green-600'>{stats.completed}</p>
        </Card>
        
        <Card className='bg-blue-50 border-l-4 border-blue-500 shadow-lg'>
          <h3 className='text-lg font-semibold text-blue-700'>🚀 In Progress</h3>
          <p className='text-4xl font-extrabold mt-2 text-blue-600'>{stats.active}</p>
        </Card>
        
        <Card className='bg-gray-50 border-l-4 border-gray-500 shadow-lg'>
          <h3 className='text-lg font-semibold text-gray-700'>🟦 Yet to Start</h3>
          <p className='text-4xl font-extrabold mt-2 text-gray-600'>{stats.pending}</p>
        </Card>
      </div>

      {/* Pie Chart Visualization */}
      <Card className='flex justify-center items-center p-6 h-[400px] shadow-lg'>
        <h3 className='absolute top-4 left-6 text-xl font-semibold text-gray-800'>Challenge Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={filteredChartData} 
              dataKey='value'
              nameKey='name' 
              cx="50%" 
              cy="50%" 
              innerRadius={70} 
              outerRadius={130} 
              fill="#8884d8"
              paddingAngle={2}
              labelLine={false}
              // Render labels only for sections with value > 0
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                if (value === 0) return null;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.4; // Slightly inside the outer edge
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return (
                  <text 
                    x={x} y={y} 
                    fill="#374151" // dark gray for contrast
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central"
                    className="font-bold"
                  >
                    {`${value}`}
                  </text>
                );
              }}
            >
              {filteredChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status]} 
                  className="transition duration-300 ease-in-out hover:opacity-90"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#333', border: 'none', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value, name) => [value, name]}
            />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

