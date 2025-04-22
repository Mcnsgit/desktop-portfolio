// src/components/windows/WindowLoading.tsx
import React from 'react';

interface WindowLoadingProps {
  message?: string;
}

const WindowLoading: React.FC<WindowLoadingProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        color: '#444',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          border: '5px solid #e0e0e0',
          borderTop: '5px solid #0055aa',
          borderRadius: '50%',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite',
        }}
      />

      <p style={{ margin: 0, textAlign: 'center' }}>{message}</p>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WindowLoading;