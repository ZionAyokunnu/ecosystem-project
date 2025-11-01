# Ecosystem UI/UX Flow Spec – Duolingo-Parity, Page-by-Page, Component-by-Component

This document linearizes the Ecosystem user experience and enumerates every feature (page-by-page, component-by-component), mapped 1:1 to Duolingo’s UI/UX catalogue without omissions. Use it as a build script for product + engineering.

---

## Legend
- Page: Route/screen users see
- Components: UI building blocks on page
- Feedback: Visual/audio/haptic signals
- Data: Tables/fields touched
- Events: Analytics + notifications
- Personalization: Branching by role, history, goals, location
- Status: [exists] in repo, [enhance] extend existing, [new] to build

---

## A. Global Elements (present across app)
- Header (`Header.tsx`) [exists]
  - Nav, profile, role menu, streak indicator [enhance]
- Footer (`Footer.tsx`) [exists]
- Toasters (`ui/toaster`, `ui/sonner`) [exists]
- Mascot overlay `CommunityMascot.tsx` [new]
- Theme/dark-mode (`next-themes`) [exists → wire toggle in header] [enhance]
- Notification manager `NotificationManager.tsx` [new]
- Audio feedback `AudioFeedback.tsx` [new]
- Micro-animations utilities `MicroAnimations.tsx` [new]

---

## B. Onboarding & Entry Flow (Duolingo 1)

### B1. Welcome Screen (Route: `/` for unauthenticated)
- Components
  - Welcome hero [exists: `HeroSection.tsx`] [enhance]
  - Mascot greeter `CommunityMascot.tsx` [new]
  - CTA buttons (Try demo | Explore | Sign up) [enhance]
- Feedback: subtle entrance animations, success chime on CTA
- Data: none
- Events: view_welcome, click_try_demo
- Personalization: if returning anonymous, greet by cookie nickname

### B2. Progressive Sign-Up (Route: `/auth`) [exists]
- Components
  - `Auth.tsx` (Sign in/up) [exists]
  - Progressive flow guard: allow demo before signup [enhance]
- Feedback: inline field validation, success/failure toasts
- Data: Supabase Auth, `profiles`
- Events: signup_started/completed, login_success
- Personalization: prefill name from previous story submissions if any

### B3. Goal Setting (Route: `/onboarding`) [exists]
- Components
  - Goal selector `EngagementGoalSelector.tsx` [new]
  - Motivation prompt `ParticipationMotivationPrompt.tsx` [new]
  - Visual location picker `EnhancedLocationPicker.tsx` [exists] [enhance with large cards]
- Feedback: selection highlights, mascot encouragement
- Data: `profiles.has_completed_onboarding`, `profiles.location_id`, user prefs (localStorage)
- Events: goal_set, location_selected, onboarding_completed
- Personalization: tailor daily targets + notifications based on goal

### B4. Instant Demo Survey (Route: `/onboarding` step 2)
- Components
  - `SurveyRenderer.tsx` [exists] with `MinimalSurveyView.tsx` [new]
  - Visual context `SurveyVisualContext.tsx` [new]
- Feedback: green flash on submit, confetti on completion, sound
- Data: `survey_responses` (tagged demo), points award optional
- Events: demo_started/completed
- Personalization: pick domain aligned to chosen motivation

---

## C. Core Lesson Interface → Survey Experience (Duolingo 2)

### C1. Survey Page (Route: `/surveys`) [exists]
- Components
  - `SurveysPage.tsx` list [exists] [enhance sorting by recommended]
  - `SurveyCard.tsx` [exists] [enhance: rings, mastery chips]
- Feedback: hover micro-anim, progress rings
- Data: `surveys`, `survey_control`
- Events: survey_opened
- Personalization: pin recommended based on indicators engaged, location

### C2. Survey Player (Route: `/surveys/:id`) [exists]
- Components
  - `SurveyRenderer.tsx` [exists] with: 
    - One-question view `MinimalSurveyView.tsx` [new]
    - Attempts/hearts `SurveyAttemptsTracker.tsx` [new]
    - Visual context `SurveyVisualContext.tsx` [new]
    - Audio player `AudioSurveyPlayer.tsx` [new]
    - Feedback system `SurveyFeedbackSystem.tsx` [new]
- Feedback: ✅ green flash, ❌ soft red, encouraging text, sounds
- Data: `survey_questions`, `survey_responses`, `voice_call_attempts` (voice)
- Events: question_viewed, answer_submitted, survey_completed
- Personalization: adaptive wording/difficulty (see F1)

### C3. Quick Retry & Review (pre-submit) [enhance]
- Components
  - Review sheet, "Save for later"
- Data: local draft buffer
- Events: review_opened, saved_for_later
- Personalization: show hints for low mastery indicators

