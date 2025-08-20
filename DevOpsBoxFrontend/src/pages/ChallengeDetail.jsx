import React from "react";
import { useParams } from "react-router-dom";

const ChallengeDetail = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>Challenge Detail - {id}</h2>
      <p>Details of the challenge will go here.</p>
    </div>
  );
};

export default ChallengeDetail;
