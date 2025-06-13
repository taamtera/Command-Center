const express = require("express");
const catalystSDK = require("zcatalyst-sdk-node");
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const catalyst = catalystSDK.initialize(req);
  res.locals.catalyst = catalyst;
  next();
});
//GET API. Get existing tasks if any from the server.
app.get("/all", async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 100;
    const sort = req.query.sort || "CREATEDTIME";
    const order = req.query.order === "asc" ? "asc" : "desc";
    const type = req.query.type;
    const LID = req.query.LID;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const zcql = catalyst.zcql();

    // Build WHERE clause for filters (now using direct ROWID, no JOINs needed)
    let whereClauses = [];
    if (type && type.trim() !== "" && LID && LID.trim() !== "") {
      whereClauses.push(`Logs.` + type + ` = '${parseInt(LID)}'`);
    }
    if (startDate) whereClauses.push(`CREATEDTIME >= '${startDate}'`);
    if (endDate) whereClauses.push(`CREATEDTIME <= '${endDate}'`);
    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";
    // Count query with filters
    const countRows = await zcql.executeZCQLQuery(
      `SELECT COUNT(Logs.ROWID) FROM Logs ${where}`
    );
    const totalCount = parseInt(countRows[0].Logs.ROWID);
    const hasMore = totalCount > page * perPage;
    // Data query with filters
    const Logs = await zcql
      .executeZCQLQuery(
        `SELECT Logs.* FROM Logs ${where} ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${
          (page - 1) * perPage + 1
        },${perPage}`
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row.Logs,
        }))
      );
    res.status(200).send({
      status: "success",
      data: {
        Logs,
        hasMore,
      },
    });
  } catch (err) {
    console.error(err); // Use error for production
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});
// POST API. Contains the logic to create a task
app.post("/log", async (req, res) => {
  try {
    const body = req.body;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const lookups = await zcql
      .executeZCQLQuery("SELECT * FROM Lookups")
      .then((data) =>
        data.reduce((acc, lookup) => {
          acc[lookup.Lookups.ROWID] = { ...lookup.Lookups };
          return acc;
        }, {})
      );

    const table = catalyst.datastore().table("Logs");
    // Helper to get or create lookup
    async function getOrCreateLookup(type, value, LID = null) {
      const id = Object.keys(lookups).find(
        (key) =>
          lookups[key].Type === type &&
          lookups[key].Value === value &&
          lookups[key].LID === LID
      );
      if (id) {
        return id;
      }
      // If not found, create a new lookup
      const lookupTable = await catalyst
        .datastore()
        .table("Lookups")
        .insertRow({
          Type: type,
          Value: value,
          LID: LID,
        });
      return lookupTable.ROWID;
    }
    // Get or create Project/App/Function lookup IDs
    const projectId = await getOrCreateLookup("Project", body.Project);
    const appId = await getOrCreateLookup("App", body.App, projectId);
    const functionId = await getOrCreateLookup(
      "Function",
      body.Function,
      appId
    );
    if (!body.Instance || body.Instance === "") {
      const epoch = Date.now();
      const rand = Math.floor(100 + Math.random() * 900); // 3 random digits
      body.Instance = `${epoch}${rand}`;
    }
    if (!body.Status || body.Status === "") {
      body.Status = "LOG"; // Default status if not provided
    }
    const { ROWID: id } = await table.insertRow({
      Project: projectId,
      App: appId,
      Function: functionId,
      Instance: body.Instance,
      Status: body.Status,
      Text: body.Text ? body.Text : "",
    });
    res.status(200).send({
      status: "success",
      data: {
        Logs: {
          id,
          ...body,
        },
      },
    });
  } catch (err) {
    console.error(err); // Use error for production
    res.status(500).send({
      status: "failure",
      message: err.message || "We're unable to process the request.",
      body: req.body,
    });
  }
});

app.get("/lookup", async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    // Fetch all lookup values
    const lookups = await zcql.executeZCQLQuery("SELECT * FROM Lookups");
    res.status(200).send({
      status: "success",
      data: {
        lookups,
      },
    });
  } catch (err) {
    console.error(err); // Use error for production
    res.status(500).send({
      status: "failure",
      message: "We're unable to process the request.",
    });
  }
});

module.exports = app;
