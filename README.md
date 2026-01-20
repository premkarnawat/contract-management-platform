# Contract Management Platform

## Overview

This project is a frontend-based Contract Management Platform built as part of an assignment.

The application allows users to create reusable contract blueprints, generate contracts from those blueprints, manage contract lifecycle states, and track contracts through a dashboard.

The focus of this project is on product thinking, clean UI flow, controlled state management, and maintainable frontend architecture.

---

## Features

### Blueprint Management

- Create reusable contract blueprints with custom names
- Add configurable fields:
  - **Text** — Free-form text input
  - **Date** — Date picker fields
  - **Signature** — Image upload for signatures
  - **Checkbox** — Boolean toggle fields
- **Drag-and-drop positioning** on a visual canvas with 20px snap-to-grid
- Interactive field editing directly on the canvas
- View, load, and delete saved blueprints
- Store field metadata (type, label, position, dimensions)

### Contract Creation

- Generate contracts from existing blueprints
- Inherit all fields from the selected blueprint
- Fill values based on field types
- Upload signature images
- Save as draft or send for signature immediately
- Prevent editing for locked or revoked contracts

### Contract Lifecycle Management

- Supported lifecycle states:
  - **Draft** — Initial creation state, fully editable
  - **Active** — Contract is active and in use
  - **Pending** — Awaiting signature
  - **Signed** — Contract has been signed
  - **Revoked** — Contract has been cancelled
- Controlled state transitions with contextual action buttons
- UI displays current status with color-coded badges
- Draft contracts can be edited; others are read-only
- Revoked contracts cannot proceed further

### Contract Dashboard

- Tabular view of all contracts
- Filter contracts by status (All, Draft, Active, Pending, Signed, Revoked)
- Search contracts by title or blueprint name
- View contract details with all field values
- Edit draft contracts
- Change status based on lifecycle rules
- Semantic status badges with color coding:
  - 🟢 Green — Signed
  - 🟡 Amber — Pending
  - 🔵 Blue — Active
  - ⚫ Gray — Revoked

---

## Tech Stack & Justification

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI library for building interactive interfaces |
| **Vite** | Fast build tool with hot module replacement for rapid development |
| **TypeScript** | Type safety, improved code readability, and maintainability |
| **Tailwind CSS** | Utility-first CSS framework for rapid, consistent styling |
| **shadcn/ui** | High-quality, accessible component library built on Radix UI |
| **React Router** | Client-side routing for seamless navigation |
| **date-fns** | Lightweight date formatting and manipulation |
| **Lucide React** | Clean, consistent icon library |
| **LocalStorage** | Client-side persistence for blueprints and contracts |

---

## Architecture & Design Decisions

### Component Architecture
- **Separation of Concerns**: UI components, pages, and types are clearly separated
- **Reusable Components**: Field palette, canvas fields, and status badges are modular
- **Layout Components**: Consistent AppLayout wrapper for all pages

### State Management
- React `useState` for local component state
- LocalStorage for persistence across sessions
- Blueprint and contract states are managed separately to avoid coupling templates with actual contract instances

### Blueprint Canvas
- Visual drag-and-drop field placement
- 20px snap-to-grid for precise alignment
- Real-time preview during drag operations
- Interactive field editing (text input, signature upload, checkbox toggle)

### Contract Lifecycle
- Lifecycle rules are enforced through conditional action rendering
- Status-based permissions (edit only drafts, revoke pending/active)
- Centralized status update logic with toast notifications

### Design System
- Semantic color tokens defined in CSS variables
- Consistent spacing and typography
- Light/dark mode support through CSS custom properties
- Professional, enterprise-focused aesthetic

---

## Contract Lifecycle Design

The contract lifecycle follows a strict, controlled flow:

```
┌─────────┐     ┌─────────┐     ┌────────┐
│  Draft  │ ──▶ │ Pending │ ──▶ │ Signed │
└─────────┘     └─────────┘     └────────┘
     │               │
     │               ▼
     │          ┌─────────┐
     │          │ Revoked │
     │          └─────────┘
     │               ▲
     ▼               │
┌─────────┐          │
│ Active  │ ─────────┘
└─────────┘
```

### State Transitions

| From State | Available Actions |
|------------|-------------------|
| Draft | Edit, Send for Signature |
| Pending | Mark as Signed, Revoke |
| Active | Revoke |
| Signed | View only |
| Revoked | View only |

---

## Project Structure

```
src/
├── components/
│   ├── blueprint/
│   │   ├── BlueprintCanvas.tsx    # Visual field placement canvas
│   │   ├── BlueprintList.tsx      # Saved blueprints list
│   │   ├── BlueprintViewer.tsx    # Blueprint preview dialog
│   │   ├── CanvasField.tsx        # Interactive canvas field
│   │   └── FieldPalette.tsx       # Field type selector
│   ├── layout/
│   │   └── AppLayout.tsx          # Main application layout
│   └── ui/                        # shadcn/ui components
├── pages/
│   ├── Dashboard.tsx              # Contract list and management
│   ├── BlueprintBuilder.tsx       # Blueprint creation tool
│   ├── ContractCreation.tsx       # New contract form
│   ├── ContractView.tsx           # Contract detail view
│   ├── ContractEdit.tsx           # Contract editing form
│   └── NotFound.tsx               # 404 page
├── types/
│   └── contract.ts                # TypeScript interfaces
├── hooks/                         # Custom React hooks
└── lib/                           # Utility functions
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/premkarnawat/contract-management-platform.git
cd contract-management-platform

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage Guide

### Creating a Blueprint

1. Navigate to **Blueprints** from the sidebar
2. Enter a blueprint name
3. Click on field types (Text, Date, Signature, Checkbox) in the palette
4. Click on the canvas to place fields
5. Drag fields to reposition (snaps to 20px grid)
6. Double-click fields to edit labels or values
7. Click **Save Blueprint**

### Creating a Contract

1. Click **New Contract** from the Dashboard
2. Enter a contract title
3. Select a blueprint from the dropdown
4. Fill in the field values
5. Upload signatures as needed
6. Save as draft or send for signature

### Managing Contracts

1. View all contracts in the Dashboard
2. Use filters and search to find contracts
3. Click action buttons to:
   - **View**: See contract details
   - **Edit**: Modify draft contracts
   - **Send**: Move to pending status
   - **Mark Signed**: Complete the contract
   - **Revoke**: Cancel the contract

---

## Future Enhancements

- [ ] PDF export for contracts
- [ ] Contract duplication
- [ ] Field resize handles
- [ ] Undo/redo functionality
- [ ] Multi-party signatures
- [ ] Email notifications
- [ ] Backend integration with database

---

## License

This project was created for assignment purposes.

---

## Author

Built with [Lovable](https://lovable.dev)
