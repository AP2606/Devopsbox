import Card from '../components/Card.jsx'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Completed', value: 2 },
  { name: 'Yet to Start', value: 5 },
  { name: 'In Progress', value: 1 },
]

const COLORS = ['#16a34a', '#60a5fa', '#2563eb'] // green, light blue, blue

export default function Dashboard() {
  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold'>📊 Dashboard</h2>

      <div className='grid md:grid-cols-3 gap-6'>
        <Card className='bg-green-50'>
          <h3 className='text-lg font-semibold'>✅ Challenges Completed</h3>
          <p className='text-3xl mt-2'>2</p>
        </Card>
        <Card className='bg-blue-50'>
          <h3 className='text-lg font-semibold'>🟦 Yet to Start</h3>
          <p className='text-3xl mt-2'>5</p>
        </Card>
        <Card className='bg-blue-100'>
          <h3 className='text-lg font-semibold'>🚀 In Progress</h3>
          <p className='text-3xl mt-2'>1</p>
        </Card>
      </div>

      <Card className='flex justify-center items-center'>
        <PieChart width={360} height={320}>
          <Pie data={data} cx={180} cy={150} innerRadius={60} outerRadius={120} dataKey='value'>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Card>
    </div>
  )
}
