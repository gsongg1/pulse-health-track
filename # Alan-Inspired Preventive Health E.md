# Alan-Inspired Preventive Health Engagement Platform
## Codex Build Brief

Build a polished full-stack web app that demonstrates strong product thinking, privacy-aware design, and practical health-tech workflow design. The product should feel like something a modern digital insurance and prevention company would actually ship for employer benefits customers.

---

## Project Summary

Create a web application called **Pulse**.

Pulse is a preventive health engagement platform for employers. Employees complete very short daily or weekly check-ins about sleep, stress, movement, focus, and workload. The system turns those signals into personalized, explainable wellness nudges and optional team challenges. HR and managers only see anonymized aggregate trends, never individual private health entries.

The product should not feel like a generic fitness tracker. It should feel like a calm, privacy-first, employer wellness product that helps reduce burnout risk and improve healthy routines.

---

## Product Goals

The project should show:

- strong product sense
- clean full-stack execution
- realistic business relevance
- privacy-aware design
- thoughtful analytics
- trust and restraint in health-related UX

This is not a medical device and should never diagnose or imply diagnosis.

---

## Target Users

### 1. Employee
An employee who wants lightweight support for healthier daily habits without friction or surveillance.

### 2. HR Admin
An employer admin who wants anonymized trend-level insight into overall team wellbeing and engagement without seeing private individual-level data.

### 3. Team Lead
A manager who may view very high-level team participation and challenge engagement metrics only if permissions allow it.

---

## Core Product Concept

Users complete short check-ins. The system computes simple wellness scores and recommends the best next action. Over time it adapts based on what the user actually completes. Employers see only aggregated health trends, participation, and challenge engagement.

Example recommendation logic:
- high stress for 3 consecutive check-ins plus low sleep leads to a recovery-focused recommendation
- low movement plus low focus leads to a movement break suggestion
- sustained high workload leads to a burnout prevention recommendation
- low consistency leads to a smaller easier action instead of a more demanding one

---

## V1 Scope

Build these features fully.

### Employee-facing
- authentication
- onboarding flow
- daily or weekly check-in flow
- personalized recommendation feed
- recommendation history
- action completion tracking
- streaks
- team challenges
- personal trend dashboard
- privacy settings page

### Admin-facing
- organization dashboard
- anonymized aggregate metrics
- challenge participation stats
- wellbeing trend charts
- department-level filtering if data supports it
- privacy explainer section

### System
- rules-based recommendation engine
- wellness score calculation
- seeded demo data
- analytics event tracking
- role-based access control

---

## Suggested Tech Stack

Use this stack unless there is a strong reason not to:

- **Frontend:** Next.js with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui
- **Charts:** Recharts
- **Backend:** Next.js API routes or a separate Express/Nest backend
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth or Clerk
- **Form handling:** React Hook Form + Zod
- **State management:** minimal local state plus server actions or React Query
- **Scheduling:** cron job or background worker for nudges and recurring challenge resets
- **Deployment:** Vercel for frontend, Neon or Supabase Postgres for database

Keep the structure clean and production-like.

---

## Design Direction

The visual design should feel:
- calm
- modern
- premium
- minimal
- trustworthy
- slightly health-oriented without being overly playful

Use:
- spacious layout
- soft cards
- subtle gradients only if tasteful
- clear hierarchy
- muted tones
- excellent empty states
- polished charts
- readable text
- clear privacy messaging

Do not make it look like a student dashboard full of generic bright charts.

---

## Main User Flows

### 1. Employee onboarding
Flow:
1. user signs up or signs in
2. user joins an organization
3. user completes a short onboarding questionnaire
4. user sees a baseline wellness summary
5. user receives first recommended action

Onboarding questions:
- typical sleep quality
- weekly movement level
- current stress baseline
- work arrangement
- preferred nudge types
- check-in frequency preference
- challenge participation preference

### 2. Daily check-in
Fields:
- sleep quality from 1 to 5
- stress from 1 to 5
- movement from 1 to 5
- focus from 1 to 5
- workload intensity from 1 to 5
- optional note

