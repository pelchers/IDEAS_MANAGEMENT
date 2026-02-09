# Clerk Authentication Architecture

Visual guide to Clerk authentication flows, RBAC patterns, and webhook integration.

## Complete Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk UI
    participant CS as Clerk Service
    participant M as Middleware
    participant A as Next.js App
    participant D as Database

    U->>C: Visit sign-in page
    C->>U: Show auth form

    U->>C: Submit credentials
    C->>CS: Authenticate
    CS->>CS: Verify credentials

    alt Success
        CS-->>C: Session + JWT
        C-->>U: Redirect to app
        U->>M: Request page + JWT
        M->>CS: Verify JWT
        CS-->>M: Valid + claims
        M->>A: Allow access
        A->>D: Load user data
        D-->>A: User data
        A-->>U: Render page
    else Failed
        CS-->>C: Invalid credentials
        C-->>U: Show error
    end
```

## Middleware Protection Flow

```mermaid
graph TB
    A[User Request] --> B[Middleware]
    B --> C{Public Route?}

    C -->|Yes| D[Allow]
    C -->|No| E{Has Session?}

    E -->|No| F[Redirect to Sign In]
    E -->|Yes| G{JWT Valid?}

    G -->|No| F
    G -->|Yes| H{Has Required Role?}

    H -->|No| I[403 Forbidden]
    H -->|Yes| J[Pass to Page]

    D --> J
    J --> K[Render]

    style D fill:#90EE90
    style F fill:#FFB6C6
    style I fill:#FFB6C6
    style K fill:#90EE90
```

## Role-Based Access Control (RBAC)

```mermaid
graph TB
    A[User] --> B{User Type}

    B -->|PROFILE_OWNER| C[Profile Owner Permissions]
    B -->|BRAND_SPONSOR| D[Brand Sponsor Permissions]
    B -->|ADMIN| E[Admin Permissions]

    C --> C1[Create Profile]
    C --> C2[Edit Own Profile]
    C --> C3[View Analytics]

    D --> D1[Create Sponsorships]
    D --> D2[View Brand Dashboard]
    D --> D3[Manage Campaigns]

    E --> E1[All Permissions]
    E --> E2[User Management]
    E --> E3[System Config]

    style C fill:#87CEEB
    style D fill:#FFD700
    style E fill:#FFB6C6
```

## Webhook Event Processing

```mermaid
graph LR
    A[Clerk Event] --> B[Webhook Endpoint]
    B --> C[Verify Signature]

    C --> D{Valid?}
    D -->|No| E[401 Invalid]
    D -->|Yes| F{Event Type}

    F -->|user.created| G[Create User]
    F -->|user.updated| H[Update User]
    F -->|user.deleted| I[Delete User]
    F -->|session.created| J[Log Session]

    G --> K[Sync to DB]
    H --> K
    I --> K
    J --> K

    K --> L[200 OK]
    E --> M[Clerk Retries]

    style C fill:#FFD700
    style E fill:#FFB6C6
    style L fill:#90EE90
```

## User Metadata Strategy

```mermaid
graph TB
    A[User Metadata] --> B[Public Metadata]
    A --> C[Private Metadata]
    A --> D[Unsafe Metadata]

    B --> B1[Visible in JWT]
    B --> B2[User Type]
    B --> B3[Profile Slug]
    B --> B4[Readable by client]

    C --> C1[Not in JWT]
    C --> C2[Admin Notes]
    C --> C3[Internal IDs]
    C --> C4[Server-only]

    D --> D1[Set by client]
    D --> D2[Preferences]
    D --> D3[UI State]
    D --> D4[Not trusted]

    style B fill:#90EE90
    style C fill:#FFD700
    style D fill:#FFB6C6
```

## Authentication States

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Unauthenticated: No session
    Loading --> Authenticated: Has session

    Unauthenticated --> SigningIn: Click sign in
    SigningIn --> Authenticated: Success
    SigningIn --> Unauthenticated: Cancel/Error

    Authenticated --> ViewingProtectedPage: Navigate
    ViewingProtectedPage --> Authenticated: Active session

    Authenticated --> SessionExpired: Token expires
    SessionExpired --> SigningIn: Re-authenticate

    Authenticated --> SignedOut: Click sign out
    SignedOut --> Unauthenticated
```

## Multi-Tenant User Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk
    participant W as Webhook
    participant D as Database

    Note over U,D: User Registration

    U->>C: Sign up with email
    C->>C: Create Clerk user
    C->>W: user.created webhook

    W->>D: Create user record
    Note over D: userType: null

    U->>U: Select account type
    U->>C: Update metadata

    C->>W: user.updated webhook
    W->>D: Update userType

    alt Profile Owner
        D->>D: Create profile
        Note over D: userType: PROFILE_OWNER
    else Brand Sponsor
        D->>D: Create brand
        Note over D: userType: BRAND_SPONSOR
    end

    W-->>C: 200 OK
    C-->>U: Redirect to dashboard
```

## Session Management

```mermaid
graph TB
    A[User Logs In] --> B[Clerk Creates Session]
    B --> C[Generate JWT]
    C --> D[Store in Cookie]

    D --> E[User Makes Request]
    E --> F{JWT Valid?}

    F -->|Yes| G{Expired?}
    F -->|No| H[Redirect to Sign In]

    G -->|No| I[Access Granted]
    G -->|Yes| J{Can Refresh?}

    J -->|Yes| K[Refresh Token]
    J -->|No| H

    K --> C

    I --> L[Update Last Active]
    L --> M[Continue Session]

    style I fill:#90EE90
    style H fill:#FFB6C6
    style K fill:#FFD700
