import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, BarChart3 } from 'lucide-react'

export default function Sidebar() {
  const base = 'flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition'
  return (
    <aside className='h-screen w-60 bg-gray-900 text-gray-200 flex flex-col shadow-lg'>
      <div className='text-center py-6 text-2xl font-bold tracking-wide border-b border-gray-700'>
        DevOpsBox
      </div>

      <nav className='flex-1 p-4 space-y-3'>
        <NavLink to='/' className={({isActive}) => `${base} ${isActive ? 'bg-gray-800 text-white font-semibold' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to='/challenges' className={({isActive}) => `${base} ${isActive ? 'bg-gray-800 text-white font-semibold' : ''}`}>
          <ListChecks size={20} /> Challenges
        </NavLink>
        <NavLink to='/progress' className={({isActive}) => `${base} ${isActive ? 'bg-gray-800 text-white font-semibold' : ''}`}>
          <BarChart3 size={20} /> Progress
        </NavLink>
      </nav>
    </aside>
  )
}