---

## D. Gamification System (Duolingo 3)

### D1. Impact Points (XP) [exists → `gamificationApi.ts`]
- Components
  - `PointsTracker.tsx` [exists] [enhance: animated bar, "+IP" toasts]
- Data: `user_points_log`
- Events: points_awarded

### D2. Streaks + Streak Freeze
- Components
  - `StreakTracker.tsx` [new]
  - `StreakFreeze.tsx` [new]
- Data: computed daily events table (extend via edge function) or derive from `user_points_log`
- Events: streak_progressed, streak_broken, streak_freeze_used

### D3. Leaderboards & Leagues
- Components
  - `Leaderboard.tsx` [exists] [enhance: weekly resets, categories]
  - `CommunityLeagues.tsx` [new]
- Data: aggregate points weekly; league tier field on profile
- Events: league_promoted/demoted

### D4. Badges / Achievements
- Components
  - `BadgeRenderer.tsx` [exists] [enhance catalog]
- Data: `user_badges`
- Events: badge_awarded

### D5. Community Coins (Gems)
- Components
  - `CommunityCoins.tsx` [new]
- Data: extend `user_points_log` or new `user_coins`
- Events: coins_earned/spent

### D6. Skill Trees / Progress Rings
- Components
  - Sunburst as skill tree: `SunburstChart.tsx` [exists] [enhance gamification overlays]
  - `ProgressRing.tsx` [new]
- Data: indicator mastery table (new) or derive from responses
- Events: mastery_level_up

---

## E. Visual & Interaction Design (Duolingo 4)
- Color tokens: Tailwind theme [exists] → add semantic tokens [enhance]
- Rounded geometry: apply across UI [enhance]
- Micro-animations: `MicroAnimations.tsx` [new]
- Mascot reactions: `CommunityMascot.tsx` [new]
- Minimalistic layouts: applied in Survey & Dashboard [enhance]
- Gradients & depth: card backgrounds [enhance]

---

## F. Personalization & Adaptivity (Duolingo 6)

### F1. Adaptive Survey Difficulty
- Components
  - `AdaptiveSurveyEngine.tsx` [new]
- Inputs: user mastery per indicator, prior answers, time-on-question
- Behavior: selects simpler/advanced phrasing, adds hints, adjusts branching

### F2. Smart Review & Practice Hub
- Components
  - `PracticeHub.tsx` [new]
- Behavior: surfaces weak indicators, follow-up surveys
- Data: query from responses + indicator mastery

### F3. Predictive Scheduling
- Components
  - `SurveyScheduler.tsx` [new]
- Behavior: recommends times; schedules voice calls via `voiceCallApi.ts`

### F4. Personalized Feeds & Weekly Recaps
- Components
  - Dashboard widgets [enhance `Dashboard.tsx`]
  - `WeeklyRecap.tsx` [new]

### F5. Adaptive Voice Recognition (edge)
- Enhance `twilio-voice-handler` flow with difficulty toggles

---

## G. Engagement Loops (Duolingo 5)
- Notifications: `NotificationManager.tsx` [new]
- Daily challenges: `DailyChallenges.tsx` [new]
- Seasonal events: `SeasonalEvents.tsx` [new]
- Social sharing: `SocialSharing.tsx` [new]
- Celebrations: `CelebrationAnimations.tsx` [new]
- Energy recovery: part of `SurveyAttemptsTracker.tsx` [new]

---

## H. Community & Social (Duolingo 7)
- Follow & compare: `CommunityConnections.tsx` [new]
- Clubs/groups: `CommunityGroups.tsx` [new]
- Community challenges: `CommunityChallenges.tsx` [new]
- Avatars & titles: enhance `Profile.tsx`

---

## I. Progress & Motivation (Duolingo 8)
- Dashboard overview: enhance `Dashboard.tsx`
- Progress reports: `ProgressReportGenerator.tsx` [new]
- End-of-survey celebration: `SurveyCompletionCelebration.tsx` [new]
- "You're on fire" popups: `MotivationPopup.tsx` [new]
- Mastery meter: `MasteryMeter.tsx` [new]

---

## J. Supportive Features (Duolingo 9)
- Indicator tips/context: `IndicatorContextPanel.tsx` [new]
- Interactive stories: enhance `CommunityStories.tsx`
- Audio playback: `AudioSurveyPlayer.tsx` [new]
- Voice mode: enhance `voiceCallApi.ts` and edge functions
- Review sessions: `SurveyReviewSession.tsx` [new]
- Timed surveys: `TimedSurveyMode.tsx` [new]
- Practice hub: `PracticeHub.tsx` [new]

---

