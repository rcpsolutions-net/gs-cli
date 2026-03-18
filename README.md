# gs-cli

A command-line interface for interacting with the [Greenshades](https://www.greenshades.com/) HR/Payroll API. Query employees, paystubs, payroll settings, departments, positions, placements, and more directly from your terminal.

## Requirements

- Node.js (ES modules support required)
- A Greenshades account with API access (OAuth2 credentials)

## Installation

```bash
git clone <repo-url>
cd gs-cli
npm install
npm link
```

After linking, the `greenshades` command will be available globally.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
GREENSHADES_CLIENT_ID=your_client_id
GREENSHADES_CLIENT_SECRET=your_client_secret
GREENSHADES_WORKSPACE_ID=your_workspace_id
GREENSHADES_API_SCOPE=GO.Api.COR.read GO.Api.PAY.read GO.Api.PAY.Setup.read GO.Api.PAY.PayRuns.read GO.Api.PAY.Reporting.read
```

1. Authenticate:

```bash
greenshades auth login
```

You'll be prompted for your Client ID, Client Secret, and Workspace ID (defaults to `.env` values). On success, the token and workspace ID are stored locally for subsequent commands.

1. Verify setup:

```bash
greenshades test
greenshades auth status
```

## Commands

### Authentication

```bash
greenshades auth login       # Authenticate and save credentials
greenshades auth logout      # Clear stored credentials
greenshades auth status      # Show current authentication status
```

### Employees

```bash
greenshades employee list [--nativeId <id>]    # List all employees, optionally filtered
greenshades employee pull <employeeId>          # Get a single employee by ID
greenshades employee dependents <employeeId>    # Get employee dependents
greenshades employee contacts <employeeId>      # Get employee contacts
greenshades employee customFields <employeeId>  # Get employee custom fields
```

### Paystubs

```bash
greenshades paystubs list                       # List paystubs from the last 2 days
greenshades paystubs details <payRecordId>      # Get a single paystub
greenshades paystubs employee <employeeId>      # Get all paystubs for an employee
greenshades paystubs payrun <payRunId>          # Get all paystubs for a pay run
```

### Employee Settings

```bash
greenshades settings pay-details <employeeId>   # Direct deposit settings
greenshades settings earn-codes <employeeId>    # Earning codes
greenshades settings tax-details <employeeId>   # Tax information
greenshades settings pay-schedule <employeeId>  # Pay schedule
greenshades settings time-off <employeeId>      # Time-off balances
greenshades settings benefits <employeeId>      # Benefit codes
greenshades settings deductions <employeeId>    # Deduction codes
```

### Departments

```bash
greenshades department list                     # List all departments
greenshades department details <code>           # Get a department by code
```

### Locations

```bash
greenshades locations list                      # List all work locations
greenshades locations details <code>            # Get a location by code
```

### Positions

```bash
greenshades positions list                          # List all positions
greenshades positions details <code>                # Get a position by code
greenshades positions worker-compensation-codes     # List worker compensation codes
```

### Placements

```bash
greenshades placements list                     # List all placements
greenshades placements employee <employeeId>    # Get placements for an employee
greenshades placements details <placementId>    # Get a single placement
```

### Webhooks

```bash
greenshades webhooks list                                          # List all webhook subscriptions
greenshades webhooks details <webhookId>                           # Get a webhook subscription by ID
greenshades webhooks create <event-name> <callback-url> [hmac-key] # Create a new webhook subscription
greenshades webhooks delete <id>                                   # Delete a webhook subscription
greenshades webhooks subscribe <id> <event-name>                   # Add an event to an existing subscription
greenshades webhooks unsubscribe <id> <event-name>                 # Remove an event from an existing subscription
```

## Configuration

After login, credentials are persisted locally via [`conf`](https://github.com/sindresorhus/conf):

| Platform | Path                                        |
|----------|---------------------------------------------|
| Linux    | `~/.config/gs-cli/config.json`              |
| macOS    | `~/Library/Preferences/gs-cli/config.json`  |
| Windows  | `%APPDATA%\gs-cli\config.json`              |

The stored config contains the access token and workspace ID. Treat this file as sensitive.

## License

ISC
