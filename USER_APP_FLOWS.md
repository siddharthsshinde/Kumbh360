# 🏗️ USER APP FLOWS & SUPERADMIN INTEGRATION DIAGRAMS

## 1️⃣ COMPLETE USER REGISTRATION FLOW (Pilgrim)

```mermaid
graph TD
    A["👤 User Opens APP"] --> B["Fill Registration Form<br/>Email, Phone, Name"]
    B --> C["Submit Registration"]
    C --> D["POST /api/user/register"]
    
    D --> E["✅ Backend Validation<br/>- Check email exists<br/>- Validate phone format<br/>- Hash password"]
    
    E --> F{Email Verified?}
    F -->|No| G["Send Verification Link"]
    F -->|Yes| H["User Status: active"]
    
    G --> G1["User Clicks Email Link"]
    G1 --> H
    
    H --> I["Prompt for KYC Upload"]
    I --> J["User Uploads Documents<br/>- Aadhar/ID Proof<br/>- Address Proof<br/>- Selfie"]
    
    J --> K["POST /api/user/kyc-upload"]
    K --> L["Files Stored in Secure Cloud"]
    
    L --> M["📱 SUPERADMIN PANEL<br/>KYC Documents in Queue"]
    M --> N["Admin Reviews<br/>- Verify authenticity<br/>- Check fraud database<br/>- Approve/Reject"]
    
    N --> O{Approved?}
    O -->|Yes| P["Update Status: kyc_approved"]
    O -->|No| Q["Send Rejection Reason<br/>Allow Resubmit"]
    
    P --> R["🎉 User Fully Activated<br/>Can Book Hotels/Cabs/Restaurants"]
    Q --> Q1["User Corrects & Resubmits"]
    Q1 --> M
    
    style A fill:#e1f5ff
    style M fill:#fff3e0
    style R fill:#c8e6c9
```

---

## 2️⃣ HOTEL BOOKING FLOW (User → Superadmin)

```mermaid
graph TD
    A["🏨 User Searches Hotels"] --> B["Filter by<br/>- Date Range<br/>- Budget<br/>- Location<br/>- Rating"]
    
    B --> C["GET /api/user/hotels/search"]
    C --> D["BACKEND returns<br/>matching listings"]
    
    D --> E["User Selects Hotel"]
    E --> F["View Details<br/>- Photos<br/>- Reviews<br/>- Price<br/>- Availability"]
    
    F --> G["Click 'Book Now'"]
    G --> H["POST /api/user/bookings/create<br/>{hotel_id, dates, rooms, guests}"]
    
    H --> I["✅ Backend Processing<br/>- Create booking_id<br/>- Reserve rooms<br/>- Calculate total amount<br/>- Set status: pending"]
    
    I --> J["Generate Payment Link<br/>Amount: ₹5,000<br/>Commission(10%): ₹500<br/>Net to Hotel: ₹4,500"]
    
    J --> K["👤 User Pays<br/>Card/UPI/Wallet"]
    K --> L["POST /api/user/payments/confirm"]
    
    L --> M["✅ Payment Verified<br/>from Payment Gateway"]
    M --> N["Update Booking<br/>Status: confirmed"]
    
    N --> O["💰 SUPERADMIN SEES<br/>- Transaction in Dashboard<br/>- Commission calculated<br/>- Supplier payout scheduled"]
    
    O --> P["📧 Hotel Owner Notified<br/>New Booking Received<br/>Booking Details Sent"]
    
    P --> Q["📧 User Confirmation<br/>Booking ID, Receipt, Hotel Details"]
    
    Q --> R["💾 Record in Database<br/>- bookings table<br/>- payments table<br/>- settlements table (pending)"]
    
    style A fill:#e1f5ff
    style O fill:#fff3e0
    style R fill:#c8e6c9
```

---

## 3️⃣ COMPLAINT & DISPUTE RESOLUTION FLOW

