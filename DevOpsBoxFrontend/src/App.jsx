import { Routes, Route, Link } from "react-router-dom";
import Challenges from "./pages/Challenges.jsx";
import ChallengeDetail from "./pages/ChallengeDetail.jsx";

function App() {
  return (
    <div className="p-6">
      <nav className="mb-6 space-x-4">
        <Link to="/">🏠 Home</Link>
        <Link to="/challenges">🧩 Challenges</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1 className="text-3xl">Welcome to DevOpsBox 🚀</h1>} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
      </Routes>
    </div>
  );
}

export default App;