## K. Emotional Design (Duolingo 10)
- Mascot empathy: `CommunityMascot.tsx` [new]
- Encouragement text: `EncouragementMessage.tsx` [new]
- Soft failure recovery: unify error copy across app
- Humor: `HumorousMessages.tsx` helper
- Sound design: `AudioFeedback.tsx` [new]

---

## L. Accessibility & Inclusivity (Duolingo 11)
- Offline mode: `OfflineSurveyMode.tsx` [new] (IndexedDB)
- Multi-device sync: leverage Supabase [exists]
- Color-blind cues: icon+color pairs, high-contrast mode [enhance]
- Dark mode: theme toggle [enhance]
- Simple language mode: `SimpleLanguageMode.tsx` [new]

---

## M. Premium UX (Duolingo 12) – Future
- Premium bundle: `PremiumFeatures.tsx` [new]
- Enhanced analytics: `PersonalAnalytics.tsx` [new]

---

## N. Back-End UX / Data Touchpoints (Duolingo 13)
- Event tracking: emit events on all key interactions (PostHog/Mixpanel or Supabase)
- Predictive notifications: `PredictiveNotificationEngine.tsx` [new]
- A/B testing framework: `ABTestingFramework.tsx` [new]

---

## O. Linearized, Personalized User Flows (end-to-end)

### Flow O1. New Resident → Engaged Contributor (Day 0)
1) Welcome → CTA Try Demo (A/B mascot prompt)
2) Demo Survey (C2) → Confetti + +50 IP (D1) → Motivation Popup (I)
3) Progressive Sign-Up (B2) → Create profile (`profiles`)
4) Onboarding Goals + Motivation (B3) → Set weekly target
5) Visual Location Selection (B3) → Save `profiles.location_id`
6) Recommended Surveys (C1) personalized by location & goals
7) Complete First Survey (C2) → Earn points (D1) → Start Streak (D2)
8) End Screen (I) → Share achievement (G) → Recommended next action

### Flow O2. Daily Loop (Returning User)
1) Open app (notifications may drive) (G)
2) Streak banner + mascot greeting (D2 + K)
3) Daily Challenge card (G)
4) Suggested Survey (F3/F2) or Practice Hub (F2)
5) Survey → Feedback, points, mastery (C/D)
6) Celebration → Progress ring update (I)
7) Leaderboard check (D3) → Motivation

### Flow O3. Researcher Path
1) Login → Researcher dashboard (role-gated)
2) Create survey → Approval flow (existing)
3) Schedule voice calls (voice API) (F3)
4) Review responses, export insights

### Flow O4. Community Rep Path
1) Login → Rep dashboard
2) Approve/decline pending surveys
3) Launch community challenge (H)
4) Monitor location engagement, reward top contributors

---

## P. Page-by-Page Feature Checklists

For each route, implement and verify:

- `/` Welcome: mascot, demo CTA, micro-anim, event hooks
- `/auth`: progressive, toasts, validation copy
- `/onboarding`: goals, motivation, visual location picker
- `/surveys`: recommended sort, badges, rings
- `/surveys/:id`: minimal view, hearts, feedback, audio, review, timed mode
- `/dashboard`: widgets (streak, IP, mastery, challenges, stories, insights)
- `/leaderboard`: weekly tabs, categories, highlight user
- `/stories`: interactive narratives, vote, submit, badges
- `/researcher/insights`: advanced charts, export, badges for research actions
- `/wallet`: points, badges, vouchers, coins
- `/profile`: avatars, titles, preferences (dark mode, simple language)

---

## Q. Data Model Extensions (minimal to enable features)
- user_streaks (user_id, day_count, last_active_at, freeze_active)
- indicator_mastery (user_id, indicator_id, level, progress)
- user_coins (user_id, balance)
- events (user_id, type, payload, created_at)
- challenges (id, type, goal, window, reward)
- user_challenges (user_id, challenge_id, progress, completed_at)

---

## R. Analytics & Notifications
- Emit events: view, click, submit, complete, share
- Weekly recap cron (edge function) → `WeeklyRecap.tsx` feed card + email
- Predictive re-engagement triggers when streak at risk

---

## S. Build Plan (90-day roadmap)
- Phase 1 (Weeks 1-3): Streaks, Points UI, Survey UX minimal view, Celebration
- Phase 2 (Weeks 4-6): Badges expansion, Leaderboards weekly, Progress rings
- Phase 3 (Weeks 7-9): Challenges, Mascot, Notifications, Practice Hub
- Phase 4 (Weeks 10-12): Leagues, Coins, Adaptive Engine, Recaps

---

This spec mirrors every Duolingo feature and assigns an Ecosystem page + components with no omissions. Use alongside `UI_UX_FEATURE_MAPPING_TEMPLATE.md` for deeper design guidance.
