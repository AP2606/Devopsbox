import React from "react";

export function Card({ children }) {
  return <div className="border rounded-lg shadow p-4 bg-white">{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="border-b pb-2 mb-2">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-bold">{children}</h3>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