```mermaid
graph TD
    A["😞 User Has Issue"] --> B["Examples:<br/>- Hotel Poor Condition<br/>- Cab Driver Behavior<br/>- Wrong Order Delivered"]
    
    B --> C["POST /api/user/complaints/create"]
    C --> D["User Fills Form:<br/>- Issue Type<br/>- Description<br/>- Photos/Evidence<br/>- Amount (if refund claim)"]
    
    D --> E["Submit Complaint"]
    E --> F["✅ Complaint Queued"]
    F --> G["📋 SUPERADMIN PANEL<br/>Complaint appears in Queue"]
    
    G --> H["AI Auto-Categorizes<br/>- Extracts keywords<br/>- Sets priority<br/>- Identifies type"]
    
    H --> I{"Priority?"}
    I -->|Critical| J["Assign to Senior Admin<br/>SLA: 2 hours"]
    I -->|High| K["Assign to Admin<br/>SLA: 6 hours"]
    I -->|Medium/Low| L["Assign to Support<br/>SLA: 24 hours"]
    
    J --> M["Admin Reviews<br/>- Contact user<br/>- Contact supplier<br/>- Review evidence"]
    K --> M
    L --> M
    
    M --> N{"Resolution Decision"}
    
    N -->|Refund| O["Process Refund<br/>- Verify amount<br/>- Reverse payment<br/>- Send to user wallet"]
    N -->|Warning| P["Send Warning to Supplier<br/>Record in system"]
    N -->|Suspension| Q["Suspend Supplier Account<br/>Remove from listings<br/>Notify suppliers"]
    N -->|Dismiss| R["Close Complaint<br/>Send explanation to user"]
    
    O --> S["POST /api/admin/complaints/:id/resolve"]
    P --> S
    Q --> S
    R --> S
    
    S --> T["📧 Notify User<br/>Resolution details"]
    S --> T1["📧 Notify Supplier<br/>If applicable"]
    
    T --> U["⭐ Request Feedback<br/>Was issue resolved?"]
    U --> V["💾 Update complaint status: resolved/closed"]
    
    style A fill:#ffebee
    style G fill:#fff3e0
    style O fill:#c8e6c9
    style P fill:#ffe0b2
    style Q fill:#ffb3ba
```

---

## 4️⃣ SUPPLIER ONBOARDING FLOW (Hotel/Cab/Restaurant Owner)

```mermaid
graph TD
    A["🏢 Supplier Opens APP"] --> B["Click 'Register Business'"]
    B --> C["Fill Business Form<br/>- Business Name<br/>- Type: Hotel/Cab/Restaurant<br/>- Location<br/>- Contact Details"]
    
    C --> D["Upload Documents<br/>- Business License<br/>- GST Certificate<br/>- PAN Card<br/>- Bank Account Details"]
    
    D --> E["POST /api/supplier/register"]
    E --> F["✅ Application Created<br/>Status: pending_approval"]
    
    F --> G["📋 SUPERADMIN PANEL<br/>New Supplier App in Queue"]
    G --> H["Admin Reviews<br/>- Verify documents<br/>- Check background<br/>- Validate authenticity"]
    
    H --> I{"Documents Valid?"}
    I -->|Yes| J["Run Fraud Check<br/>- Database lookup<br/>- Law enforcement records<br/>- Payment history"]
    I -->|No| K["Request Corrections<br/>Send feedback to supplier"]
    
    K --> K1["Supplier Resubmits"]
    K1 --> H
    
    J --> L{"Fraud Check Passed?"}
    L -->|Yes| M["✅ APPROVED<br/>Status: active"]
    L -->|No| N["❌ REJECTED<br/>Send reason"]
    
    M --> O["Generate Supplier Credentials<br/>- Login ID<br/>- Temp Password<br/>- API Keys"]
    
    O --> P["💰 Create Supplier Wallet<br/>- Commission Rate: 10%<br/>- Initial Balance: ₹0<br/>- Account Setup"]
    
    P --> Q["📧 Welcome Email<br/>Login credentials<br/>Documentation links<br/>Support contact"]
    
    Q --> R["Supplier Logs In<br/>POST /api/supplier/login"]
    R --> S["🎯 Supplier Dashboard<br/>- Add inventory (hotels/rooms)<br/>- Set pricing<br/>- Configure policies"]
    
    N --> N1["Supplier sees rejection<br/>Can appeal or<br/>Provide additional docs"]
    
    style A fill:#e1f5ff
    style G fill:#fff3e0
    style M fill:#c8e6c9
    style N fill:#ffb3ba
```