After submission:
- recompute wellness scores
- save check-in
- show updated recommendation

### 3. Recommendation acceptance
Flow:
1. employee views recommended action
2. employee sees short explanation for why this recommendation was selected
3. employee can mark complete, snooze, or dismiss
4. system records interaction
5. future recommendations adapt based on this behavior

### 4. Team challenge participation
Flow:
1. employee browses active team challenges
2. employee joins challenge
3. employee logs completion
4. personal and team progress update

### 5. Admin dashboard
Flow:
1. admin opens dashboard
2. sees anonymized org metrics
3. filters by timeframe and department
4. reviews participation and trend charts
5. never sees private employee notes or personal check-in entries

---

## Key Pages

Build the following pages.

### Public
- landing page
- sign in
- sign up

### Employee
- `/app/dashboard`
- `/app/check-in`
- `/app/recommendations`
- `/app/history`
- `/app/challenges`
- `/app/profile`
- `/app/privacy`

### Admin
- `/admin/dashboard`
- `/admin/challenges`
- `/admin/insights`
- `/admin/privacy`

### Shared / System
- organization selector or invite page
- not found page
- unauthorized page

---

## Detailed Feature Requirements

## 1. Authentication and Roles

Support:
- employee role
- admin role
- optional manager role

Each user belongs to one organization in V1.

RBAC rules:
- employees can access only their own data
- admins can access only aggregated organization insights
- admins cannot see individual notes or raw check-in records tied to identifiable users in the UI
- managers, if included, get limited aggregated team views only

---

## 2. Onboarding Questionnaire

Collect enough data to personalize recommendations but keep it lightweight.

Store:
- baselineSleep
- baselineStress
- baselineMovement
- workMode
- preferredNudgeCategories
- challengeOptIn
- checkInFrequency

At the end of onboarding:
- generate baseline scores
- generate first recommendation
- show “how your privacy works” card

---

## 3. Check-in System

A check-in should take less than 30 seconds.

Each check-in record includes:
- userId
- date
- sleepScore
- stressScore
- movementScore
- focusScore
- workloadScore
- optionalNote
- createdAt

Rules:
- only one check-in per day for daily mode
- support weekly mode with one summarized check-in if desired
- prevent duplicate submissions for same period

---

## 4. Recommendation Engine

Use a deterministic rules engine in V1. Do not rely on LLMs for the core logic.

Recommendation categories:
- movement
- recovery
- focus
- sleep hygiene
- stress regulation
- workload management
- social wellbeing
- escalation to support resources

Each recommendation should include:
- title
- short description
- category
- estimated effort
- explanation text
- reason code
- priority
- completion CTA

Example recommendations:
- take a 10-minute walk
- do a 2-minute breathing reset
- step away from your screen for 5 minutes
- plan a shutdown routine at the end of the day
- stretch after prolonged sitting
- review workload boundaries
- explore support resources

Example rules:
- if stress >= 4 for 3 recent check-ins and sleep <= 2, recommend recovery or breathing
- if movement <= 2 and focus <= 2, recommend movement break
- if workload >= 4 for 5 recent check-ins, recommend workload reflection or support resource
- if recommendation completion rate is low, lower effort level for next recommendation
- if user has recently dismissed multiple recommendations in same category, diversify category

Need an explanation generator:
- “Recommended because your stress has been elevated for the last 3 check-ins.”
- “Recommended because low movement often correlates with lower focus in your recent check-ins.”

---

## 5. Wellness Score Model

Implement transparent scores.

Suggested scores:
- burnoutRiskScore from 0 to 100
- recoveryScore from 0 to 100
- engagementScore from 0 to 100
- consistencyScore from 0 to 100

Example approach:
- burnout risk rises with repeated high stress, high workload, poor sleep, low focus
- recovery score rises with better sleep and lower stress
- engagement score rises with challenge participation, action completion, and check-in consistency
- consistency score rises with repeated healthy routine completion

These can be simple weighted formulas.

---

