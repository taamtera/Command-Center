import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function LogCardPopup({ logs, status, statusColors, onClose, sxOverride, barIdx }) {
  const popupRef = useRef(null);
  const [leftOffset, setLeftOffset] = useState(10);

  useEffect(() => {
    // Try to find the DOM node for the clicked bar section
    if (typeof barIdx === 'number' && window.__lastBarSection) {
      const barRect = window.__lastBarSection.getBoundingClientRect();
      const parentRect = window.__lastBarSection.parentElement.getBoundingClientRect();
      // Calculate the left offset relative to the parent
      let offset = barRect.left - parentRect.left;
      // Limit so popup doesn't overflow right
      const popupWidth = 380; // average width, matches minWidth/maxWidth
      const parentWidth = parentRect.width;
      if (offset + popupWidth > parentWidth) {
        offset = Math.max(10, parentWidth - popupWidth - 10);
      }
      setLeftOffset(offset);
    } else {
      setLeftOffset(10);
    }
  }, [barIdx]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={popupRef}
      sx={{
        position: "absolute",
        top: 70,
        left: leftOffset + 10,
        zIndex: 10,
        minWidth: 340,
        maxWidth: 480,
        width: 380,
        background: "#23243a",
        border: `2px solid ${statusColors[status]}`,
        borderRadius: 0,
        boxShadow: "0 8px 32px 0 #000a",
        p: 2,
        color: "#fff",
        fontFamily: "Fira Mono, monospace",
        fontSize: "1.05em",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        ...(sxOverride || {}),
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: statusColors[status], mb: 1, fontWeight: 700 }}
      >
        {status}
      </Typography>
      {logs.map((log, i, arr) => (
        <Box key={log.id || i} sx={{ mb: 2 }}>
          <Box sx={{ mb: 0.5 }}>
            <strong>Project:</strong> {log.Project}
            <br />
            <strong>App:</strong> {log.App}
            <br />
            <strong>Function:</strong> {log.Function}
            <br />
            <strong>Instance:</strong> {log.Instance}
            <br />
            <strong>Status:</strong> {log.Status}
            <br />
            <strong>Created:</strong> {log.CREATEDTIME}
            <br />
          </Box>
          <Box
            component="pre"
            sx={{
              background: "#181a2a",
              borderRadius: 0,
              p: 1,
              color: "#fff",
              fontFamily: "Fira Mono, monospace",
              fontSize: "0.98em",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
            }}
          >
            {log.Text}
          </Box>
          {i !== arr.length - 1 && (
            <Box sx={{ borderBottom: "1px solid #444", my: 1 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}

export default LogCardPopup;