---

## 5️⃣ PAYMENT & SETTLEMENT CYCLE (Superadmin View)

```mermaid
graph TD
    A["💳 Payment Received from User"] --> B["₹5,000<br/>Hotel Commission Rate: 10%"]
    B --> C["Calculate Split:<br/>Platform Commission: ₹500<br/>Net to Hotel: ₹4,500<br/>Tax: ₹50"]
    
    C --> D["Record Transaction<br/>- payments table<br/>- bookings table linked<br/>- settlements table (pending)"]
    
    D --> E["📊 SUPERADMIN DASHBOARD<br/>Aggregates Daily Settlements"]
    E --> F["Auto-Settlement Process<br/>Run Daily (2 PM)<br/>OR Manual Trigger"]
    
    F --> G["Prepare Settlement Report<br/>- Total Bookings: 150<br/>- Total Revenue: ₹75,000<br/>- Commissions: ₹7,500<br/>- Net Payable: ₹67,500"]
    
    G --> H{"Settlement Approved?"}
    H -->|Auto| I["Status: approved"]
    H -->|Manual| J["Admin Reviews<br/>Check for<br/>- Disputes<br/>- Refunds<br/>- Chargebacks"]
    
    J --> K["Approve/Reject"]
    K --> I
    
    I --> L["Process Payment<br/>- Initiate Bank Transfer<br/>- Record Transaction ID<br/>- Mark as processed"]
    
    L --> M["📧 Settlement Email<br/>Settlement Details<br/>Bank Reference<br/>Invoice Attached"]
    
    M --> N["Update Settlement Status<br/>status: processed"]
    N --> O["💰 Supplier Receives Payment<br/>(T+1 days)"]
    
    O --> P["💾 Record in<br/>- settlements table<br/>- supplier wallet<br/>- audit logs"]
    
    style A fill:#e1f5ff
    style E fill:#fff3e0
    style O fill:#c8e6c9
```

---

## 6️⃣ EMERGENCY ALERT BROADCAST FLOW

```mermaid
graph TD
    A["⚠️ Critical Event Reported"] --> B["Examples:<br/>- Crowd Surge<br/>- Weather Alert<br/>- Safety Issue<br/>- Service Outage"]
    
    B --> C["📞 Superadmin Notified<br/>by local authorities/<br/>users/suppliers"]
    
    C --> D["Superadmin Opens Panel<br/>Click 'Create Emergency Alert'"]
    
    D --> E["Fill Alert Form:<br/>- Type: Crowd/Weather/Safety<br/>- Location: Temple X<br/>- Radius: 2 km<br/>- Severity: Critical<br/>- Message: 'Avoid area'<br/>- Duration: 4 hours"]
    
    E --> F["POST /api/admin/emergency-alerts"]
    
    F --> G["✅ Backend Processing<br/>- Validate location<br/>- Identify affected users<br/>- Queue notifications"]
    
    G --> H["🎯 Target Users<br/>by location (lat/lng)<br/>within 2km radius"]
    
    H --> I["📱 Push Notifications<br/>Sent to User Apps<br/>🚨 HIGH PRIORITY"]
    
    I --> J["👥 Users See Alert<br/>- Red banner at top<br/>- Auto-suggests<br/>  alternatives<br/>- Shows safe routes"]
    
    J --> K["💬 Support Team Alerted<br/>Prepare for calls<br/>Activate help desk<br/>Brief staff on issue"]
    
    K --> L["🚕 Supplier Apps Also Notified<br/>Cab drivers reroute<br/>Hotels prepare<br/>Restaurants increase staff"]
    
    L --> M["📊 SUPERADMIN TRACKS<br/>- Ack Count (100/150)<br/>- Cancellations (25)<br/>- Reroutes (40)<br/>- New bookings nearby<br/>- Help desk calls (15)"]
    
    M --> N["Admin Closes Alert<br/>when situation improves<br/>POST /api/admin/alerts/:id/close"]
    
    N --> O["Post-Analysis<br/>- Generate report<br/>- Identify learnings<br/>- Update procedures<br/>- Archive for future"]
    
    style A fill:#ffebee
    style G fill:#fff3e0
    style J fill:#ffebee
    style K fill:#fff3e0
```

