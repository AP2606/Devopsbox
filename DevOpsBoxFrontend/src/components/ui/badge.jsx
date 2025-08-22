import React from "react";

export function Badge({ children }) {
  return (
    <span className="inline-block px-2 py-1 text-xs bg-gray-200 rounded">
      {children}
    </span>
  );
}
