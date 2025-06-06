import React from "react";
import { Html, useProgress } from "@react-three/drei";

const CanvasLoader = () => {
  const { progress } = useProgress();

  return (
    <Html
      as="div"
      center
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "10px solid #f1f1f1",
          borderTop: "10px solid #008080", // Windows 95 teal
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
        }}
      />

      <div
        style={{
          marginTop: "30px",
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          padding: "8px 20px",
          width: "200px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 16,
            color: "#000",
            fontWeight: "bold",
            fontFamily: "MS Sans Serif, Arial, sans-serif",
            margin: 0,
          }}
        >
          Loading Assets
        </p>

        <div
          style={{
            width: "100%",
            height: "20px",
            border: "1px solid #808080",
            marginTop: "8px",
            background: "white",
            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#000080", // Windows 95 blue
              transition: "width 0.2s",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 14,
            color: "#000",
            fontFamily: "MS Sans Serif, Arial, sans-serif",
            marginTop: "6px",
            marginBottom: "0",
          }}
        >
          {progress.toFixed(0)}% Complete
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Html>
  );
};

export default CanvasLoader;
