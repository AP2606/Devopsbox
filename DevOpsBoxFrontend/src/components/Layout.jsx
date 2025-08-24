import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout({ children }) {
  return (
    <div className='app-layout'>
      <Sidebar />
      <div className='main-content'>
        <Topbar />
        <main className='page-content'>{children}</main>
      </div>
    </div>
  )
}
