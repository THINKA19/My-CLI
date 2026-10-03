---
title: Mermaid Diagram Examples
description: Learn how to use Mermaid to create various diagrams in VitePress
layout: doc
aside: true
outline: [2, 3]
editLink: true
---

# Mermaid Diagram Examples

This page demonstrates how to use Mermaid to create various types of diagrams in VitePress.

## What is Mermaid?

Mermaid is a JavaScript-based diagramming tool that uses Markdown-inspired syntax to create and modify diagrams. With simple text descriptions, you can quickly create flowcharts, sequence diagrams, Gantt charts, and more.

## How to Use

Create Mermaid diagrams using ` ```mermaid ` code blocks in your Markdown documents:

## Flowchart

Flowcharts are used to show the steps and decision points in a process or system.

**Example:**

```mermaid
graph TD
    A[Start] --> B{Logged in?}
    B -->|Yes| C[Show Homepage]
    B -->|No| D[Redirect to Login]
    C --> E[Load User Data]
    D --> F[Enter Credentials]
    F --> G{Valid?}
    G -->|Yes| C
    G -->|No| H[Show Error]
    H --> F
    E --> I[End]
```

## Sequence Diagram

Sequence diagrams show the interaction order between objects.

**Example: User Login Flow**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>Frontend: Validate form
    Frontend->>Backend: Send login request
    Backend->>Database: Query user info
    Database-->>Backend: Return user data
    Backend->>Backend: Verify password
    alt Authentication successful
        Backend-->>Frontend: Return Token
        Frontend-->>User: Redirect to homepage
    else Authentication failed
        Backend-->>Frontend: Return error
        Frontend-->>User: Show error message
    end
```

## Class Diagram

Class diagrams show the structure of classes and relationships between them.

**Example:**

```mermaid
classDiagram
    class User {
        +String username
        +String email
        +String password
        +login()
        +logout()
        +changePassword()
    }
    
    class Admin {
        +String permissionLevel
        +deleteUser()
        +modifyPermission()
    }
    
    class Article {
        +String title
        +String content
        +Date createdAt
        +publish()
        +edit()
        +delete()
    }
    
    User <|-- Admin
    User "1" --> "*" Article : creates
```

## State Diagram

State diagrams show the different states of an object during its lifecycle.

**Example: Order Status Flow**

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Paid: Payment successful
    Pending --> Cancelled: Cancel order
    Paid --> Processing: Merchant confirms
    Processing --> Shipped: Ship
    Shipped --> Delivered: User receives
    Delivered --> Completed: Confirm receipt
    Paid --> Refunding: Request refund
    Refunding --> Refunded: Refund approved
    Refunding --> Paid: Refund rejected
    Cancelled --> [*]
    Completed --> [*]
    Refunded --> [*]
```

## Gantt Chart

Gantt charts are used for project management to show project progress and task scheduling.

**Example: Project Development Plan**

```mermaid
gantt
    title Project Development Timeline
    dateFormat  YYYY-MM-DD
    section Requirements
    Requirements Gathering    :a1, 2024-01-01, 7d
    Requirements Review       :after a1, 3d
    section Design
    UI Design                 :2024-01-11, 10d
    Database Design           :2024-01-11, 7d
    section Development
    Frontend Development      :2024-01-21, 20d
    Backend Development       :2024-01-21, 20d
    section Testing
    Unit Testing              :2024-02-10, 7d
    Integration Testing       :2024-02-17, 5d
    section Deployment
    Production Deployment     :2024-02-22, 3d
```

## Pie Chart

Pie charts show the proportion of data.

**Example: Tech Stack Distribution**

```mermaid
pie title Tech Stack Distribution
    "Vue.js" : 35
    "TypeScript" : 25
    "Node.js" : 20
    "CSS/SCSS" : 12
    "Others" : 8
```

## Git Graph

Git graphs show Git branches and commit history.

**Example:**

```mermaid
gitGraph
    commit id: "Initialize project"
    commit id: "Add basic config"
    branch develop
    checkout develop
    commit id: "Develop new feature"
    commit id: "Feature testing"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
    commit id: "Release v1.0.1"
```

## Entity Relationship Diagram

ER diagrams show the relationships between entities in a database.

**Example:**

```mermaid
erDiagram
    USER ||--o{ ORDER : creates
    USER {
        int id PK
        string username
        string email
        datetime registered_at
    }
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        int id PK
        int user_id FK
        decimal total_amount
        datetime created_at
    }
    PRODUCT ||--o{ ORDER_ITEM : purchased
    PRODUCT {
        int id PK
        string name
        decimal price
        int stock
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal subtotal
    }
```

## Mindmap

Mindmaps show hierarchical relationships between ideas and concepts.

**Example: Frontend Learning Path**

```mermaid
mindmap
  root((Frontend Dev))
    Fundamentals
      HTML
      CSS
      JavaScript
    Frameworks
      Vue.js
        Vue Router
        Vuex/Pinia
      React
        React Router
        Redux
      Angular
    Engineering
      Package Managers
        npm
        yarn
        pnpm
      Build Tools
        Webpack
        Vite
        Rollup
      Code Quality
        ESLint
        Prettier
    Performance
      Code Splitting
      Lazy Loading
      Caching Strategy
```

## More Resources

- [Mermaid Official Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Syntax Reference](https://mermaid.js.org/intro/syntax-reference.html)
