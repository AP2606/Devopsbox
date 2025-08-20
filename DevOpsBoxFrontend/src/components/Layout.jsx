import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
