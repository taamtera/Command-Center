# Command Center frontend

This directory contains the React single-page application for the Command
Center log viewer. It provides the Material UI shell, hierarchical
Project/App/Function filters, date filtering, pagination, grouped execution
cards, and log detail popups.

See the repository [README](../README.md) for the complete product overview,
architecture, API reference, DataStore model, and Catalyst deployment notes.

## Scripts

Run these commands from this directory:

```bash
npm start
npm test
npm run build
```

The application calls the Catalyst function through:

```text
/server/command_center_function/lookup
/server/command_center_function/all
```

For local development, provide a Catalyst-compatible proxy or deployed
function for those paths if live lookup and log data are required.
