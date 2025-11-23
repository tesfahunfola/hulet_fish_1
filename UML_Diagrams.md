# UML Diagrams for Hulet Fish Platform



## Sequence Diagram for Booking Process

```mermaid
sequenceDiagram
    participant Tourist
    participant Frontend
    participant Backend API
    participant Database
    participant Payment Gateway
    participant Email Service

    Tourist->>Frontend: Select tour and initiate booking
    Frontend->>Backend API: POST /api/bookings (tourId, userId, price)
    Backend API->>Database: Create booking record (paid: false)
    Database-->>Backend API: Booking created
    Backend API->>Payment Gateway: Initiate payment with Chapa API
    Payment Gateway-->>Backend API: Payment URL or token
    Backend API-->>Frontend: Return payment details
    Frontend-->>Tourist: Redirect to payment page

    Tourist->>Payment Gateway: Complete payment
    Payment Gateway->>Backend API: Payment callback (success/failure)
    Backend API->>Database: Update booking (paid: true)
    Backend API->>Email Service: Send booking confirmation email
    Backend API->>Database: Create EcoScore for booking
    Database-->>Backend API: EcoScore created
    Backend API-->>Frontend: Booking confirmed
    Frontend-->>Tourist: Show booking success and eco-score
```

## Use Case Diagram

```mermaid
graph TD
    A[Tourist] --> B[Register Account]
    A --> C[Login]
    A --> D[Browse Tours]
    A --> E[Book Tour]
    A --> F[View Eco-Score]
    A --> G[Purchase Carbon Offset]
    A --> H[Leave Review]

    I[Host] --> J[Register as Host]
    I --> K[Login]
    I --> L[Create Tour Listing]
    I --> M[Manage Bookings]
    I --> N[View Earnings]
    I --> O[Update Profile]

    P[Admin] --> Q[Login]
    P --> R[Manage Users]
    P --> S[Manage Tours]
    P --> T[View Analytics]
    P --> U[Manage Carbon Offsets]
    P --> V[Manage Emission Factors]
```

## Activity Diagram for Eco-Score Calculation

```mermaid
flowchart TD
    A[Booking Created] --> B[Populate Tour Data]
    B --> C[Calculate Transport Emissions]
    C --> D[Calculate Activity Emissions]
    D --> E[Assess Waste Impact]
    E --> F[Apply Local Benefit Bonus]
    F --> G[Compute Total Emissions]
    G --> H[Calculate Eco-Score]
    H --> I{Score >= 80?}
    I -->|Yes| J[Category: Excellent]
    I -->|No| K{Score >= 60?}
    K -->|Yes| L[Category: Good]
    K -->|No| M{Score >= 40?}
    M -->|Yes| N[Category: Moderate]
    M -->|No| O[Category: Poor]
    J --> P[Generate Recommendations]
    L --> P
    N --> P
    O --> P
    P --> Q[Save Eco-Score]
    Q --> R[Return to User]
```

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Booking : makes
    User ||--o{ EcoScore : has
    Tour ||--o{ Booking : booked_for
    Booking ||--|| EcoScore : generates
    Booking ||--o{ CarbonOffset : offsets_via
    EmissionFactor ||--o{ EcoScore : used_for

    User {
        string name
        string email
        string role
        string region
        string gender
        boolean isVerified
    }

    Tour {
        string name
        number duration
        number price
        string difficulty
        object emissionData
    }

    Booking {
        objectId tour
        objectId user
        number price
        boolean paid
        object ecoData
    }

    EcoScore {
        objectId user
        objectId trip
        number ecoScore
        string category
        number transportEmissions
        number activityEmissions
    }

    CarbonOffset {
        string name
        string type
        number costPerKg
        string location
        boolean active
    }

    EmissionFactor {
        string transportType
        number emissionFactor
        string unit
        boolean active
    }
