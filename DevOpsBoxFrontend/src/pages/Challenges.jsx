import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { fetchChallenges } from "../services/api.js";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);   
  //with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  fetchChallenges()
    .then(data => {
      if (Array.isArray(data.challenges)) {
        setChallenges(data.challenges); // ✅ unwrap challenges array
      } else {
        setError("Invalid response format");
      }
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);

  if (loading) return <p>Loading challenges...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">🧩 Challenges</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(ch => (
          <Card key={ch.id}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">
                <Link to={`/challenges/${ch.id}`} className="hover:underline">
                  {ch.title}
                </Link>
              </h3>
              <StatusBadge status={ch.status} />
            </div>
            <p className="text-gray-600 mt-2">📌 {ch.category}</p>
            <p className="text-gray-600">⚡ Difficulty: {ch.difficulty}</p>
            <Link
              to={`/challenges/${ch.id}`}
              className="mt-4 inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Details
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

