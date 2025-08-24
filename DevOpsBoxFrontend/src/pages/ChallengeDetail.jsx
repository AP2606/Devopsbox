import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChallengeById } from "../services/api.js";

export default function ChallengeDetail() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    fetchChallengeById(id).then(setChallenge).catch(console.error);
  }, [id]);

  if (!challenge) {
    return <p className="text-gray-600">Loading challenge...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{challenge.title}</h2>
      <p className="mb-2">📌 Category: {challenge.category}</p>
      <p className="mb-2">⚡ Difficulty: {challenge.difficulty}</p>
      <p className="mb-4">Status: {challenge.status}</p>
      <Link to="/challenges" className="text-blue-600 hover:underline">
        ⬅ Back to Challenges
      </Link>
    </div>
  );
}

