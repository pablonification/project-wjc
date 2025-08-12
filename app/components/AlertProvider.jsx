"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

export default function AlertProvider({ children }) {
  useEffect(() => {
    // Override the native alert to use toast pop-ups instead.
    window.alert = (message) => {
      // Fallback for non-string values
      const msg = typeof message === "string" ? message : JSON.stringify(message);
      toast(msg, { position: "top-center" });
    };
  }, []);

  return (
    <>
      {children}
      {/* Global toast container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
