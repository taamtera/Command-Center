import React, { useState } from "react";
import Box from "@mui/material/Box";
import LogTable from "./LogsTable/LogTable";
import CustomDrawer from "./CustomDrawer";

const drawerWidth = 200;

const MainContent = ({ drawersVisible = true, setDrawersVisible }) => {
  const [filters, setFilters] = useState({
    project: "",
    app: "",
    startDate: null,
    endDate: null,
  });
  const [drawerState, setDrawerState] = useState({
    projectDrawerOpen: true,
    appDrawerOpen: false,
    funcDrawerOpen: false,
  });

  const numDrawers =
    1 +
    (drawerState.appDrawerOpen ? 1 : 0) +
    (drawerState.funcDrawerOpen ? 1 : 0);
  const leftOffset = drawerWidth * numDrawers;

  const handleDrawerFilters = ({ type, LID }) => {
    setFilters((f) => ({
      ...f,
      type,
      LID,
    }));
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: drawersVisible ? leftOffset : 0,
        width: drawersVisible ? `calc(100vw - ${leftOffset}px)` : "100vw",
        top: 0,
        height: "100dvh",
        background: "#181a2a",
        transition: "left 0.3s, width 0.3s",
        overflow: "hidden",
        display: "flex",
      }}
    >
      <CustomDrawer
        onApplyFilters={handleDrawerFilters}
        onDrawerStateChange={setDrawerState}
        drawersVisible={drawersVisible}
      />
      <main
        style={{
          flexGrow: 1,
          padding: 24,
          background: "#23243a",
          minHeight: "100dvh",
          color: "#e0e6ed",
          overflow: "auto",
        }}
      >
        <div style={{ height: 64 }} />
        <Box sx={{ mt: 4 }}>
          <LogTable filters={filters} setFilters={setFilters} />
        </Box>
      </main>
    </Box>
  );
};

export default MainContent;
