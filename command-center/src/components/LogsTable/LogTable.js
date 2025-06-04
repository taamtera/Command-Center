import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LogCard from "./LogCard";
import axios from "axios";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LogCardGhost from "./LogGhost";

const statusColors = {
  SUCCESS: "#2ecc40",
  PENDING: "#ffb300",
  ERROR: "#e53935",
  LOGGING: "#b2b8ff", // Default color for other statuses
};


// Helper to group logs by Project+App+Instance
function groupLogs(logs) {
  const groups = {};
  logs.forEach((log) => {
    const key = `${log.Project}||${log.App}||${log.Instance}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return groups;
}

function groupCardsByDate(groupKeys, grouped) {
  const dateMap = {};
  groupKeys.forEach((key) => {
    const group = grouped[key];
    if (!group || !group.length) return;
    const dateStr = group[0].CREATEDTIME
      ? group[0].CREATEDTIME.split(" ")[0]
      : "LOADING";
    if (!dateMap[dateStr]) dateMap[dateStr] = [];
    dateMap[dateStr].push({ key, group });
  });
  return Object.entries(dateMap)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([date, cards]) => ({ date, cards }));
}

const LogTable = ({ filters, setFilters }) => {
  const [logs, setLogs] = useState([]);
  const [perPage, setPerPage] = useState(300); // default to 300
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState({});
  // Popup state: which log card and which log index is open
  const [popup, setPopup] = useState({ groupKey: null, idx: null });

  // Fetch lookups only once (first load)
  useEffect(() => {
    if (Object.keys(lookups).length === 0) {
      axios.get("/server/command_center_function/lookup").then(response => {
        if (response.data.status === "success") {
            setLookups(response.data.data.lookups.reduce((acc, lookup) => {
            acc[lookup.Lookups.ROWID] = { ...lookup.Lookups };
            return acc;
          }, {}));
        } else {
          console.error("Failed to fetch lookups:", response.message);
        }
      });
    }
  }, [lookups]);

  useEffect(() => {
    setPage(1); // Reset to first page when filters or perPage changes
  }, [filters, perPage, setPage]);

  useEffect(() => {
    setLoading(true);
    const fetchLogs = async () => {
      // Add one day to endDate if present
      let endDateParam = filters.endDate ? (() => {
        const d = new Date(filters.endDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
      })() : null;
      if (perPage === 1000) {
        // For 1000, fetch 5 requests of 200 each
        let allLogs = [];
        let hasMoreAny = false;
        for (let i = 0; i < 5; i++) {
            const req = {
            params: {
              perPage: 200,
              page: (page - 1) * 5 + (i + 1),
              sort: "CREATEDTIME",
              order: "desc",
              endDate: endDateParam,
              type: filters.type || null,
              LID: filters.LID || null,
            },
          };
          const resp = await axios.get("/server/command_center_function/all", req);
          allLogs = allLogs.concat(resp.data.data.Logs || []);
          if (resp.data.data.hasMore) hasMoreAny = true;
          // If less than 200 returned, no more data
          if ((resp.data.data.Logs || []).length < 200) break;
        }
        setLogs(allLogs);
        setHasMore(hasMoreAny);
        setLoading(false);
      } else {
        // Normal paging
        const req = {params: {
              perPage,
              page,
              sort: "CREATEDTIME",
              order: "desc",
              startDate: filters.startDate ? filters.startDate: null,
              endDate: endDateParam,
              type: filters.type || null,
              LID: filters.LID || null,
            }
        }
        axios
          .get("/server/command_center_function/all", req)
          .then((response) => {
            setLogs(response.data.data.Logs || []);
            setHasMore(response.data.data.hasMore);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching:", error);
            setTimeout(fetchLogs, 200);
          });
      }
    };
    fetchLogs();
  }, [filters, perPage, page]);

  const grouped = groupLogs(logs);
  const groupKeys = Object.keys(grouped);
  const groupedByDate = groupCardsByDate(groupKeys, grouped);

  // Handler to open a popup for a specific log in a group
  const handleOpenPopup = (groupKey, idx) => {
    setPopup((prev) => {
      // If already open for this log, close it
      if (prev.groupKey === groupKey && prev.idx === idx) return { groupKey: null, idx: null };
      return { groupKey, idx };
    });
  };

  // Handler to close any open popup
  const handleClosePopup = () => setPopup({ groupKey: null, idx: null });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        p: 0,
        m: 0,
        position: 'relative',
        opacity: loading ? 1 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'opacity 0.2s',
      }}
      onClick={handleClosePopup}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ color: "#b2b8ff" }}>
            Logs
          </Typography>
          {/* Inline Date Pickers */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#b2b8ff', mr: 1 }}>From</Typography>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={e => {
                const newStart = e.target.value;
                setFilters(f => ({ ...f, startDate: newStart }));
              }}
              style={{
                background: '#23243a',
                color: '#e0e6ed',
                border: '1px solid #393a5a',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 14,
              }}
              max={filters.endDate || undefined}
            />
            <Typography variant="body2" sx={{ color: '#b2b8ff', mx: 1 }}>to</Typography>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={e => {
                const newEnd = e.target.value;
                setFilters(f => ({ ...f, endDate: newEnd }));
              }}
              style={{
                background: '#23243a',
                color: '#e0e6ed',
                border: '1px solid #393a5a',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 14,
              }}
              min={filters.startDate || undefined}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            value={perPage}
            onChange={e => setPerPage(Number(e.target.value))}
            size="small"
            sx={{ color: '#b2b8ff', minWidth: 80, background: '#23243a', borderRadius: 1 }}
          >
            <MenuItem value={300}>300 / page</MenuItem>
            <MenuItem value={1000}>1000 / page</MenuItem>
          </Select>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <button
              style={{
                background: '#23243a',
                color: '#b2b8ff',
                border: '1px solid #444',
                borderRadius: 4,
                padding: '2px 10px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                fontWeight: 600
              }}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <Typography variant="body2" sx={{ color: '#b2b8ff', minWidth: 40, textAlign: 'center' }}>{page}</Typography>
            <button
              style={{
                background: '#23243a',
                color: '#b2b8ff',
                border: '1px solid #444',
                borderRadius: 4,
                padding: '2px 10px',
                cursor: hasMore ? 'pointer' : 'not-allowed',
                opacity: hasMore ? 1 : 0.5,
                fontWeight: 600
              }}
              onClick={() => setPage(p => hasMore ? p + 1 : p)}
              disabled={!hasMore}
            >
              Next
            </button>
          </Box>
        </Box>
      </Box>
      {loading && (
        <Box sx={{ position: 'absolute', top: 80, left: 0, right: 0, zIndex: 10, px: 2 }}>
          {[...Array(6)].map((_, i) => (
            <LogCardGhost key={i} />
          ))}
        </Box>
      )}
      {!loading && (groupedByDate.length === 0 ? (
        <Typography sx={{ color: "#aaa" }}>No logs found.</Typography>
      ) : (
        groupedByDate.map(({ date, cards }) => (
          <React.Fragment key={date}>
            <Box sx={{ display: "flex", alignItems: "center", background: "#2a2c3d" }}>
              <Typography
                variant="caption"
                sx={{ 
                  color: "#b2b8ff", 
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  textAlign: 'left',
                  minWidth: 120,
                }}
              >
                {(() => {
                  // Format date as day month year
                  const [year, month, day] = date.split("-");
                  const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                  ];
                  return `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
                })()}
              </Typography>
              <Box sx={{ flex: 1, height: 1, background: "#2a2c3d", ml: 1 }} />
            </Box>
            {cards.map(({ key, group }) => {
              // Sort group by CREATEDTIME ascending before passing to LogCard
              const sortedGroup = group
                .slice()
                .sort(
                  (a, b) => new Date(a.CREATEDTIME) - new Date(b.CREATEDTIME)
                );
              const { Project, App, Instance, Function } = sortedGroup[0];
              const statusCounts = { SUCCESS: 0, PENDING: 0, ERROR: 0 };
              sortedGroup.forEach((log) => {
                if (statusCounts[log.Status] !== undefined)
                  statusCounts[log.Status]++;
              });
              const total = sortedGroup.length;
              const progressSections = Object.entries(statusCounts)
                .filter(([, count]) => count > 0)
                .map(([status, count]) => ({
                  status,
                  count,
                  color: statusColors[status],
                  width: `${(count / total) * 100}%`,
                }));
              const lastStatus = sortedGroup[sortedGroup.length - 1].Status;
              // Sort progressSections by the CREATEDTIME of the first log for each status (chronological left-to-right)
              const progressSectionsSorted = progressSections.slice().sort((a, b) => new Date(sortedGroup.find(log => log.Status === a.status).CREATEDTIME) - new Date(sortedGroup.find(log => log.Status === b.status).CREATEDTIME));
              // Replace IDs in sortedGroup with lookup values
              const displayGroup = sortedGroup.map(log => ({
                ...log,
                Project: lookups[log.Project]?.Value || log.Project,
                App: lookups[log.App]?.Value || log.App,
                Function: lookups[log.Function]?.Value || log.Function,
                Instance: lookups[log.Instance]?.Value || log.Instance,
              }));
              return (
                <LogCard
                  key={key}
                  keyProp={key}
                  group={displayGroup}
                  Project={lookups[Project]?.Value || Project}
                  App={lookups[App]?.Value || App}
                  Function={lookups[Function]?.Value || Function}
                  Instance={lookups[Instance]?.Value || Instance}
                  progressSections={progressSectionsSorted}
                  lastStatus={lastStatus}
                  statusColors={statusColors}
                  popupIdx={popup.groupKey === key ? popup.idx : null}
                  onBarClick={(idx) => handleOpenPopup(key, idx)}
                  onPopupClick={e => e.stopPropagation()}
                />
              );
            })}
          </React.Fragment>
        ))
      ))}
      {/* Optionally render popup component here if needed */}
    </Box>
  );
};



export default LogTable;