## 6. Recommendation Feedback Loop

Track:
- viewed
- completed
- snoozed
- dismissed

Use this to personalize later recommendations:
- prioritize categories with higher completion
- reduce effort when dismiss rates are high
- resurface previously successful action types
- avoid immediate repetition

---

## 7. Team Challenges

Challenge model should support:
- title
- description
- type
- start date
- end date
- target metric
- organizationId
- participation count

Challenge examples:
- 5-day walking streak
- hydration challenge
- midday stretch challenge
- digital shutdown challenge
- mindful minute challenge

Employee experience:
- browse active challenges
- join or leave
- mark progress
- see leaderboard only if anonymized or alias-based
- see team completion percentage

Admin experience:
- create or activate seeded challenges
- view aggregate participation
- view challenge completion trends

---

## 8. Personal Dashboard

Employee dashboard should show:
- today’s recommendation
- latest wellness summary
- streak count
- recent challenge status
- trend cards for stress, sleep, focus
- recent completed actions

Keep it concise and friendly.

---

## 9. Admin Insights Dashboard

Admin dashboard should include only aggregated metrics.

Metrics:
- participation rate
- check-in completion rate
- recommendation completion rate
- average stress trend
- average sleep trend
- average focus trend
- burnout risk distribution in broad buckets
- active challenge participation
- weekly active users

Filters:
- last 7 days
- last 30 days
- last 90 days
- department, if seeded

Very important:
- do not expose personally identifiable health records
- if group size is too small, suppress the chart or show a privacy threshold warning

Privacy threshold rule example:
- do not display segmented data for groups smaller than 5 users

---

## 10. Privacy and Transparency

This is a major part of the project. Make it excellent.

Need a dedicated privacy page that explains:
- what data is collected
- what is used for recommendations
- what admins can see
- what admins cannot see
- how optional notes are handled
- how users can delete their data
- whether challenge participation is visible
- what is anonymized vs personal

Add controls for:
- export my data
- delete my data
- opt out of challenges
- hide optional notes from any analytics pipeline
- reduce reminder frequency

This page should feel deliberate and trustworthy.

---

## Data Model

Use Prisma and PostgreSQL.

Suggested schema:

### User
- id
- name
- email
- role
- organizationId
- department
- createdAt
- updatedAt

### Organization
- id
- name
- size
- createdAt
- updatedAt

### OnboardingProfile
- id
- userId
- baselineSleep
- baselineStress
- baselineMovement
- workMode
- preferredNudgeCategories as array or JSON
- challengeOptIn
- checkInFrequency
- createdAt
- updatedAt

### CheckIn
- id
- userId
- date
- sleepScore
- stressScore
- movementScore
- focusScore
- workloadScore
- optionalNote nullable
- createdAt

### WellnessSnapshot
- id
- userId
- date
- burnoutRiskScore
- recoveryScore
- engagementScore
- consistencyScore
- createdAt

### Recommendation
- id
- userId
- category
- title
- description
- explanation
- reasonCode
- effortLevel
- status
- generatedAt
- completedAt nullable
- dismissedAt nullable
- snoozedUntil nullable

### Challenge
- id
- organizationId
- title
- description
- challengeType
- targetValue
- startDate
- endDate
- createdAt

### ChallengeParticipation
- id
- challengeId
- userId
- progressValue
- joinedAt
- completedAt nullable

### AnalyticsEvent
- id
- userId nullable
- organizationId nullable
- eventType
- metadata JSON
- createdAt

### PrivacyPreference
- id
- userId
- challengeOptIn
- notesAnalyticsOptIn
- reminderFrequency
- dataDeletionRequestedAt nullable

---

## API / Server Actions Requirements

If using API routes, expose routes similar to:

### Auth / User
- `GET /api/me`
- `PATCH /api/me`
- `GET /api/me/privacy`
- `PATCH /api/me/privacy`

### Onboarding
- `POST /api/onboarding`
- `GET /api/onboarding`

### Check-ins
- `POST /api/checkins`
- `GET /api/checkins`
- `GET /api/checkins/latest`

