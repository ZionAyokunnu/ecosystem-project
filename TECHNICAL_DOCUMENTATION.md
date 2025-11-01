# Ecosystem Project - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Frontend Architecture](#frontend-architecture)
6. [Components Documentation](#components-documentation)
7. [Services & APIs](#services--apis)
8. [Hooks & Custom Hooks](#hooks--custom-hooks)
9. [Context Providers](#context-providers)
10. [Pages & Routing](#pages--routing)
11. [Supabase Edge Functions](#supabase-edge-functions)
12. [Configuration Files](#configuration-files)
13. [Build & Deployment](#build--deployment)

---

## Project Overview

The Ecosystem Project is a comprehensive community engagement platform that enables stakeholders to understand, analyze, and improve community indicators through data visualization, surveys, voice calls, gamification, and AI-powered insights.

### Key Features
- **Interactive Data Visualization**: Sunburst charts for indicator relationships
- **Survey System**: Web and voice-based surveys with approval workflows
- **Voice Integration**: Twilio-based voice surveys for accessibility
- **Gamification**: Points, badges, and vouchers system
- **AI Insights**: Local LLM integration for community recommendations
- **Simulation Engine**: What-if scenario modeling for indicators
- **Role-Based Access**: Support for residents, community reps, researchers, and admins
- **Location Hierarchy**: Multi-level geographic organization

---

## Architecture & Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API + React Query 5.56.2
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4.11
- **Data Visualization**: D3.js 7.9.0, Recharts 2.12.7
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Deno runtime
- **API Proxy**: Express.js (for LLM proxy)

### External Services
- **Voice**: Twilio 5.7.2
- **AI**: Local LLM (Ollama via proxy)

### Development Tools
- **Linting**: ESLint 9.9.0
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm

---

## Project Structure

```
ecosystem-project/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── animations/     # Animation components
│   │   └── [50+ components] # Feature components
│   ├── pages/              # Route pages
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context providers
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── integrations/       # Third-party integrations
│   │   ├── supabase/       # Supabase client & types
│   │   └── twilio/         # Twilio client
│   ├── assets/             # Static assets
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── public/                 # Static public files
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Database Schema

### Core Tables

#### `indicators`
Stores community indicators (metrics that measure community wellbeing).

**Schema:**
```typescript
{
  indicator_id: string (PK)
  name: string
  current_value: number (0-100)
  category: string
  description: string | null
  code: number | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `locations`
Hierarchical location structure (country → nation → region → city → town → ward).

**Schema:**
```typescript
{
  location_id: string (PK)
  name: string
  type: 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward'
  parent_id: string | null (FK → locations.location_id)
  created_at: timestamp
  updated_at: timestamp
}
```

#### `relationships`
Represents influence relationships between indicators (parent-child dependencies).

**Schema:**
```typescript
{
  relationship_id: string (PK)
  parent_id: string (FK → indicators.indicator_id)
  child_id: string (FK → indicators.indicator_id)
  influence_weight: number
  influence_score: number
  child_to_parent_weight: number | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `indicator_values`
Stores indicator values by location and year.

**Schema:**
```typescript
{
  indicator_id: string (FK → indicators.indicator_id)
  location_id: string (FK → locations.location_id)
  year: number
  value: number
  created_at: timestamp
  updated_at: timestamp
  PRIMARY KEY (indicator_id, location_id, year)
}
```

#### `historical_trends`
Historical data for indicators (time series).

**Schema:**
```typescript
{
  trend_id: string (PK)
  indicator_id: string (FK → indicators.indicator_id)
  year: number
  value: number
  created_at: timestamp
}
```

### User & Authentication Tables

#### `profiles`
Extended user profiles linked to Supabase auth.

**Schema:**
```typescript
{
  id: string (PK, FK → auth.users.id)
  email: string
  first_name: string
  phone_number: string | null
  profile_photo: string | null
  role: 'resident' | 'community_rep' | 'researcher' | 'admin' | 'business'
  location_id: string | null (FK → locations.location_id)
  gender: string | null
  age_group: string | null
  has_completed_onboarding: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Survey System Tables

#### `surveys`
Survey definitions with approval workflow.

**Schema:**
```typescript
{
  survey_id: string (PK)
  title: string
  domain: string
  description: string | null
  is_compulsory: boolean
  is_voice_enabled: boolean | null
  justification: string | null
  demographic_filters: JSON | null
  estimated_duration_minutes: number | null
  approved_by_rep: string | null (FK → profiles.id)
  approved_at: timestamp | null
  declined_reason: string | null
  applicable_roles: string[] | null
  created_by: string | null (FK → profiles.id)
  target_location: string (FK → locations.location_id)
  status: 'active' | 'archived' | 'pending_approval' | 'draft' | 'declined' | 'completed'
  created_at: timestamp
  updated_at: timestamp
}
```

#### `survey_questions`
Questions within surveys, linked to indicator relationships.

**Schema:**
```typescript
{
  question_id: string (PK)
  survey_id: string (FK → surveys.survey_id)
  parent_indicator_id: string (FK → indicators.indicator_id)
  child_indicator_id: string (FK → indicators.indicator_id)
  prompt: string
  input_type: 'slider' | 'select' | 'file'
  allow_file_upload: boolean
  allow_additional_indicator: boolean
  is_required: boolean
  branching_condition: string | null
  created_at: timestamp
}
```

#### `survey_responses`
User responses to survey questions.

**Schema:**
```typescript
{
  id: string (PK)
  survey_id: string (FK → surveys.survey_id)
  question_id: string (FK → survey_questions.question_id)
  user_id: string (FK → profiles.id)
  response_type: 'web' | 'voice' | null
  quantitative_value: number | null
  qualitative_text: string | null
  raw_transcript: string | null
  phone_number: string | null
  created_at: timestamp
}
```

#### `relationship_user_responses`
User-provided relationship strength data.

**Schema:**
```typescript
{
  response_id: string (PK)
  user_id: string (FK → profiles.id)
  parent_id: string (FK → indicators.indicator_id)
  child_id: string (FK → indicators.indicator_id)
  domain: string
  strength_score: number
  direction: 'A→B' | 'B→A' | 'Mutual' | 'Unclear'
  notes_file_url: string | null
  additional_indicator_ids: string[] | null
  created_at: timestamp
}
```

### Voice Call Tables

#### `voice_call_attempts`
Tracks voice survey call attempts.

**Schema:**
```typescript
{
  id: string (PK)
  survey_id: string (FK → surveys.survey_id)
  user_id: string (FK → profiles.id)
  phone_number: string
  status: 'scheduled' | 'calling' | 'completed' | 'failed' | 'declined' | 'rescheduled'
  scheduled_at: timestamp
  attempted_at: timestamp | null
  completed_at: timestamp | null
  call_duration_seconds: number | null
  twilio_call_sid: string | null
  failure_reason: string | null
  reschedule_requested_at: timestamp | null
  created_at: timestamp
}
```

#### `survey_notifications`
Notifications sent to users about surveys.

**Schema:**
```typescript
{
  id: string (PK)
  survey_id: string (FK → surveys.survey_id)
  user_id: string (FK → profiles.id)
  notification_type: 'web_banner' | 'sms_pre_call' | 'push_notification'
  sent_at: timestamp | null
  message_content: string | null
  delivery_status: 'sent' | 'delivered' | 'failed'
}
```

### Gamification Tables

#### `user_points_log`
Tracks all points awarded to users.

**Schema:**
```typescript
{
  id: string (PK)
  user_id: string (FK → profiles.id)
  action_type: string
  points_awarded: number
  metadata: JSON | null
  created_at: timestamp
}
```

#### `user_badges`
Badges awarded to users.

**Schema:**
```typescript
{
  id: string (PK)
  user_id: string (FK → profiles.id)
  badge_type: string
  awarded_at: timestamp
}
```

#### `user_vouchers`
Reward vouchers for users.

**Schema:**
```typescript
{
  id: string (PK)
  user_id: string (FK → profiles.id)
  voucher_code: string
  partner_name: string
  value: string
  expires_at: timestamp | null
  is_redeemed: boolean
  created_at: timestamp
}
```

### Other Tables

#### `qualitative_stories`
Community stories about indicator relationships.

**Schema:**
```typescript
{
  story_id: string (PK)
  parent_id: string (FK → indicators.indicator_id)
  child_id: string (FK → indicators.indicator_id)
  story_text: string
  author: string
  location: string | null
  photo: string | null
  vote_count: number | null
  created_at: timestamp
}
```

#### `simulation_profiles`
Saved simulation scenarios.

**Schema:**
```typescriptつ
{
  simulation_id: string (PK)
  name: string
  description: string | null
  user_id: string | null (FK → profiles.id)
  created_at: timestamp
}
```

#### `simulation_changes`
Changes in a simulation.

**Schema:**
```typescript
{
  change_id: string (PK)
  simulation_id: string (FK → simulation_profiles.simulation_id)
  indicator_id: string (FK → indicators.indicator_id)
  previous_value: number
  new_value: number
  created_at: timestamp
}
```

#### `admin_inputs`
Logs admin modifications to indicators.

**Schema:**
```typescript
{
  id: string (PK)
  admin_id: string (FK → profiles.id)
  indicator_id: string (FK → indicators.indicator_id)
  input_type: string
  value: number
  rationale: string | null
  created_at: timestamp
}
```

#### `benchmarks`
Target values for indicators.

**Schema:**
```typescript
{
  id: string (PK)
  indicator_id: string (FK → indicators.indicator_id)
  benchmark_type: string
  target_value: number
  description: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### `domains`
Domain organization for indicators.

**Schema:**
```typescript
{
  domain_id: string (PK)
  name: string
  Description: string | null
  level: number
  parent_id: string | null (FK → domains.domain_id)
  indicator_id: string | null (FK → indicators.indicator_id)
}
```

### Database Functions

#### `get_location_path(target_location_id: string)`
Returns the full path from root to target location as an array of location records.

#### `get_location_children(parent_location_id?: string)`
Returns all direct children of a location.

#### `get_survey_target_users(survey_id: string, location_id: string)`
Returns eligible users for a survey based on filters.

#### `calculate_survey_duration(survey_id: string)`
Calculates average completion time for a survey.

---

## Frontend Architecture

### Entry Point (`src/main.tsx`)
```typescript
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
```

Renders the root React component into the DOM.

### Root Component (`src/App.tsx`)

**Purpose**: Sets up providers and routing structure.

**Key Providers:**
1. PupQueryClientProvider - Data fetching and caching
2. TooltipProvider - UI tooltip support
3. AuthProvider - Authentication state
4. UserProvider - User profile data
5. EcosystemProvider - Ecosystem indicators and relationships
6. LocationProvider - Selected/target location state

**Routing Structure:**
- Public routes: `/auth`, `/about`, `/`
- Protected routes: `/dashboard`, `/overview`, `/detail`, etc.
- Role-protected routes: `/rep-dashboard`, `/admin`, `/researcher/insights`

**Route Configuration:**
```typescript
- /auth - Authentication page
- / - Home page (public)
- /home - Home page
- /dashboard - User dashboard (protected)
- /rep-dashboard - Community rep dashboard (role-protected)
- /admin - Admin dashboard (role-protected)
- /leaderboard - Leaderboard (protected)
- /overview - Ecosystem overview (protected)
- /detail/:indicatorId - Indicator detail view (protected)
- /research/:indicatorId - Research page (protected)
- /stories - Community stories (protected)
- /treemap - Tree map visualization (protected)
- /surveys - Surveys page
- /profile - User profile
- /onboarding - Onboarding survey
- /wallet - Gamification wallet
- /researcher/insights - Researcher insights (role-protected)
```

---

## Components Documentation

### Layout Components

#### `MainLayout.tsx`
**Purpose**: Provides consistent page layout with header and footer.

**Structure:**
```typescript
<div className="flex flex-col min-h-screen">
  <Header />
  <main className="flex-grow bg-gray-50">
    <Outlet /> {/* Nested routes render here */}
  </main>
  <Footer />
</div>
```

#### `Header.tsx`
**Purpose**: Main navigation header with user menu and role-based navigation.

**Features:**
- User authentication status
- Role-based menu items
- Navigation links
- User profile dropdown

#### `Footer.tsx`
**Purpose**: Site footer with links and information.

### Data Visualization Components

#### `SunburstChart.tsx`
**Purpose**: Interactive hierarchical visualization of indicator relationships.

**Key Features:**
- D3.js-based sunburst visualization
- Drill-down navigation (click to pivot)
- Breadcrumb trail support
- Multi-layer depth control
- Node selection and highlighting
- Fixed mode toggle

**Props:**
```typescript
interface SunburstChartProps {
  nodes: SunburstNode[]           // Nodes to display
  links: SunburstLink[]           // Relationships between nodes
  width?: number                  // Chart width (default: 600)
  height?: number                 // Chart height (default: 600)
  onSelect?: (indicatorId: string) => void
  maxLayers?: number              // Maximum depth (default: 2)
  showLabels?: boolean
  onBreadcrumbsChange?: (items: Array<{id: string; name: string}>) => void
  onVisibleNodesChange?: (visible: SunburstNode[]) => void
  onCoreChange?: (id: string | null) => void
  fixedMode?: boolean
}
```

**Key Functions:**
- `buildHierarchy()` - Converts flat nodes/links to D3 hierarchy
- `clicked()` - Handles node clicks for drill-down
- `arcTween()` - Smooth animation transitions
- `drawBreadcrumbs()` - Renders navigation breadcrumbs

**State Management:**
- `pivotId` - Currently centered indicator
- `pivotStack` - Stack of drill-in history for navigation
- `selectedId` - Highlighted indicator

#### `SunburstCenterCircle.tsx`
**Purpose**: Central circle display showing core indicator information.

**Features:**
- Current indicator name and value
- Color-coded value display
- Click handler for drill-out

#### `SunburstFixModeToggle.tsx`
**Purpose**: Toggle for fixed vs. interactive mode.

#### `TrendGraph.tsx`
**Purpose**: Line chart for historical indicator trends.

**Technology**: Recharts

**Features:**
- Time series visualization
- Interactive tooltips
- Responsive design

#### `PredictionChart.tsx`
**Purpose**: Displays predicted future values for indicators.

**Features:**
- Historical data overlay
- Future predictions
- Summary text explanation

#### `TreeMapPage.tsx`
**Purpose**: Alternative visualization using tree map layout.

**Technology**: D3.js

### Survey Components

#### `SurveyCard.tsx`
**Purpose**: Card display for a survey in listings.

**Features:**
- Survey title and description
- Status badge
- Response rate display
- Action buttons (view, approve, decline)

#### `SurveyCreationForm.tsx`
**Purpose**: Form for creating new surveys.

**Features:**
- Survey metadata (title, description, domain)
- Target location selection
- Demographic filters ignored
- Role targeting
- Voice enablement toggle
- Question builder

**Form Fields:**
- Title (required)
- Domain (required)
- Description
- Target location
- Justification
- Estimated duration
- Is compulsory
- Is voice enabled
- Applicable roles (multi-select)
- Questions array

#### `SurveyRenderer.tsx`
**Purpose**: Renders a survey for user completion.

**Features:**
- Question-by-question display
- Input type handling (slider, select, file)
- Progress tracking
- Validation
- Submission handling

**Input Types:**
- **Slider**: 1-10 numeric scale
- **Select**: Dropdown options
- **File**: File upload with preview

#### `SurveyModal.tsx`
**Purpose**: Modal dialog for survey creation/editing.

**Features:**
- Form overlay
- Cancel/submit actions
- Validation feedback

#### `SurveyApprovalCard.tsx`
**Purpose**: Card for community reps to approve/decline surveys.

**Features:**
- Survey details
- Approve button
- Decline button with reason input
- Status display

#### `ResponseRateBadge.tsx`
**Purpose**: Visual badge showing survey response rate.

**Features:**
- Percentage display
- Color coding (low/medium/high)
- Animated progress indicator

### Voice Call Components

#### `VoiceCallStatus.tsx`
**Purpose**: Displays voice call attempt status and details.

**Features:**
- Call status indicator
- Scheduled time
- Duration display
- Failure reason (if applicable)
- Reschedule option

### Simulation Components

#### `Simulator.tsx`
**Purpose**: What-if scenario builder for indicators.

**Features:**
- Indicator selector
- Value slider input
- Real-time simulation
- Positive/negative drivers display
- Save simulation capability

**Props:**
```typescript
interface SimulatorProps {
  indicators: Indicator[]
  coreIndicator: Indicator
  onSimulate: (indicatorId: string, newValue: number) => void
  changes: SimulationChange[]
  onSaveSimulation: (name: string, description: string) => void
  positiveDrivers: Indicator[]
  negativeDrivers: Indicator[]
  isLoading?: boolean
  simulationResult?: PredictionResult | null
  onClearSimulation?: () => void
}
```

**Functionality:**
1. User selects indicator from dropdown
2. User adjusts value via slider
3. System computes propagated changes using relationships
4. Results displayed as impact summary
5. User can save simulation for later reference

#### `SimulationModal.tsx`
**Purpose**: Modal for running and viewing simulations.

**Features:**
- Simulation trigger
- Results display
- Save dialog
- Clear functionality

### Insight & Analysis Components

#### `AIInsightsPanel.tsx`
**Purpose**: AI-generated insights and recommendations.

**Features:**
- Context-aware AI analysis
- Indicator-specific insights
- Actionable recommendations
- Community stories integration

**AI Integration**: Uses `queryLocalLLM()` service

#### `InsightsPanel.tsx`
**Purpose**: General insights display panel.

**Features:**
- Statistical analysis
- Trend summaries
- Key findings

#### `InfluenceMetricsComputer.tsx`
**Purpose**: Computes and displays influence metrics.

**Features:**
- Influence score calculation
- Weight visualization
- Relationship strength indicators

#### `ComparativeAnalysis.tsx`
**Purpose**: Compares indicators across locations or time periods.

**Features:**
- Side-by-side comparison
- Difference highlighting
- Statistical significance

#### `SuggestedInitiativeBox.tsx`
**Purpose**: Displays AI-suggested community initiatives.

**Features:**
- Initiative title and description
- Action items list
- Estimated impact level
- Call-to-action buttons

**Data Source**: `generateSuggestedInitiative()` from `aiServices.ts`

### Location Components

#### `LocationPicker.tsx`
**Purpose**: Hierarchical location selector.

**Features:**
- Tree view of locations
- Search functionality
- Multi-level selection
- Selected location display

#### `EnhancedLocationPicker.tsx`
**Purpose**: Enhanced version with additional features.

**Features:**
- Autocomplete
- Breadcrumb display
- Quick selection

#### `LocationBreadcrumbs.tsx`
**Purpose**: Breadcrumb navigation for location hierarchy.

**Features:**
- Full path display
- Clickable navigation
- Current location highlight

#### `TargetLocationToggle.tsx`
**Purpose**: Toggle between selected and target locations.

### Community Components

#### `CommunityStories.tsx`
**Purpose**: Displays community stories related to indicators.

**Features:**
- Story listing
- Filter by indicator relationship
- Author information
- Vote/engagement tracking

#### `CommunityStoriesPage.tsx`
**Purpose**: Full page for browsing community stories.

**Features:**
- Story grid/list view
- Filtering and sorting
- Story submission form
- Voting mechanism

#### `QualitativeStoryBox.tsx`
**Purpose**: Individual story display component.

**Features:**
- Story text
- Author attribution
- Location context
- Photo support
- Voting UI

### Gamification Components

#### `PointsTracker.tsx`
**Purpose**: Displays user points and activity log.

**Features:**
- Total points display
- Recent activity feed
- Points breakdown by action type
- Achievement highlights

#### `BadgeRenderer.tsx`
**Purpose**: Displays user badges.

**Features:**
- Badge icons
- Badge names and descriptions
- Earned date
- Badge categories

#### `VoucherCard.tsx`
**Purpose**: Displays available vouchers.

**Features:**
- Voucher code
- Partner information
- Value display
- Expiration date
- Redeem button

#### `CommunityWallet.tsx`
**Purpose**: Consolidated gamification display.

**Features:**
- Points summary
- Badges gallery
- Vouchers list
- Leaderboard link

### Indicator Components

#### `IndicatorSelector.tsx`
**Purpose**: Dropdown selector for indicators.

**Features:**
- Searchable list
- Category grouping
- Current value display
- Filter options

#### `FriendlyIndicatorName.tsx`
**Purpose**: Converts technical indicator names to friendly phrases.

**Features:**
- AI-powered name generation
- Caching for performance
- Fallback to original name

**Implementation**: Uses `generateFriendlyIndicatorName()` from `aiServices.ts`

#### `WellbeingStatusCard.tsx`
**Purpose**: Displays overall wellbeing status.

**Features:**
- Aggregate indicator scores
- Status visualization
- Trend indicators

### Dashboard Components

#### `HeroSection.tsx`
**Purpose**: Hero banner for homepage.

**Features:**
- Engaging headline
- Call-to-action buttons
- Background graphics

#### `AssociationSummaryCard.tsx`
**Purpose**: Summary card for indicator associations.

**Features:**
- Relationship count
- Strength indicators
- Quick navigation

### Utility Components

#### `Breadcrumbs.tsx`
**Purpose**: Generic breadcrumb navigation.

**Features:**
- Configurable items
- Link support
- Icon support

#### `SettingsDialog.tsx`
**Purpose**: User settings dialog.

**Features:**
- User preferences
- Display options
- Notification settings

#### `SmartSearchBox.tsx`
**Purpose**: Global search component.

**Features:**
- Full-text search
- Indicator search
- Location search
- Recent searches

**Technology**: Fuse.js for fuzzy search

### Animation Components

#### `IntroAnimation.tsx`
**Purpose**: Introductory animation sequence.

**Features:**
- Welcome animation
- Fade-in effects
- Progressive reveal

#### `AnimatedMetrics.tsx`
**Purpose**: Animated metric displays.

**Features:**
- Count-up animations
- Progress bars
- Smooth transitions

#### `EcosystemCTA.tsx`
**Purpose**: Animated call-to-action section.

**Features:**
- Engaging animations
- Interactive elements
- Responsive design

### UI Components (`src/components/ui/`)

All shadcn/ui components are located in this directory:

- `button.tsx` - Button component
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialogs
- `dropdown-menu.tsx` - Dropdown menus
- `input.tsx` - Form inputs
- `label.tsx` - Form labels
- `select.tsx` - Select dropdowns
- `slider.tsx` - Range sliders
- `toast.tsx` - Toast notifications
- `tooltip.tsx` - Tooltips
- `tabs.tsx` - Tab navigation
ّل- `accordion.tsx` - Accordion component
- And 35+ more UI primitives

**Note**: These components follow shadcn/ui patterns and are built on Radix UI primitives with Tailwind CSS styling.

---

## Services & APIs

### `api.ts` - Core API Service

**Purpose**: Main service for indicator and relationship data.

#### Functions:

##### `getIndicators()`
Fetches all indicators from the database.

**Returns**: `Promise<Indicator[]>`

**Implementation:**
```typescript
const { data, error } = await supabase
  .from('indicators')
  .select('*');
```

##### `getIndicatorById(indicator_id: string)`
Fetches a single indicator by ID.

**Parameters:**
- `indicator_id: string` - The indicator ID

**Returns**: `Promise<Indicator>`

##### `updateIndicatorValue(indicator_id: string, new_value: number)`
Updates an indicator's current value.

**Parameters:**
- `indicator_id: string`
- `new_value: number` - New value (0-100)

**Returns**: `Promise<void>`

##### `getRelationships()`
Fetches all indicator relationships.

**Returns**: `Promise<Relationship[]>`

##### `getChildrenByParentId(parent_id: string)`
Gets all child indicators for a parent.

**Parameters:**
- `parent_id: string`

**Returns**: `Promise<Relationship[]>`

##### `getParentsByChildId(child_id: string)`
Gets all parent indicators for a child.

**Parameters:**
- `child_id: string`

**Returns**: `Promise<Relationship[]>`

##### `getTrendsByIndicatorId(indicator_id: string)`
Fetches historical trends for an indicator.

**Parameters:**
- `indicator_id: string`

**Returns**: `Promise<HistoricalTrend[]>`

**Ordering**: Sorted by year ascending

##### `recordAdminIndicatorChange()`
Logs admin changes to indicators.

**Parameters:**
```typescript
{
  indicator_id: string
  value: number
  rationale?: string
  admin_id: string
}
```

**Returns**: `Promise<{ success: boolean; error?: any }>`

**Functionality:**
1. Inserts record into `admin_inputs` table
2. Updates `indicators.current_value`

##### `updateHistoricalValue()`
Updates historical trend data with admin logging.

**Parameters:**
```typescript
{
  indicator_id: string
  year: number
  value: number
  rationale?: string
  admin_id: string
}
```

**Returns**: `Promise<{ success: boolean; error?: any }>`

**Functionality:**
1. Logs to `admin_inputs`
2. Updates or inserts `historical_trends` record

##### `predictTrend(indicator_id: string, location_id?: string)`
Predicts future indicator values using linear extrapolation.

**Parameters:**
- `indicator_id: string`
- `location_id: string` - Optional, defaults to global location

**Returns**: `Promise<PredictionResult>`

**Algorithm:**
1. Fetches historical values for location
2. Calculates average yearly change
3. Projects 3 years into future
4. Generates summary text

**Returns:**
```typescript
{
  indicator_id: string
  years: number[]           // Historical + future years
  values: number[]          // Corresponding values
  summary: string           // Textual prediction summary
}
```

##### `runSimulation(indicatorId: string, newValue: number, locationId?: string)`
Runs a what-if simulation with bidirectional propagation.

**Parameters:**
- `indicatorId: string`
- `newValue: number`
- `locationId: string` - Optional

**Returns**: `Promise<Array<{indicator_id: string; previous_value: number; new_value: number}>>`

**Algorithm:**
1. Gets current indicator values for location
2. Calculates initial delta
3. Propagates changes:
   - **Downstream**: Parent → Children (using `influence_weight`)
   - **Upstream**: Child → Parents (using `child_to_parent_weight`)
4. Continues propagation until changes become negligible
5. Returns all affected indicators with new values

**Propagation Logic:**
- Uses BFS traversal
- Applies influence weights as multipliers
- Constraints values to 0-100 range
- Skips negligible changes (< 0.01)

##### `getQualitativeStories(parent_id: string, child_id: string)`
Fetches community stories for a relationship.

**Parameters:**
- `parent_id: string`
- `child_id: string`

**Returns**: `Promise<QualitativeStory[]>`

**Limits**: Returns top 3 most recent stories

##### `createQualitativeStory()`
Creates a new community story.

**Parameters:**
```typescript
{
  parent_id: string
  child_id: string
  story_text: string
  author: string
  location: string
  photo: string | null
}
```

**Returns**: `Promise<QualitativeStory>`

##### `createSimulation()`
Saves a simulation profile with changes.

**Parameters:**
- `name: string`
- `description: string`
- `changes: SimulationChange[]`

**Returns**: `Promise<string>` - Simulation ID

**Functionality:**
1. Creates `simulation_profiles` record
2. Inserts `simulation_changes` records

##### `getSimulationById(simulation_id: string)`
Retrieves a saved simulation.

**Returns**: `Promise<{ profile: SimulationProfile; changes: SimulationChange[] }>`

##### `getUserSimulations(user_id?: string)`
Gets simulations for a user or all simulations.

**Parameters:**
- `user_id?: string` - Optional, filters by user

**Returns**: `Promise<SimulationProfile[]>`

### `surveyApi.ts` - Survey Service

#### Functions:

##### `getSurveys()`
Fetches all active surveys.

**Returns**: `Promise<Survey[]>`

**Filter**: Only `status = 'active'`

##### `getSurveyQuestions(surveyId: string)`
Gets all questions for a survey.

**Parameters:**
- `surveyId: string`

**Returns**: `Promise<SurveyQuestion[]>`

##### `submitSurveyResponse()`
Submits a user response to a survey question.

**Parameters:**
```typescript
Omit<RelationshipUserResponse, 'response_id' | 'created_at'>
```

**Returns**: `Promise<void>`

##### `submitSurveyAnswer()`
Submits a survey answer (web or voice).

**Parameters:**
```typescript
Omit<SurveyResponse, 'id' | 'created_at'>
```

**Returns**: `Promise<void>`

##### `getSurveyResponses(surveyId: string)`
Gets all responses for a survey.

**Returns**: `Promise<SurveyResponse[]>`

##### `getSurveysForApproval(locationId: string)`
Gets surveys pending approval for a location.

**Returns**: `Promise<any[]>`

**Filter**: `status = 'pending_approval'` AND `target_location = locationId`

##### `approveSurvey(surveyId: string, repId: string)`
Approves a survey (community rep action).

**Parameters:**
- `surveyId: string`
- `repId: string` - Community rep user ID

**Returns**: `Promise<void>`

**Updates:**
- `status` → `'active'`
- `approved_by_rep` → `repId`
- `approved_at` → Current timestamp

##### `declineSurvey(surveyId: string, repId: string, reason: string)`
Declines a survey with reason.

**Updates:**
- `status` → `'declined'`
- `approved_by_rep` → `repId`
- `declined_reason` → `reason`

### `voiceCallApi.ts` - Voice Call Service

#### Functions:

##### `scheduleVoiceCalls(surveyId: string, locationId: string)`
Schedules voice calls for all eligible survey participants.

**Parameters:**
- `surveyId: string`
- `locationId: string`

**Returns**: `Promise<number>` - Number of calls scheduled

**Process:**
1. Calls `get_survey_target_users()` database function
2. Creates `voice_call_attempts` records with random scheduling (within 1 hour)
3. Creates `survey_notifications` for SMS pre-call alerts
4. Returns count of scheduled calls

##### `getCallAttempts(surveyId: string)`
Gets all call attempts for a survey.

**Returns**: `Promise<VoiceCallAttempt[]>`

**Ordering**: By `scheduled_at` ascending

##### `updateCallAttempt(attemptId: string, updates: Partial<VoiceCallAttempt>)`
Updates a call attempt record.

**Use Cases:**
- Mark as completed
- Record failure reason
- Update call duration
- Set Twilio call SID

##### `makeTestCall(phoneNumber: string)`
Makes a test voice call using Twilio.

**Parameters:**
- `phoneNumber: string`

**Returns**: `Promise<any>` - Twilio call result

##### `getSurveyNotifications(userId: string)`
Gets窗notifications for a user.

**Returns**: `Promise<SurveyNotification[]>`

**Ordering**: By `sent_at` descending

##### `markNotificationDelivered(notificationId: string)`
Marks a notification as delivered.

### `gamificationApi.ts` - Gamification Service

#### Functions:

##### `awardPoints(userId: string, actionType: string, points: number, metadata?: any)`
Awards points to a user for an action.

**Parameters:**
- `userId: string`
- `actionType: 'survey_completed' | 'referral' | 'upload' | 'admin_bonus'`
- `points: number`
- `metadata: any` - Optional metadata

**Returns**: `Promise<void>`

**Side Effects:**
- Inserts into `user_points_log`
- Checks and awards badges automatically

##### `getUserPoints(userId: string)`
Gets user's points summary.

**Returns**: `Promise<UserPoints>`

**Structure:**
```typescript
{
  total_points: number
  recent_activities: Array<{
    action_type: string
    points_awarded: number
    created_at: string
    metadata: any
  }>
}
```

##### `getUserBadges(userId: string)`
เดียวกันGets all badges for a user.

**Returns**: `Promise<UserBadge[]>`

**Badge Types:**
- `survey_starter` - 1+ survey completions
- `5x_participant` - 5+ survey completions
- `community_champion` - 10+ survey completions

##### `getUserVouchers(userId: string)`
Gets unredeemed vouchers for a user.

**Returns**: `Promise<UserVoucher[]>`

**Filter**: `is_redeemed = false`

##### `redeemVoucher(voucherId: string)`
Marks a voucher as redeemed.

**Updates**: `is_redeemed = true`

##### `checkAndAwardBadges(userId: string)` (Private)
Internal function that checks survey completion count and awards badges.

### `aiServices.ts` - AI Service

#### Functions:

##### `generateSuggestedInitiative(storyText: string, indicatorName: string, locationName: string)`
Generates AI-suggested community initiative from a story.

**Parameters:**
- `storyText: string` - Community story text
- `indicatorName: string` - Related indicator
- `locationName: string` - Location context

**Returns**: `Promise<SuggestedInitiative>`

**Structure:**
```typescript
{
  title: string                  // Max 60 chars
  description: string            // Max 200 chars
  actionItems: string[]          // 3-4 items
  estimatedImpact: 'Low' | 'Medium' | 'High'
}
```

**Implementation**: Uses `queryLocalLLM()` with community mode

##### `generateFriendlyIndicatorName(indicatorName: string, category: string)`
Converts technical indicator names to friendly phrases.

**Parameters:**
- `indicatorName: string`
- `category: string`

**Returns**: `Promise<string>`

**Fallback**: Returns original name on error

**Implementation**: Uses `queryLocalLLM()` with community mode

### `localLLM.ts` - Local LLM Integration

#### Functions:

##### `queryLocalLLM(prompt: string, mode?: 'business' | 'community')`
Queries the local LLM (Ollama via proxy).

**Parameters:**
- `prompt: string` - User prompt
- `mode: 'business' | 'community'` - Context mode (default: 'community')

**Returns**: `Promise<string>` - LLM response text

**Process:**
1. Loads context from `llmContext.md`
2. Builds contextual prompt with mode-specific instructions
3. POSTs to `/api/local-llm` endpoint
4. Returns `analysisText` from response

**API Endpoint**: Configurable via `VITE_LLM_API_URL` env var (default: `/api/local-llm`)

**Error Handling**: Throws error on API failure

### `locationApi.ts` - Location Service

**Purpose**: Handles location-related queries.

**Functions**: Location fetching, path resolution, children queries (typically uses Supabase directly or database functions)

### `communityStoriesApi.ts` - Community Stories Service

**Purpose**: Handles community story operations.

**Functions**: Story CRUD operations, voting, filtering

### `benchmarksApi.ts` - Benchmarks Service

**Purpose**: Handles benchmark (target value) operations.

**Functions**: Benchmark CRUD, target value comparisons

---

## Hooks & Custom Hooks

### `useAuth.tsx` - Authentication Hook

**Purpose**: Provides authentication state and methods.

**Context**: `AuthContext`

**Returns:**
```typescript
{
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string) => Promise<{error: any}>
  signIn: (email: string, password: string) => Promise<{error: any}>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{error: any}>
}
```

**Implementation Details:**
- Uses Supabase Auth state listener
- Automatically fetches profile on auth change
- Provides toast notifications for errors
- Handles session persistence

### `useDriverComputation.ts` - Driver Computation Hook

**Purpose**: Computes lagging and thriving drivers for an indicator.

**Parameters:**
```typescript
coreIndicator: Indicator | null
indicators: Indicator[]
relationships: Relationship[]
visibleNodes: SunburstNode[]
```

**Returns:**
```typescript
{
  laggingDrivers: Indicator[]      // Bottom 3 by value
  thrivingDrivers: Indicator[]     // Top 3 by value
  visibleLinkedIndicators: Indicator[]  // All linked indicators in view
}
```

**Algorithm:**
1. Traverses relationships up to 3 levels deep from core indicator
2. Filters to only indicators visible in sunburst
3. Sorts by `current_value`
4. Returns top 3 and bottom 3

**Memoization**: Uses `useMemo` for performance

### `usePrediction.ts` - Prediction Hook

**Purpose**: Fetches and manages prediction data for indicators.

**Implementation**: Likely wraps `predictTrend()` API call with React Query

### `useRecommendations.ts` - Recommendations Hook

**Purpose**: Generates AI-powered recommendations.

**Implementation**: Likely uses `generateSuggestedInitiative()` with caching

### `use-mobile.tsx` - Mobile Detection Hook

**Purpose**: Detects mobile device.

**Returns**: `boolean` - Is mobile device

**Implementation**: Checks window width or user agent

### `use-toast.ts` - Toast Hook

**Purpose**: Provides toast notification functionality.

**Returns**: `{ toast: (options) => void }`

**Implementation**: Wraps shadcn/ui toast component

---

## Context Providers

### `EcosystemContext.tsx`

**Purpose**: Global state for indicators and relationships.

**State:**
```typescript
{
  indicators: Indicator[]
  relationships: Relationship[]
  loading: boolean
  error: Error | null
  userSettings: UserSettings
  updateUserSettings: (settings: Partial<UserSettings>) => void
  refreshData: () => Promise<void>
}
```

**Default Settings:**
```typescript
{
  maxDrillDepth: 3
  topDriversCount: 3
  showPercentileDrivers: false
  percentileThreshold: 95
}
```

**Persistence**: Settings saved to `localStorage` as `ecosystemSettings`

**Initialization**: Fetches indicators and relationships on mount

**Usage**: `const { indicators, relationships, loading } = useEcosystem();`

### `UserContext.tsx`

**Purpose**: User profile state management.

**State:**
```typescript
{
  userProfile: UserProfile | null
  updateProfile: (profile: Partial<UserProfile>) => void
  isOnboardingComplete: boolean
  setOnboardingComplete: (complete: boolean) => void
}
```

**Initialization:**
1. Checks `localStorage` for saved profile
2. Falls back to Supabase `profiles` table
3. Merges with Supabase Auth user data

**Persistence**: Auto-saves to `localStorage` on changes

**Usage**: `const { userProfile, updateProfile } = useUser();`

### `LocationContext.tsx`

**Purpose**: Selected and target location state.

**State:**
```typescript
{
  selectedLocation: Location | null
  targetLocation: Location | null
  setSelectedLocation: (location: Location | null) => void
  setTargetLocation: (location: Location | null) => void
}
```

**Usage**: `const { selectedLocation, setSelectedLocation } = useLocation();`

---

## Pages & Routing

### `Home.tsx` / `Homepage.tsx`
**Route**: `/` or `/home`

**Purpose**: Landing page for authenticated users.

**Features:**
- Welcome message
- Quick navigation cards
- Recent activity summary
- Hero section

### `Dashboard.tsx`
**Route**: `/dashboard`

**Protection**: ProtectedRoute

**Purpose**: User dashboard with personalized content.

**Features:**
- User stats
- Recent surveys
- Points summary
- Quick actions

### `RepDashboard.tsx`
**Route**: `/rep-dashboard`

**Protection**: ProtectedRoute + RoleProtectedRoute (community_rep, admin)

**Purpose**: Community representative dashboard.

**Features:**
- Surveys pending approval
- Location engagement metrics
- Response rates
- Approval workflow

### `AdminDashboard.tsx`
**Route**: `/admin`

**Protection**: ProtectedRoute + RoleProtectedRoute (admin)

**Purpose**: Administrative dashboard.

**Features:**
- System overview
- User management
- Indicator management
- Survey oversight
- Analytics

### `Overview.tsx`
**Route**: `/overview`

**Protection**: ProtectedRoute

**Purpose**: Ecosystem overview with sunburst visualization.

**Features:**
- Sunburst chart
- Roamer-three navigation
- Indicator details panel
- Breadcrumbs

### `DetailView.tsx`
**Route**: `/detail/:indicatorId`

**Protection**: ProtectedRoute

**Purpose**: Detailed view for a specific indicator.

**Features:**
- Indicator information
- Historical trends
- Related indicators
- Simulation panel
- AI insights
- Community stories

### `ResearchPage.tsx`
**Route**: `/research/:indicatorId`

**Protection**: ProtectedRoute

**Purpose**: Research-focused view for indicators.

**Features:**
- Deep dive analysis
- Statistical breakdown
- Relationship analysis
- Data export options

### `CommunityStoriesPage.tsx`
**Route**: `/stories`

**Protection**: ProtectedRoute

**Purpose**: Browse and submit community stories.

**Features:**
- Story listing
- Filtering by indicator
- Story submission form
- Voting system

### `TreeMapPage.tsx`
**Route**: `/treemap`

**Protection**: ProtectedRoute

**Purpose**: Alternative visualization using tree map.

**Features:**
- Tree map layout
- Size-coded indicators
- Interactive navigation

### `SurveysPage.tsx`
**Route**: `/surveys`

**Purpose**: Survey listing and management.

**Features:**
- Survey cards
- Filter by status
- Create survey button
- Response tracking

### `Profile.tsx`
**Route**: `/profile`

**Purpose**: User profile page.

**Features:**
- Profile information
- Edit profile form
- Points and badges
- Activity history

### `OnboardingSurvey.tsx`
**Route**: `/onboarding`

**Purpose**: Initial onboarding survey for new users.

**Features:**
- Demographic questions
- Location selection
- Interest preferences
- Completion tracking

### `Wallet.tsx`
**Route**: `/wallet`

**Protection**: ProtectedRoute

**Purpose**: Gamification wallet.

**Features:**
- Points display
- Badges gallery
- Vouchers list
- Redemption interface

### `ResearcherInsights.tsx`
**Route**: `/researcher/insights`

**Protection**: ProtectedRoute + RoleProtectedRoute (researcher, admin)

**Purpose**: Advanced research tools.

**Features:**
- Statistical analysis
- Export capabilities
- Advanced filtering
- Data visualization tools

### `Leaderboard.tsx`
**Route**: `/leaderboard`

**Protection**: ProtectedRoute

**Purpose**: User leaderboard.

**Features:**
- Top users by points
- Badge achievements
- Category rankings

### `Auth.tsx`
**Route**: `/auth`

**Purpose**: Authentication page.

**Features:**
- Sign in form
- Sign up form
- Password reset
- Email confirmation

### `About.tsx`
**Route**: `/about`

**Purpose**: About page.

**Features:**
- Project information
- Team credits
- Usage guide

### `NotFound.tsx`
**Route**: `*` (catch-all)

**Purpose**: 404 error page.

---

## Supabase Edge Functions

### `compute-influence-metrics/index.ts`

**Purpose**: Computes influence scores and weights for indicator relationships using statistical methods.

**Trigger**: Manual invocation or scheduled

**Algorithm Overview:**

1. **Data Fetching**:
   - Fetches all indicators, historical trends, and relationships

2. **Data Validation**:
   - Filters indicators with at least 5 years of historical data
   - Normalizes data using Z-score standardization

3. **Influence Score Calculation** (Correlation-based):
   - Groups relationships by parent indicator
   - For each parent's children, calculates correlation matrix
   - Uses average correlation with siblings as influence score
   - Range: 0.01 to 1.0

4. **Influence Weight Calculation** (OLS Regression):
   - Uses 1-year lagged regression: `parent[t+1] = f(children[t])`
   - Performs multiple linear regression
   - Coefficients become influence weights
   - Scaled to -100 to 100 range

5. **Update Relationships**:
   - Updates `influence_score` and `influence_weight` fields
   - Skips relationships with insufficient data

**Statistical Functions:**
- `mean()` - Arithmetic mean
- `standardDeviation()` - Population standard deviation
- `zScore()` - Z-score normalization
- `correlation()` - Pearson correlation coefficient
- `linearRegression()` - OLS regression with matrix operations
- `matrixInverse()` - Gaussian elimination for matrix inversion

**Response:**
```typescript
{
  success: boolean
  message: string
  summary: {
    totalIndicators: number
    validIndicators: number
    totalRelationships: number
    updatedRelationships: number
    skippedRelationships: number
    influenceScoreRange: { min: number; max: number }
    influenceWeightRange: { min: number; max: number }
  }
}
```

**CORS**: Enabled for all origins

### `twilio-voice-handler/index.ts`

**Purpose**: Initiates Twilio voice calls for surveys.

**Trigger**: HTTP POST request

**Request Body:**
```typescript
{
  surveyId: string
  userId: string
  phoneNumber: string
}
```

**Process:**
1. Validates required parameters
2. Fetches survey and questions from database
3. Generates TwiML (Twilio Markup Language) for the call
4. Creates `voice_call_attempts` record
5. Makes Twilio API call to initiate voice call
6. Updates attempt with Twilio call SID

**TwiML Generation:**
- Introduction message
- Question prompts (slider = DTMF, text = voice recording)
- Thank you message
- Hangup

**Response:**
```typescript
{
  success: boolean
  callSid?: string
  message?: string
  error?: string
}
```

**Error Handling**: Returns 500 with error message on failure

### `twilio-response-handler/index.ts`

**Purpose**: Handles responses from Twilio voice calls.

**Trigger**: Twilio webhook (POST from Twilio)

**Process:**
1. Receives DTMF digits or recorded audio
2. Parses response based on question type
3. Stores in `survey_responses` table
4. Returns TwiML for next question or completion

**TwiML Response**: Returns appropriate TwiML to continue or end survey

---

## Configuration Files

### `package.json`

**Scripts:**
- `dev` - Start Vite dev server
- `build` - Production build
- `proxy` - Start LLM proxy Next server
- `build:dev` - Development build
- `lint` - Run ESLint
- `preview` - Preview production build
- `start` - Start LLM proxy
- `dev:all` - Concurrent dev server + proxy

**Key Dependencies:**
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Supabase JS 2.50.3
- React Router  6.30.1
- D3.js 7.9.0
- Twilio 5.7.2
- And 50+ more

### `vite.config.ts`

**Configuration:**
- Port: 5173
- Proxy: `/api` → `http://localhost:8080` (LLM proxy)
- Alias: `@` → `./src`
- Plugin: React SWC + component tagger (dev mode)

**Build Options:**
- Output: `dist/`
- Source maps: Enabled

### `tsconfig.json`

**Configuration:**
- Target: ESNext
- Module: ESNext
- JSX: react-jsx
- Strict: true
- Path alias: `@/*` → `./src/*`

**Composites**: Uses project references for app and node configs

### `tailwind.config.ts`

**Configuration:**
- Dark mode: Class-based
- Content paths: All `.tsx`, `.ts` files
- Theme: Extended with shadcn/ui colors
- Plugins: `tailwindcss-animate`

**Color System**: HSL-based with CSS variables

### `llm-proxy.js`

**Purpose**: Express server proxy for Ollama LLM.

**Endpoint**: `POST /api/local-llm`

**Process:**
1. Receives prompt in request body
2. Forwards to Ollama at `http://localhost:11434/api/generate`
3. Uses model: `tinyllama:1.1b`
4. Returns `{ analysisText: response }`

**Port**: 8080

**Note**: Requires Ollama running locally

### `components.json`

**Purpose**: shadcn/ui configuration.

**Settings:**
- Style: default
- Tailwind CSS path
- Components directory
- Utils path
- UI framework: React

---

## Build & Deployment

### Development Setup

1. **Prerequisites:**
   ```bash
   - Node.js 18+ and npm
   - Supabase account and project
   - Ollama installed (for LLM features)
   - Twilio account (for voice features)
   ```

2. **Installation:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_LLM_API_URL=http://localhost:8080/api/local-llm
   ```

4. **Start Development:**
   ```bash
   npm run dev:all
   ```
   This starts both Vite (port 5173) and LLM proxy (port 8080)

5. **Start Ollama:**
   ```bash
   ollama serve
   ```

### Production Build

1. **Build:**
   ```bash
   npm run build
   ```
   Output: `dist/` directory

2. **Preview:**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Vercel / Netlify
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

#### Docker
- `Dockerfile` provided
- Build: `docker build -t ecosystem-project .`
- Run: `docker run -p 3000:3000 ecosystem-project`

#### Supabase Hosting
- Can host static files via Supabase Storage
- Edge functions already deployed to Supabase

### Environment Variables

**Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `VITE_LLM_API_URL` - LLM proxy URL (default: `/api/local-llm`)

**Supabase Edge Functions:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### Database Migrations

Migrations are located in `supabase/migrations/`.

**Apply migrations:**
```bash
supabase db push
```

**Or via Supabase Dashboard:**
- Go to SQL Editor
- Copy migration SQL
- Execute

### Testing

**Linting:**
```bash
npm run lint
```

**Type Checking:**
```bash
npx tsc --noEmit
```

---

## Additional Notes

### Performance Optimizations

1. **React Query**: Caches API responses to reduce database calls
2. **Memoization**: `useMemo` in computation-heavy hooks
3. **Lazy Loading**: Code splitting for routes
4. **Image Optimization**: Lazy loading for images
5. **Debouncing**: Search inputs debounced

### Security Considerations

1. **Row Level Security (RLS)**: Should be enabled on Supabase tables
2. **Authentication**: All protected routes require valid session
3. **Role-Based Access**: Additional checks for admin/researcher routes
4. **Input Validation**: Zod schemas for form validation
5. **XSS Protection**: React escapes by default, but sanitize user input

### Accessibility

1. **Keyboard Navigation**: All interactive elements keyboard accessible
2. **ARIA Labels**: Proper labeling for screen readers
3. **Color Contrast**: WCAG AA compliant
4. **Focus Management**: Visible focus indicators

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome Mobile

---

## Conclusion

This documentation provides a comprehensive overview of the Ecosystem Project's technical architecture, components, services, and deployment. For specific implementation details, refer to the source code in the respective files.

**Last Updated**: Generated from codebase analysis
**Version**: 0.1.0

