import React from 'react';

function FullHeight({ children }) {
  const height = window.innerHeight;
  return (
    <div style={{ height }}>
      { children }
    </div>
  );
}

export default FullHeight;
