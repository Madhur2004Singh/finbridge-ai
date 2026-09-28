import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="page-container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