```

## Server vs Client Authentication

```mermaid
graph TB
    subgraph Server Components
        S1[auth from @clerk/nextjs] --> S2[Get userId]
        S2 --> S3[Check sessionClaims]
        S3 --> S4[Access metadata]
        S4 --> S5[Authorize action]
    end

    subgraph Client Components
        C1[useAuth hook] --> C2[Get isLoaded]
        C2 --> C3[Get userId]
        C3 --> C4[Check isSignedIn]
        C4 --> C5[Render UI]
    end

    subgraph Middleware
        M1[authMiddleware] --> M2[Protect routes]
        M2 --> M3[Set publicRoutes]
        M3 --> M4[Ignore routes]
    end

    style S5 fill:#90EE90
    style C5 fill:#87CEEB
    style M4 fill:#FFD700
```

## Organization & Team Support

```mermaid
erDiagram
    USERS ||--o{ ORGANIZATION_MEMBERS : belongs_to
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
    ORGANIZATIONS ||--o{ RESOURCES : owns
    ORGANIZATION_MEMBERS ||--o{ PERMISSIONS : grants

    USERS {
        string id PK
        string email
        string firstName
    }

    ORGANIZATIONS {
        string id PK
        string name
        string slug
    }

    ORGANIZATION_MEMBERS {
        string userId FK
        string orgId FK
        string role
    }

    PERMISSIONS {
        string memberId FK
        string resource
        string action
    }

    RESOURCES {
        string id PK
        string orgId FK
        string type
    }
```

## Custom Sign-In Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Custom Form
    participant C as Clerk API
    participant A as App

    U->>F: Enter email
    F->>C: signIn.create({identifier: email})
    C-->>F: SignIn object

    F->>C: prepareFirstFactor({strategy: "email_code"})
    C->>U: Send email code

    U->>F: Enter code
    F->>C: attemptFirstFactor({code})

    alt Valid code
        C-->>F: Session created
        F->>A: setActive({session})
        A-->>U: Redirect to dashboard
    else Invalid code
        C-->>F: Error
        F-->>U: Show error + retry
    end
```

## Social SSO Integration

```mermaid
graph TB
    A[User Clicks Sign In] --> B{Choose Method}

    B -->|Google| C1[OAuth: Google]
    B -->|GitHub| C2[OAuth: GitHub]
    B -->|Email| C3[Email/Password]

    C1 --> D1[Redirect to Google]
    C2 --> D2[Redirect to GitHub]
    C3 --> D3[Show Clerk Form]

    D1 --> E1[User Authorizes]
    D2 --> E2[User Authorizes]
    D3 --> E3[User Submits]

    E1 --> F[Clerk Creates Session]
    E2 --> F
    E3 --> F

    F --> G{First Time?}
    G -->|Yes| H[Trigger user.created webhook]
    G -->|No| I[Return existing user]

    H --> J[Create DB record]
    I --> J
    J --> K[Redirect to App]

    style F fill:#90EE90
    style J fill:#87CEEB
```

## Authorization Check Pattern

```mermaid
graph TB
    A[Request to Protected Resource] --> B[Extract User ID]
    B --> C{Authenticated?}

    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Load User]

    E --> F{Has Role?}
    F -->|No| G[403 Forbidden]
    F -->|Yes| H[Load Resource]

    H --> I{Owns Resource?}
    I -->|No| G
    I -->|Yes| J[Check Permissions]

    J --> K{Can Perform Action?}
    K -->|No| G
    K -->|Yes| L[Allow Access ✓]

    style D fill:#FFB6C6
    style G fill:#FFB6C6
    style L fill:#90EE90
```

## Webhook Retry Strategy

```mermaid
graph TB
    A[Event Occurs] --> B[Send Webhook]
    B --> C{Success?}

    C -->|200 OK| D[Complete ✓]
    C -->|Other| E[Retry 1: Wait 1s]

    E --> F{Success?}
    F -->|200 OK| D
    F -->|Other| G[Retry 2: Wait 5s]

    G --> H{Success?}
    H -->|200 OK| D
    H -->|Other| I[Retry 3: Wait 15s]

    I --> J{Success?}
    J -->|200 OK| D
    J -->|Other| K[Mark Failed ✗]

    K --> L[Alert Developers]

    style D fill:#90EE90
    style K fill:#FFB6C6
    style L fill:#FFB6C6
```

## Multi-Factor Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk
    participant T as TOTP App

    U->>C: Enable 2FA
    C-->>U: Show QR code
    U->>T: Scan QR code
    T-->>U: Generate codes

    Note over U,T: Future login

    U->>C: Enter password
    C-->>U: Request 2FA code

    U->>T: Get current code
    T-->>U: 6-digit code

    U->>C: Submit code
    C->>C: Verify code

    alt Valid code
        C-->>U: Grant session
    else Invalid code
        C-->>U: Deny + retry
    end
```

## Convex Integration

```mermaid
sequenceDiagram
    participant C as Client
    participant CV as Convex
    participant CK as Clerk

    C->>C: User signs in
    C->>CV: Query with JWT
    CV->>CK: Verify JWT
    CK-->>CV: Valid + User claims

    CV->>CV: ctx.auth.getUserIdentity()
    Note over CV: Extract user data

    alt Authenticated
        CV->>CV: Execute query
        CV-->>C: Return data
    else Not authenticated
        CV-->>C: Throw error
    end
```

