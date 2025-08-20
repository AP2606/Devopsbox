import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>DevOpsBox</h2>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/challenges">Challenges</Link></li>
          <li><Link to="/progress">Progress</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
