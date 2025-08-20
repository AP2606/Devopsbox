import React from "react";

const StatusBadge = ({ status }) => {
  const color = status === "pending" ? "orange" : status === "completed" ? "green" : "gray";
  return <span style={{ color }}>{status}</span>;
};

export default StatusBadge;
