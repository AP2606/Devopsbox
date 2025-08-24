import { User } from 'lucide-react'

export default function Topbar() {
  return (
    <header className='w-full bg-white shadow-md px-6 py-4 flex justify-between items-center'>
      <h1 className='text-2xl font-bold text-gray-800'>🚀 DevOps Practice Sandbox</h1>
      <div className='flex items-center gap-3'>
        <span className='text-gray-600'>Hello, User</span>
        <div className='p-2 bg-gray-200 rounded-full'>
          <User size={20} className='text-gray-700' />
        </div>
      </div>
    </header>
  )
}
