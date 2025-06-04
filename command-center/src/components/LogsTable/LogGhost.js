import React from "react";
import Box from "@mui/material/Box";

// Add shimmer effect CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}`;

// Inject shimmer style into the document head once
if (typeof window !== 'undefined' && !document.getElementById('shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'shimmer-style';
  style.innerHTML = shimmerKeyframes;
  document.head.appendChild(style);
}

export default function LogCardGhost() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      mb: 2,
      background: '#23243a',
      borderRadius: 2,
      p: 2,
      minHeight: 64,
      boxShadow: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box
        sx={{
          height: 18,
          width: '40%',
          mb: 1,
          borderRadius: 1,
          background: 'linear-gradient(90deg, #23243a 25%, #393a5a 50%, #23243a 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.2s infinite',
        }}
      />
      <Box
        sx={{
          height: 12,
          width: '80%',
          mb: 0.5,
          borderRadius: 1,
          background: 'linear-gradient(90deg, #23243a 25%, #393a5a 50%, #23243a 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.2s infinite',
        }}
      />
      <Box
        sx={{
          height: 12,
          width: '60%',
          borderRadius: 1,
          background: 'linear-gradient(90deg, #23243a 25%, #393a5a 50%, #23243a 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.2s infinite',
        }}
      />
    </Box>
  );
}