---

## 7️⃣ SUPERADMIN REAL-TIME MONITORING

```mermaid
graph TD
    A["🎯 SUPERADMIN DASHBOARD<br/>Real-Time Metrics"] --> B["📊 Upper Section KPIs"]
    
    B --> C["Active Users Online<br/>Trending: 5,234"]
    B --> D["Current Bookings<br/>Trending: 456"]
    B --> E["Avg Response Time<br/>API: 145ms"]
    B --> F["Payment Success Rate<br/>98.5%"]
    
    A --> G["⚠️ Alert Section"]
    G --> H["Critical Alerts<br/>1. Payment Gateway Down<br/>2. Crowd > 80% at Temple A<br/>3. High complaint rate Supplier#42"]
    
    A --> I["📋 Action Queue"]
    I --> J["5 Pending Approvals<br/>8 Open Complaints (2 Critical)<br/>3 Payment Failures<br/>12 KYC Reviews"]
    
    A --> K["📈 Chart Section"]
    K --> L["Revenue Today<br/>₹2.3 Lakhs"]
    K --> M["Bookings Timeline<br/>Line chart hourly"]
    K --> N["User Geographic<br/>Heatmap by temple"]
    
    A --> O["👥 Recent Activities<br/>User @john123 booked hotel<br/>Supplier #42 posted 5 rooms<br/>Admin Sara resolved 3 complaints"]
    
    style A fill:#fff3e0
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#c8e6c9
    style F fill:#ffb3ba
    style H fill:#ff7043
```

---

## 📊 DATA FLOW BETWEEN TIERS

```mermaid
graph LR
    subgraph UA["👤 USER APP<br/>Pilgrims"]
        U1["Register<br/>Login<br/>Search<br/>Book<br/>Pay<br/>Complain"]
    end
    
    subgraph SA["🏢 SUPPLIER APP<br/>Hotels/Cabs/Restaurants"]
        S1["Register<br/>Login<br/>Manage Stock<br/>Accept Bookings<br/>View Analytics"]
    end
    
    subgraph SUP["🛡️ SUPERADMIN PANEL<br/>Control Center"]
        SUP1["Dashboard<br/>User Management<br/>Supplier Control<br/>Payments<br/>Complaints<br/>Analytics"]
    end
    
    subgraph DB["🗄️ BACKEND DATABASE<br/>PostgreSQL + Drizzle ORM"]
        DB1["users<br/>suppliers<br/>bookings<br/>payments<br/>complaints<br/>settlements"]
    end
    
    subgraph EXT["🌐 EXTERNAL SERVICES"]
        EXT1["Payment Gateway<br/>Email Service<br/>SMS Service<br/>AI/Chatbot<br/>Maps API"]
    end
    
    UA -->|API Calls| DB
    SA -->|API Calls| DB
    SUP -->|API Calls| DB
    
    DB -->|Data Updates| UA
    DB -->|Data Updates| SA
    DB -->|Real-time Sync| SUP
    
    UA -->|Events| EXT
    SA -->|Events| EXT
    SUP -->|Commands| EXT
    EXT -->|Notifications| UA
    EXT -->|Notifications| SA
    
    style UA fill:#e1f5ff
    style SA fill:#f3e5f5
    style SUP fill:#fff3e0
    style DB fill:#e8f5e9
    style EXT fill:#fce4ec
```

---

## 🔐 SECURITY ARCHITECTURE

