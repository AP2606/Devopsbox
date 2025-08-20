import React from "react";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";

const Challenges = () => {
  const { data: challenges, loading, error } = useFetch("/api/challenges");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching challenges</p>;

  return (
    <div>
      <h2>Challenges</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td><Link to={`/challenges/${c.id}`}>{c.title}</Link></td>
              <td>{c.category}</td>
              <td>{c.difficulty}</td>
              <td><StatusBadge status={c.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Challenges;
