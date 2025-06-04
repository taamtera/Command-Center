import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import axios from "axios";
import PropTypes from "prop-types";

const drawerWidth = 200;

const CustomDrawer = ({ onApplyFilters, onDrawerStateChange, drawersVisible }) => {
  const [project, setProject] = useState("");
  const [app, setApp] = useState("");
  const [func, setFunc] = useState("");
  const [lookups, setLookups] = useState([]);
  const [ProjectsLookup, setProjectsLookup] = useState([]);
  const [AppsLookup, setAppsLookup] = useState([]);
  const [FunctionsLookup, setFunctionsLookup] = useState([]);
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const [funcDrawerOpen, setFuncDrawerOpen] = useState(false);

  // Fetch lookups only once (first load)
  useEffect(() => {
    if (lookups.length === 0) {
      axios.get("/server/command_center_function/lookup").then(response => {
        if (response.data.status === "success") {
          setLookups(response.data.data.lookups.map(opt => opt.Lookups) || []);
        } else {
          console.error("Failed to fetch lookups:", response.message);
        }
      });
    }
  }, []);

  // Update project list and selection when lookups change
  useEffect(() => {
    const filteredProjects = lookups.filter(opt => opt.Type === "Project");
    setProjectsLookup(filteredProjects);
    // Only reset project if not available in new list
    if (project && project.ROWID && !filteredProjects.some(opt => opt.ROWID === project.ROWID)) {
      setProject("");
    }
  }, [lookups]);

  // Update app list and selection when project changes
  useEffect(() => {
    const filteredApps = project && project.ROWID
      ? lookups.filter(opt => opt.Type === "App" && opt.LID === project.ROWID)
      : lookups.filter(opt => opt.Type === "App");
    setAppsLookup(filteredApps);
    // Only reset app if not available in new list
    if (app && app.ROWID && !filteredApps.some(opt => opt.ROWID === app.ROWID)) {
      setApp("");
    }
    setAppDrawerOpen(!!project);
    setFuncDrawerOpen(false);
  }, [project, lookups]);

  // Update function list and selection when app changes
  useEffect(() => {
    const filteredFuncs = app && app.ROWID
      ? lookups.filter(opt => opt.Type === "Function" && opt.LID === app.ROWID)
      : lookups.filter(opt => opt.Type === "Function");
    setFunctionsLookup(filteredFuncs);
    // Only reset func if not available in new list
    if (func && func.ROWID && !filteredFuncs.some(opt => opt.ROWID === func.ROWID)) {
      setFunc("");
    }
    setFuncDrawerOpen(!!app);
  }, [app, lookups]);

  // Notify parent of drawer state (no resets, just report open/close)
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange({
        projectDrawerOpen: true,
        appDrawerOpen,
        funcDrawerOpen
      });
    }
  }, [appDrawerOpen, funcDrawerOpen, onDrawerStateChange]);

  // Call onApplyFilters only when the selection changes and is not all (prevent feedback loop)
  useEffect(() => {
    if (func.ROWID) {
      onApplyFilters({
        type: 'Function',
        LID: func.ROWID,
      });
    } else if (app.ROWID) {
      onApplyFilters({
        type: 'App',
        LID: app.ROWID,
      });
    } else if (project.ROWID) {
      onApplyFilters({
        type: 'Project',
        LID: project.ROWID,
      });
    } else {
      onApplyFilters({
        type: '',
        LID: '',
      });
    }
  }, [project, app, func]);

  // Custom setter for Project that always clears App and Function
  const handleSetProject = (proj) => {
    setProject(proj);
    setApp("");
    setFunc("");
  };

  // Custom setter for App that always clears Function
  const handleSetApp = (ap) => {
    setApp(ap);
    setFunc("");
  };

  // Drawer list item generator
  const renderList = (items, selected, setSelected, label, allLabel) => (
    <>
      <Box sx={{ color: '#b2b8ff', fontWeight: 700, mb: 1 }}>{label}</Box>
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          background: selected === '' ? '#5c5cff' : 'transparent',
          color: selected === '' ? '#fff' : '#e0e6ed',
          cursor: 'pointer',
          mb: 0.5,
          fontWeight: selected === '' ? 700 : 400,
          '&:hover': { background: '#393a5a' },
        }}
        onClick={() => setSelected('')}
      >
        {allLabel}
      </Box>
      {items.length === 0 && <Box sx={{ color: '#888', fontSize: 13 }}>No options</Box>}
      {items.map(opt => (
        <Box
          key={opt.ROWID}
          sx={{
            p: 1,
            borderRadius: 1,
            background: selected && selected.ROWID === opt.ROWID ? '#5c5cff' : 'transparent',
            color: selected && selected.ROWID === opt.ROWID ? '#fff' : '#e0e6ed',
            cursor: 'pointer',
            mb: 0.5,
            fontWeight: selected && selected.ROWID === opt.ROWID ? 700 : 400,
            '&:hover': { background: '#393a5a' },
          }}
          onClick={() => setSelected(opt)}
        >
          {opt.Value}
        </Box>
      ))}
    </>
  );

  // Only render drawers if drawersVisible is true
  if (!drawersVisible) return null;

  return (
    <>
      {/* Project Drawer */}
      <Drawer
        variant="permanent"
        open={true}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 2,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#23243a',
            color: '#e0e6ed',
            overflow: 'hidden',
            zIndex: 2,
            left: 0,
            top: 0,
            height: '100vh',
            position: 'fixed',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          {renderList(ProjectsLookup, project, handleSetProject, 'Project', 'All Projects')}
        </Box>
      </Drawer>
      {/* App Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={appDrawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          left: drawerWidth,
          top: 0,
          height: '100vh',
          zIndex: appDrawerOpen ? 1 : -1,
          pointerEvents: appDrawerOpen ? 'auto' : 'none',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#23243a',
            color: '#e0e6ed',
            overflow: 'hidden',
            zIndex: appDrawerOpen ? 1 : -1,
            left: drawerWidth,
            top: 0,
            height: '100vh',
            position: 'fixed',
            pointerEvents: appDrawerOpen ? 'auto' : 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          {renderList(AppsLookup, app, handleSetApp, 'App', 'All Apps')}
        </Box>
      </Drawer>
      {/* Function Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={funcDrawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          left: drawerWidth * 2,
          top: 0,
          height: '100vh',
          zIndex: funcDrawerOpen ? 0 : -1,
          pointerEvents: funcDrawerOpen ? 'auto' : 'none',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#23243a',
            color: '#e0e6ed',
            overflow: 'hidden',
            zIndex: funcDrawerOpen ? 0 : -1,
            left: drawerWidth * 2,
            top: 0,
            height: '100vh',
            position: 'fixed',
            pointerEvents: funcDrawerOpen ? 'auto' : 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          {renderList(FunctionsLookup, func, setFunc, 'Function', 'All Functions')}
        </Box>
      </Drawer>
    </>
  );
};

CustomDrawer.propTypes = {
  onApplyFilters: PropTypes.func,
  onDrawerStateChange: PropTypes.func,
};

export default CustomDrawer;
