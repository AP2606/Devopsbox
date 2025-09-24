import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Challenges from "./pages/Challenges.jsx";
import ChallengeDetail from "./pages/ChallengeDetail.jsx";
import Progress from "./pages/Progress.jsx";

function App() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-gray-100 shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">DevOps Practice SandBox 🚀</h1>
          <span className="text-gray-600">👤 Welcome, User</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

