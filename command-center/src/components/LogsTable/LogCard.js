import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LogCardPopup from "./LogCardPopup";

function LogCard({
  group,
  keyProp,
  Project,
  App,
  Function,
  Instance,
  lastStatus,
  statusColors,
  popupIdx,
  onBarClick,
  onPopupClick,
}) {
  return (
    <Box
      key={keyProp}
      sx={{
        background: "#2a2c3d",
        borderLeft: `6px solid ${statusColors[lastStatus] || "#b2b8ff"}`,
        color: "#fff",
        borderTop: "1px solid #181a2a",
        borderRadius: 0,
        px: 2,
        py: 1.5,
        mb: 0,
        position: "relative",
      }}
      onClick={onPopupClick}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, mb: 0.5, color: "#fff", fontSize: "1rem" }}
      >
        Project: {Project} | App: {App} | Function: {Function} | Instance: {Instance}
      </Typography>
      {/* Multi-color progress bar, clickable, no rounded corners */}
      <Box
        sx={{
          display: "flex",
          height: 18,
          borderRadius: 0,
          overflow: "hidden",
          mb: 2,
          gap: 0.5,
        }}
      >
        {group.map((log, idx) => {
          // Assign LOGGING status if not in SUCCESS, PENDING, ERROR
          const normalizedStatus = ["SUCCESS", "PENDING", "ERROR"].includes(log.Status)
            ? log.Status
            : "LOGGING";
          const section = {
            status: normalizedStatus,
            color: statusColors[normalizedStatus],
            width: `${100 / group.length}%`,
            idx,
          };
          let displayText = "";
          if (log.CREATEDTIME) {
            if (idx === 0) {
              // First bar: show time only
              const timeOnly =
                log.CREATEDTIME.split(" ")[1]?.split(":").slice(0, 3).join(":") ||
                log.CREATEDTIME;
              displayText = timeOnly;
            } else {
              // Show seconds from the first in the group, formatted as 0.00 seconds
              const firstTime = new Date(group[0].CREATEDTIME);
              const thisTime = new Date(log.CREATEDTIME);
              const diffMs = thisTime - firstTime;
              const diffSec = diffMs / 1000;
              displayText = `+ ${diffSec.toFixed(2)}s`;
            }
          }
          return (
            <Box
              key={idx}
              ref={el => {
                if (popupIdx === idx) {
                  // Save the DOM node for the clicked bar section
                  window.__lastBarSection = el;
                }
              }}
              sx={{
                width: section.width,
                background: section.color,
                height: "100%",
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                transition: "box-shadow 0.2s",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                fontSize: "0.85em",
                fontWeight: 600,
                color: "#000",
                letterSpacing: 0.5,
                px: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onBarClick(idx);
              }}
            >
              {displayText}
            </Box>
          );
        })}
      </Box>
      {/* Popup card for the selected log, shown only if clicked */}
      {popupIdx !== null && (
        <LogCardPopup
          logs={[{
            ...group[popupIdx],
          }]}
          status={[
            "SUCCESS",
            "PENDING",
            "ERROR"
          ].includes(group[popupIdx].Status)
            ? group[popupIdx].Status
            : "LOGGING"}
          statusColors={statusColors}
          onClose={() => onBarClick(null)}
          barIdx={popupIdx}
        />
      )}
    </Box>
  );
}

export default LogCard;