```mermaid
graph TD
    A["🌐 Client Request"] --> B["API Gateway<br/>- Rate Limiting<br/>- CORS Check"]
    
    B --> C["Authentication<br/>- JWT Token Validation<br/>- Token Expiry Check"]
    
    C --> D{"Role Check<br/>superadmin?<br/>admin?<br/>supplier?<br/>user?"}
    
    D -->|User| E["User Middleware<br/>Can only access<br/>own profile/bookings"]
    D -->|Supplier| F["Supplier Middleware<br/>Can only access<br/>own supplier data"]
    D -->|Admin| G["Admin Middleware<br/>Can access<br/>assigned resources"]
    D -->|Superadmin| H["Superadmin Middleware<br/>Full system access<br/>All audit logged"]
    
    E --> I["✅ Request Authorized"]
    F --> I
    G --> I
    H --> I
    
    I --> J["Execute Business Logic<br/>- Validate inputs<br/>- Check permissions<br/>- Update database"]
    
    J --> K["Encrypt Sensitive Data<br/>- Bank details<br/>- Payment info<br/>- Personal docs"]
    
    K --> L["Log Action<br/>- User ID<br/>- Action type<br/>- Timestamp<br/>- IP address"]
    
    L --> M["Send Response<br/>- Status code<br/>- JSON data<br/>- No sensitive info"]
    
    D -->|Denied| N["❌ 403 Forbidden<br/>Log attempt<br/>Alert if suspicious"]
    
    style A fill:#e1f5ff
    style I fill:#c8e6c9
    style M fill:#c8e6c9
    style N fill:#ffb3ba
```

---

## 📱 UI LAYOUT SKETCHES

### **User App - Home Screen**
```
┌─────────────────────────────────────┐
│  🔔 Kumbh360     Profile    ⚙️      │
├─────────────────────────────────────┤
│                                      │
│  🚨 EMERGENCY ALERT (if any)        │
│  Crowd surge at Temple X - Avoid     │
│                                      │
│  🎯 Quick Access                     │
│  ┌──────────────┬──────────────┐    │
│  │ 🏨 Hotels    │ 🍕 Food      │    │
│  └──────────────┴──────────────┘    │
│  ┌──────────────┬──────────────┐    │
│  │ 🚕 Cabs      │ 💬 Chatbot   │    │
│  └──────────────┴──────────────┘    │
│                                      │
│  📍 Trending Near You                │
│  [Hotel A] ⭐⭐⭐⭐⭐ 250 bookings  │
│  [Hotel B] ⭐⭐⭐⭐ 180 bookings    │
│                                      │
│  [My Bookings] [History] [Help]     │
└─────────────────────────────────────┘
```

### **Superadmin Dashboard - Main View**
```
┌─────────────────────────────────────────────────┐
│ 🛡️ SUPERADMIN DASHBOARD      [ⓘ] [Settings] [👤] │
├─────────────────────────────────────────────────┤
│                                                   │
│ KPI CARDS:                                      │
│ ┌─────────────┬─────────────┬─────────────┐    │
│ │ 📊 Users    │ 💰 Revenue  │ 📦 Bookings │    │
│ │ 45,230      │ ₹1.2 Cr     │ 12,340      │    │
│ └─────────────┴─────────────┴─────────────┘    │
│                                                   │
│ ⚠️ CRITICAL ALERTS (3)                          │
│ • Payment Gateway Timeout  [View][Retry]        │
│ • Supplier #42 Complaints ↑ [Review][Action]    │
│ • 5 KYC Docs Pending  [Review]                  │
│                                                   │
│ CHARTS:                                         │
│ ┌────────────────────────────────────────────┐  │
│ │ Revenue Trend (Last 30 Days)                │  │
│ │ Line chart graph                            │  │
│ └────────────────────────────────────────────┘  │
│                                                   │
│ QUICK ACTIONS:                                  │
│ [📋 Users] [🏢 Suppliers] [💳 Settlements]     │
│ [⚠️ Complaints] [🚨 Emergency] [📊 Analytics]  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 NEXT STEPS

1. **Review this document** - Understand all flows
2. **Confirm requirements** - Any custom needs?
3. **Database design** - Create schema files
4. **API structure** - Create route files
5. **Frontend components** - Build UI for each tier
6. **Integration** - Connect all pieces
7. **Testing** - Unit & integration tests
8. **Deployment** - CI/CD setup

Ready to proceed? Which should we build first:
- ✅ Database schema (tables & relationships)
- ✅ Authentication & JWT system
- ✅ Admin routes & controllers
- ✅ Frontend components for superadmin panel
