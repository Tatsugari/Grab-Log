# GRAB & LOG — C# (ASP.NET Core Blazor)

Full rewrite of the tool-room inventory system in **C#** using ASP.NET Core Blazor Server.

## Requirements

- .NET 8 SDK  
  Download: https://dotnet.microsoft.com/download/dotnet/8.0

## Run

```bash
cd GrabLog
dotnet restore
dotnet run
```

Then open the URL shown in the terminal (usually `https://localhost:5xxx`).

## Screens (matching the new Figma)

1. **Welcome** (`/`) — Create User Account  
2. **Login** (`/login`) — Operator sign-in + Register terminal access  
3. **Inventory** (`/inventory`) — Tool cards, Borrow / Return  
4. **Control Registry** (`/registry`) — Admin table, status dropdown, Dispose  
5. Activity Logs / Operator Registry (placeholders)

## Logo

Your transparent logo is at `wwwroot/logo.png` and is used on every screen.

## Notes

- Auth and tools are in-memory (no database yet).
- Register → then Sign in with the same email/PIN.
- Admin can change status (Available / In Use / Overdue / Disposed) and Dispose tools.
