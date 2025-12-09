# Automated Coffee Machine - Complete Order Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Machine Authentication Flow](#machine-authentication-flow)
3. [Customer Authentication Flow](#customer-authentication-flow)
4. [Recipe Selection Flow](#recipe-selection-flow)
5. [Payment Processing Flow](#payment-processing-flow)
6. [Order Completion Flow](#order-completion-flow)
7. [Post-Order Flow](#post-order-flow)
8. [Technical Details](#technical-details)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## Overview

This document describes the complete flow of an order from machine login to order completion in the Automated Coffee Machine system. The system uses a tablet interface (1340x800 resolution) for customer interaction, with backend services handling authentication, payment processing, and order management.

### Key Components
- **Frontend**: Next.js React application (client)
- **Backend**: Node.js Express server with MongoDB
- **Payment Gateway**: CCAvenue integration
- **Real-time Communication**: WebSocket (Socket.io) and MQTT
- **Database**: MongoDB with Change Streams for real-time updates

---

## Machine Authentication Flow

### Step 1: Machine Login
**Location**: `/product/auth/machine`

**Process**:
1. User enters Machine ID on the authentication page
2. Frontend calls `machineService.getMachineById(machine_id)`
3. Backend validates machine exists in database
4. If valid:
   - Machine ID stored in `localStorage.setItem("machineId", machine_id)`
   - Machine location stored in `localStorage.setItem("machineLocation", location)`
   - Redirect to `/product/screensaver`
5. If invalid:
   - Error message displayed
   - User can retry

**Code References**:
- `client/app/product/auth/machine/page.tsx`
- `server/src/controllers/machineController.ts` - `getMachineById`

**Storage**:
```javascript
localStorage.setItem("machineId", machine_id)
localStorage.setItem("machineLocation", location)
```

---

## Customer Authentication Flow

### Step 2: Screensaver
**Location**: `/product/screensaver`

**Process**:
1. Checks for `machineId` in localStorage
2. If missing → redirects to `/product/auth/machine`
3. Displays animated screensaver with coffee quotes
4. User interaction (tap/click) → redirects to `/product/auth`

**Code References**:
- `client/app/product/screensaver/page.tsx`

### Step 3: Customer Login
**Location**: `/product/auth`

**Process**:
1. **Check Machine ID**: Validates machineId exists in localStorage
2. **Check Existing Session**: 
   - Checks `sessionStorage` for `userId` and `userName`
   - If exists → redirects to `/product/recipes`
3. **Phone Number Entry**:
   - User enters 10-digit phone number
   - Frontend calls `userService.checkUserByPhone({ phone_number })`
   - Backend checks if user exists in database
4. **Existing User**:
   - User found → Store in sessionStorage:
     ```javascript
     sessionStorage.setItem("userId", user.user_id)
     sessionStorage.setItem("userName", user.name)
     ```
   - Redirect to `/product/recipes`
5. **New User**:
   - User not found → Show registration form
   - Collect: Name, Date of Birth
   - Create user via `userService.createUser()`
   - Store user data in sessionStorage
   - Redirect to `/product/recipes`

**Code References**:
- `client/app/product/auth/page.tsx`
- `server/src/controllers/authController.ts` - `checkUserByPhone`, `register`
- `server/src/models/User.ts`

**Storage**:
```javascript
sessionStorage.setItem("userId", user_id)
sessionStorage.setItem("userName", user_name)
```

---

## Recipe Selection Flow

### Step 4: Recipe Display
**Location**: `/product/recipes`

**Process**:
1. **Load Recipes**:
   - Fetches recipes via WebSocket connection
   - Real-time updates via `useWebSocketStore`
   - Recipes stored in `useRecipeStore` (Zustand)
2. **Recipe Availability**:
   - Backend calculates availability based on machine inventory
   - Compares recipe ingredients with available inventory
   - Updates recipe availability in real-time via WebSocket
3. **Display**:
   - Recipes grouped by category
   - Available recipes: Normal display, clickable
   - Unavailable recipes: Greyed out, "Sold Out" badge, not clickable
4. **Inactivity Timer**:
   - 15-second inactivity timeout
   - On timeout:
     - Clear `sessionStorage` (userId, userName)
     - Redirect to `/product/screensaver`

**Code References**:
- `client/app/product/recipes/page.tsx`
- `client/app/product/recipes/components/AllRecipesList.tsx`
- `client/app/product/recipes/components/RecipeCard.tsx`
- `client/app/product/stores/useRecipeStore.ts`
- `client/app/product/stores/useWebSocketStore.ts`
- `server/src/controllers/machineController.ts` - `getMachineInventory`

**Real-time Updates**:
- WebSocket event: `recipe-availability-update`
- Updates recipe availability based on inventory changes

### Step 5: Recipe Details & Order Initiation
**Location**: Recipe Details Dialog (Modal)

**Process**:
1. User clicks on available recipe
2. Recipe details dialog opens showing:
   - Recipe image, name, description
   - Ingredients (coffee, milk quantities)
   - Price
3. User clicks "Order Now" button
4. **Order Initiation**:
   - Get `userId` from sessionStorage
   - Get `machineId` from localStorage
   - Get `recipeId` from selected recipe
   - Call `paymentService.initiate()` with:
     ```javascript
     {
       user_id: userId,
       machine_id: machineId,
       recipe_id: recipeId
     }
     ```

**Code References**:
- `client/app/product/recipes/components/RecipeDetailsDialog.tsx`
- `client/lib/api/services.ts` - `paymentService.initiate`

---

## Payment Processing Flow

### Step 6: Payment Initiation
**Backend**: `POST /api/payments/init`

**Process**:
1. **Validation**:
   - Validates user, machine, and recipe exist
   - Checks all required entities in database
2. **Order Creation**:
   - Creates order with status `pending`
   - Generates unique `order_id` (UUID, max 20 chars for CCAvenue)
   - Stores: `user_id`, `machine_id`, `recipe_id`, `bill` (price)
3. **Payment Gateway Setup**:
   - Builds CCAvenue payment parameters:
     ```javascript
     {
       merchant_id: process.env.CCAV_MERCHANT_ID,
       order_id: orderId,
       amount: recipe.price,
       currency: 'INR',
       redirect_url: process.env.CCAV_RESPONSE_URL,
       cancel_url: process.env.CCAV_CANCEL_URL,
       billing_name: user.name,
       billing_tel: user.phone_number,
       billing_email: user.email,
       merchant_param1: user_id,
       merchant_param2: machine_id,
       merchant_param3: recipe_id
     }
     ```
4. **Encryption**:
   - Serializes parameters to key=value string
   - Encrypts using AES-128/256-CBC with CCAvenue working key
   - Generates `encRequest` and `ivBase64`
5. **Response**:
   - Returns HTML form that auto-submits to CCAvenue
   - Form contains: `encRequest`, `access_code`
   - Browser automatically redirects to CCAvenue payment page

**Code References**:
- `server/src/controllers/paymentController.ts` - `initiatePayment`
- `server/src/utils/ccavenue.ts` - `encryptCc`, `serializeParams`
- `server/src/models/Order.ts`

**Environment Variables Required**:
```env
CCAV_MERCHANT_ID
CCAV_ACCESS_CODE
CCAV_WORKING_KEY
CCAV_INIT_URL
CCAV_RESPONSE_URL
CCAV_CANCEL_URL
CLIENT_PUBLIC_URL
```

### Step 7: CCAvenue Payment
**External**: CCAvenue Payment Gateway

**Process**:
1. User completes payment on CCAvenue
2. CCAvenue processes payment
3. CCAvenue POSTs response to `CCAV_RESPONSE_URL` with `encResp`

### Step 8: Payment Response Handling
**Backend**: `POST /api/payments/ccav-response`

**Process**:
1. **Decryption**:
   - Receives `encResp` from CCAvenue
   - Decrypts using CCAvenue working key
   - Parses response parameters
2. **Status Mapping**:
   - `order_status: "Success"` → `status: "completed"`
   - `order_status: "Aborted"` → `status: "cancelled"`
   - Other → `status: "failed"`
3. **Order Update**:
   - Updates order status in database
   - Retrieves recipe name and amount
4. **Redirect**:
   - **Success**: Redirects to `/product/success?recipe={name}&price={amount}`
   - **Failure/Cancelled**: Redirects to `/product/auth?payment={status}`

**Code References**:
- `server/src/controllers/paymentController.ts` - `handleCcavResponse`
- `server/src/utils/ccavenue.ts` - `decryptCc`

---

## Order Completion Flow

### Step 9: Success Page
**Location**: `/product/success`

**Process**:
1. **Page Load**:
   - Fixed dimensions: 1340px × 800px (landscape tablet)
   - Non-scrollable (overflow: hidden)
   - Prevents touch and wheel scrolling
2. **Order Data Loading**:
   - **Priority 1**: Load from `localStorage.getItem("orderData")`
   - **Priority 2**: Load from URL parameters (`recipe`, `price`)
   - If URL params exist but no localStorage → Auto-save to localStorage
   - Get `userName` from `sessionStorage.getItem("userName")`
3. **MQTT Recipe Publishing**:
   - On MQTT connection, publishes recipe name to input topic
   - Topic format: `{machineId}/input`
   - Message: Recipe name (e.g., "Cappuccino")
   - Retries if initial publish fails
4. **Preparation Steps Animation**:
   - **Step 1**: Grinding (3 seconds)
   - **Step 2**: Heating (3 seconds)
   - **Step 3**: Brewing (3 seconds)
   - **Step 4**: Ready! (shows confetti)
   - Total: ~9 seconds
5. **Order Ready**:
   - Shows "Ready!" step
   - Displays confetti animation
   - Enables "See you next time!" button
6. **Machine Inventory Update**:
   - Calls `machineService.getMachineInventory(machineId)`
   - Refreshes dispenser/inventory data
   - Updates recipe availability for next order

**Code References**:
- `client/app/product/success/page.tsx`
- `client/lib/mqtt.ts` - MQTT publishing
- `client/lib/api/services.ts` - `machineService.getMachineInventory`

**Storage Operations**:
```javascript
// Load order data
const orderData = JSON.parse(localStorage.getItem("orderData"))
// Or from URL params
const recipe = searchParams.get("recipe")
const price = searchParams.get("price")

// Auto-save URL params to localStorage
localStorage.setItem("orderData", JSON.stringify({
  recipe: recipe,
  price: price,
  orderId: '',
  recipeId: '',
  machineId: machineId,
  timestamp: new Date().toISOString()
}))
```

### Step 10: Post-Order Cleanup
**Process**:
1. **User Data Clearing**:
   - On button click or auto-redirect (5 seconds after ready):
     ```javascript
     sessionStorage.removeItem("userId")
     sessionStorage.removeItem("userName")
     ```
2. **Redirect**:
   - Redirects to `/product/screensaver`
3. **Screensaver**:
   - Waits for next user interaction
   - Cycle repeats from Step 2

**Code References**:
- `client/app/product/success/page.tsx` - Cleanup logic

---

## Post-Order Flow

### Step 11: Return to Screensaver
**Location**: `/product/screensaver`

**Process**:
1. Displays animated screensaver
2. Shows coffee quotes rotating every 5 seconds
3. Waits for user tap/click
4. On interaction → redirects to `/product/auth` (Step 3)

**Code References**:
- `client/app/product/screensaver/page.tsx`

---

## Technical Details

### Data Storage

#### localStorage (Persistent)
- `machineId`: Machine identifier
- `machineLocation`: Machine location
- `orderData`: Order information (for testing/consistency)

#### sessionStorage (Session-only)
- `userId`: Current user ID
- `userName`: Current user name

### Real-time Communication

#### WebSocket (Socket.io)
**Events**:
- `recipe-update`: Recipe data changes
- `recipe-availability-update`: Recipe availability based on inventory
- `machine-status-update`: Machine status changes
- `machine-temperature-update`: Machine temperature updates
- `machine-inventory-update`: Inventory/dispenser updates

**Code References**:
- `client/lib/websocket/socketContext.tsx`
- `server/src/services/websocketService.ts`
- `server/src/services/dbChangeService.ts` - MongoDB Change Streams

#### MQTT
**Purpose**: Machine-to-machine communication for recipe execution

**Topics**:
- `{machineId}/input`: Recipe name sent to machine
- `{machineId}/feedback`: Machine feedback/status

**Code References**:
- `client/lib/mqtt.ts`
- `client/app/product/success/page.tsx` - Recipe publishing

### Database Models

#### Order Model
```typescript
{
  order_id: string (UUID)
  user_id: string
  machine_id: string
  recipe_id: string
  bill: number (price)
  ordered_at: Date
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
}
```

#### User Model
```typescript
{
  user_id: string (UUID)
  name: string
  email: string
  phone_number: string
  date_of_birth: Date
  role: 'customer' | 'admin'
  created_at: Date
}
```

#### Machine Model
```typescript
{
  machine_id: string
  location: string
  status: string
  temperature_c: number
  cleaning_water_ml: number
  last_regular_service: Date
  last_deep_service: Date
}
```

#### Recipe Model
```typescript
{
  recipe_id: string (UUID)
  name: string
  description: string
  price: number
  category_id: string
  image_url: string
  created_at: Date
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/check-phone` - Check if user exists by phone

#### Machine
- `GET /api/machines/:machine_id` - Get machine by ID
- `GET /api/machines/:machine_id/inventory` - Get machine inventory

#### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:recipe_id` - Get recipe by ID

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:order_id` - Get order by ID

#### Payments
- `POST /api/payments/init` - Initiate payment
- `POST /api/payments/ccav-response` - Handle CCAvenue response

---

## Data Flow Diagrams

### Complete Order Flow
```
1. Machine Auth
   ↓
2. Screensaver
   ↓
3. Customer Auth (Phone → Name/DOB if new)
   ↓
4. Recipe Selection (Real-time availability)
   ↓
5. Recipe Details → Order Now
   ↓
6. Payment Initiation (Backend creates order)
   ↓
7. CCAvenue Payment Gateway
   ↓
8. Payment Response (Backend updates order)
   ↓
9. Success Page (MQTT publish, animation, inventory update)
   ↓
10. Cleanup (Clear session, redirect to screensaver)
   ↓
11. Screensaver (Wait for next user)
```

### Payment Flow
```
Frontend: paymentService.initiate()
   ↓
Backend: POST /api/payments/init
   ↓
Create Order (status: pending)
   ↓
Encrypt payment params
   ↓
Return HTML form
   ↓
Auto-submit to CCAvenue
   ↓
User pays on CCAvenue
   ↓
CCAvenue POST to /api/payments/ccav-response
   ↓
Backend decrypts response
   ↓
Update Order (status: completed/failed/cancelled)
   ↓
Redirect to /product/success or /product/auth
```

### Real-time Updates Flow
```
MongoDB Change Stream
   ↓
dbChangeService detects change
   ↓
websocketService.emitRecipeUpdate()
   ↓
WebSocket broadcast to all clients
   ↓
Frontend SocketContext receives update
   ↓
useWebSocketStore updates state
   ↓
useRecipeStore syncs recipes
   ↓
UI updates automatically
```

### MQTT Flow
```
Success Page loads
   ↓
MQTT client connects
   ↓
Publish recipe name to {machineId}/input
   ↓
Machine receives recipe
   ↓
Machine executes recipe
   ↓
Machine publishes feedback to {machineId}/feedback
```

---

## Error Handling

### Machine Authentication Errors
- **Machine not found**: Error message, retry allowed
- **Network error**: Connection error message

### Customer Authentication Errors
- **Invalid phone**: Validation error
- **User creation failed**: Error message, retry

### Payment Errors
- **Payment failed**: Redirect to `/product/auth?payment=failed`
- **Payment cancelled**: Redirect to `/product/auth?payment=cancelled`
- **Invalid response**: Error logged, user redirected

### Order Errors
- **Missing data**: Fallback to URL parameters
- **MQTT publish failure**: Retry after 1 second
- **Inventory update failure**: Logged, non-blocking

---

## Security Considerations

1. **Environment Variables**: All sensitive data (API keys, secrets) stored in environment variables
2. **JWT Tokens**: User authentication uses JWT tokens
3. **Session Storage**: User data cleared after order completion
4. **Payment Encryption**: CCAvenue uses AES encryption for payment data
5. **HTTPS/WSS**: Secure connections for API and WebSocket

---

## Testing Flow

### Manual Testing Steps
1. Navigate to `/product/auth/machine`
2. Enter valid machine ID
3. Should redirect to screensaver
4. Tap screensaver → redirects to `/product/auth`
5. Enter phone number (new or existing)
6. If new, enter name and DOB
7. Should redirect to `/product/recipes`
8. Select available recipe
9. Click "Order Now"
10. Complete payment on CCAvenue
11. Should redirect to success page
12. Wait for order ready
13. Should redirect to screensaver
14. Verify sessionStorage cleared

---

## Notes

- **Tablet Resolution**: Success page optimized for 1340×800 landscape tablet
- **Inactivity Timeout**: 15 seconds on recipes page
- **Auto-redirect**: 5 seconds after order ready on success page
- **Real-time Updates**: WebSocket provides instant recipe availability updates
- **MQTT Integration**: Enables direct machine communication for recipe execution
- **Local Storage**: Used for machine ID (persistent) and order data (testing)
- **Session Storage**: Used for user session (cleared after order)

---

## Version History

- **v1.0**: Initial documentation
  - Complete flow from machine login to order completion
  - Payment integration with CCAvenue
  - Real-time updates via WebSocket
  - MQTT integration for machine communication

