import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";

import "react-toastify/dist/ReactToastify.css";
import "./pages/styles/Reset.css";
import "./pages/styles/App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useToast } from "./hooks/useToast";

function App() {
  useToast();

  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
        newestOnTop
      />

      <Analytics />
    </>
  );
}

export default App;