### Recommendations
- `GET /api/recommendations/current`
- `GET /api/recommendations/history`
- `POST /api/recommendations/:id/complete`
- `POST /api/recommendations/:id/snooze`
- `POST /api/recommendations/:id/dismiss`

### Challenges
- `GET /api/challenges`
- `POST /api/challenges/:id/join`
- `POST /api/challenges/:id/progress`
- `POST /api/challenges/:id/leave`

### Admin
- `GET /api/admin/overview`
- `GET /api/admin/trends`
- `GET /api/admin/challenges`
- `GET /api/admin/privacy-summary`

### Privacy
- `POST /api/privacy/export`
- `POST /api/privacy/delete-request`

---

## Recommendation Engine Implementation Details

Create a dedicated service layer for recommendations.

Suggested structure:
- `lib/recommendation-engine/`
  - `rules.ts`
  - `score-calculator.ts`
  - `explanation-builder.ts`
  - `selector.ts`
  - `types.ts`

### Scoring logic
Implement simple helper functions:
- `calculateBurnoutRisk(checkIns)`
- `calculateRecoveryScore(checkIns)`
- `calculateEngagementScore(checkIns, completions, challenges)`
- `calculateConsistencyScore(checkIns, completions)`

### Rule evaluation
Implement rules as pure functions that produce candidate recommendations with priorities.

Example:
- `detectSustainedStress`
- `detectLowMovementLowFocus`
- `detectPoorSleepTrend`
- `detectHighWorkloadPattern`
- `detectLowCompletionPattern`

### Final recommendation selection
Take candidate recommendations and rank by:
- urgency
- user preference match
- recent repetition penalty
- completion history
- effort appropriateness

Return one primary recommendation and optionally 2 secondary suggestions.

---

## Seed Data Requirements

Include a seeded demo organization with realistic fake users and records.

Suggested demo organization:
- name: Northstar Health Labs
- size: 40

Suggested sample users:
- Sophie, consultant, high stress and low sleep trend
- Daniel, engineer, low movement and low focus trend
- Maya, team lead, healthier baseline and strong challenge participation
- Priya, HR admin
- several additional fake employees for aggregate charts

Seed:
- at least 30 users
- 30 days of historical check-ins
- 3 active challenges
- recommendation history
- enough engagement variety to make charts interesting

This is critical for demo quality.

---

## Analytics Requirements

Track product analytics events such as:
- signed_up
- completed_onboarding
- submitted_checkin
- viewed_recommendation
- completed_recommendation
- snoozed_recommendation
- dismissed_recommendation
- joined_challenge
- completed_challenge_action
- viewed_admin_dashboard
- requested_data_export
- requested_data_deletion

Use these for dashboard metrics or internal debugging.

---

## Security and Trust Requirements

Must include:
- role-based access control
- server-side authorization checks
- input validation using Zod
- privacy thresholds for admin segmentation
- clear data ownership language
- no individual health record exposure in admin UI
- audit-safe structure even if full audit logs are not implemented

Optional but strong:
- lightweight audit log for admin actions
- data retention note
- explicit “not medical advice” disclaimer

---

## Nice-to-Have Features

Only do these after the core product is polished.

- email or in-app reminder scheduling
- more advanced personalization model
- calendar-aware recommendation timing
- alias-based leaderboard
- downloadable admin summary PDF
- organization invite flow
- support resources directory
- multilingual support
- dark mode

Do not let these weaken the core.

---

## Folder Structure Suggestion

```text
src/
  app/
    (public)/
    app/
      dashboard/
      check-in/
      recommendations/
      history/
      challenges/
      profile/
      privacy/
    admin/
      dashboard/
      challenges/
      insights/
      privacy/
    api/
      ...
  components/
    ui/
    charts/
    dashboard/
    recommendations/
    challenges/
    privacy/
  lib/
    auth/
    db/
    recommendation-engine/
    analytics/
    permissions/
    utils/
  server/
    services/
    repositories/
  prisma/
    schema.prisma
    seed.ts