# Health Scoring System Implementation Plan

## Overview
This document outlines the comprehensive health scoring system for SugarReset, combining nutritional data, wellness metrics, and behavioral consistency into a scientifically-backed health score.

## Scientific Foundation

### 1. **Nutritional Scoring**
Based on:
- **Dietary Guidelines for Americans 2020-2025** (USDA)
- **WHO Healthy Diet Recommendations**
- **American Heart Association Guidelines**
- **Harvard T.H. Chan School of Public Health Nutrition Studies**

Key Principles:
- **Macronutrient Balance**: Optimal ratio of 30% protein, 40% carbs, 30% fat
- **Sugar Limitation**: WHO recommends <10% of total energy (ideally <5%), approximately 25-50g/day
- **Fiber Intake**: 25-35g daily for digestive health and blood sugar control
- **Sodium Limitation**: <2300mg/day (FDA guideline)
- **Saturated Fat**: <7% of total calories (AHA guideline)

### 2. **Wellness Metrics**
Based on:
- **Sleep Foundation Research** - 7-9 hours optimal for adults
- **Positive Psychology Studies** (Pressman & Cohen, 2005) - Mood correlates with health outcomes
- **Cognitive Function Research** - Focus as health indicator
- **Energy Metabolism Studies** - Energy levels reflect metabolic health

### 3. **Consistency Tracking**
- **Behavioral Psychology** - Habit formation requires 21-66 days (Lally et al., 2009)
- **Health Behavior Change Models** - Consistency is key predictor of long-term success

## Scoring Algorithm

### Overall Health Score (0-100)
```
Overall = (Nutrition * 0.45) + (Wellness * 0.40) + (Consistency * 0.15)
```

### Nutrition Score Components:
1. **Macro Balance** (25 points max)
   - Protein: 25-35% of calories
   - Carbs: 35-50% of calories
   - Fat: 20-35% of calories

2. **Sugar Control** (30 points max)
   - ≤25g: Full points
   - 26-50g: Partial points
   - >100g: Significant penalty

3. **Micronutrients** (25 points max)
   - Fiber as proxy for whole foods
   - Food variety indicator

4. **Calorie Appropriateness** (10 points max)
   - Optimal range: 1600-2400 for typical adult

5. **Harmful Nutrient Limitation** (10 points max)
   - Low sodium
   - Low saturated fat

### Wellness Score Components:
1. **Sleep Quality** (30 points max)
   - 7-9 hours: 100%
   - 6-10 hours: 75%
   - <6 or >10: Reduced score

2. **Mood** (25 points max)
   - Linear scale 1-5

3. **Energy** (25 points max)
   - Linear scale 1-5

4. **Focus** (20 points max)
   - Linear scale 1-5

### Consistency Score:
- Based on days of logging (both food and wellness)
- Encourages daily engagement
- 7-day streak = 100%

## Data Integration

### Current Data Sources:
1. **Food Scanner** - Nutritional data from scanned items
2. **Wellness Tracker** - Mood, energy, focus, sleep
3. **Journal Entries** - Qualitative insights
4. **Check-ins** - Daily sugar-free status

### Proposed Apple Health Integration:

#### Data to Import FROM Apple Health:
1. **Sleep Data** (`HKCategoryTypeIdentifierSleepAnalysis`)
   - Sleep duration
   - Sleep quality
   - Bed/wake times

2. **Activity Data**
   - Steps (`HKQuantityTypeIdentifierStepCount`)
   - Active energy burned (`HKQuantityTypeIdentifierActiveEnergyBurned`)
   - Exercise minutes (`HKQuantityTypeIdentifierAppleExerciseTime`)

3. **Heart Rate** (`HKQuantityTypeIdentifierHeartRate`)
   - Resting heart rate (stress indicator)
   - Heart rate variability (recovery indicator)

4. **Mindfulness** (`HKCategoryTypeIdentifierMindfulSession`)
   - Meditation/breathing sessions

5. **Nutrition** (if user logs elsewhere)
   - Dietary energy
   - Dietary sugar
   - Other macros

#### Data to Export TO Apple Health:
1. **Dietary Data**
   - Dietary energy consumed
   - Dietary sugar
   - Dietary protein/carbs/fat
   - Dietary fiber
   - Dietary sodium

2. **Mindfulness** (journal entries as mindfulness)
   - Journal writing as reflection time

3. **Custom Quantities**
   - Sugar-free streak days
   - Health score (custom metric)

#### Implementation Approach:
```typescript
// React Native HealthKit integration
import AppleHealthKit from 'react-native-health';

// Request permissions
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.DietaryEnergy,
      AppleHealthKit.Constants.Permissions.DietarySugar,
      AppleHealthKit.Constants.Permissions.DietaryProtein,
    ],
  },
};

// Sync sleep data to enhance wellness tracking
function syncSleepData() {
  // Auto-populate sleep hours in wellness tracker
  // Improve accuracy vs manual entry
}

// Export nutrition data
function exportNutritionData(scannedItems) {
  // Push scanned food nutrition to Apple Health
  // Allows users to see complete picture in Health app
}
```

## Additional Relevant Metrics

### 1. **Hydration Tracking**
- **Science**: Proper hydration improves cognitive function and metabolism
- **Implementation**: Add water intake logging (8-10 glasses/day target)
- **Apple Health**: `HKQuantityTypeIdentifierDietaryWater`

### 2. **Stress Levels**
- **Science**: Chronic stress correlates with sugar cravings and poor health
- **Implementation**: Daily stress rating (1-5 scale)
- **Correlation**: Track stress vs. sugar intake patterns

### 3. **Physical Activity**
- **Science**: Exercise improves insulin sensitivity and reduces cravings
- **Implementation**: Import from Apple Health or manual log
- **Target**: 150 minutes moderate activity/week (WHO guideline)
- **Bonus**: Higher activity = higher allowed calorie intake

### 4. **Meal Timing**
- **Science**: Consistent meal timing supports circadian rhythm
- **Implementation**: Track meal times, flag late-night eating
- **Insight**: "Time-restricted eating" research (Panda, 2019)

### 5. **Heart Rate Variability (HRV)**
- **Science**: Higher HRV correlates with better stress resilience
- **Implementation**: Import from Apple Health
- **Insight**: Low HRV may indicate need for recovery/rest

### 6. **Blood Glucose** (for advanced users)
- **Science**: Direct measure of sugar metabolism
- **Implementation**: Optional integration with CGM devices
- **Apple Health**: `HKQuantityTypeIdentifierBloodGlucose`

## Implementation Phases

### Phase 1: Core Health Scoring ✅
- [x] Create `healthScoringService.ts`
- [ ] Integrate with existing food scanner data
- [ ] Calculate daily nutrition profiles
- [ ] Combine with wellness metrics
- [ ] Display in Analytics page

### Phase 2: Real-Time Data Display
- [ ] Update Homepage 7-day wellness calculation
- [ ] Update Analytics page with real data
- [ ] Add sugar consumption graph with real data
- [ ] Show health score breakdown
- [ ] Display insights and recommendations

### Phase 3: Apple Health Integration (Future)
- [ ] Install `react-native-health` package
- [ ] Request user permissions
- [ ] Sync sleep data (auto-populate)
- [ ] Import activity data
- [ ] Export nutrition data
- [ ] Add health score as custom quantity

### Phase 4: Advanced Metrics (Future)
- [ ] Add hydration tracking
- [ ] Add stress tracking
- [ ] Integrate activity from Apple Health
- [ ] Add meal timing analysis
- [ ] Optional: Blood glucose integration

## User Experience Considerations

### Onboarding:
1. **Apple Health Opt-In** - Explain benefits clearly
   - "Auto-populate sleep data for more accurate tracking"
   - "See your complete health picture in one place"
   - "Export your nutrition data to Apple Health"

2. **Gradual Feature Introduction**
   - Start with basic food + wellness
   - Introduce advanced metrics over time
   - Avoid overwhelming new users

### Privacy:
- **Data Ownership**: User data stays on device (offline-first)
- **Sync Optional**: Firebase sync only if user wants
- **Apple Health**: Only sync what user approves
- **Transparency**: Clear about what's collected and why

### Motivation:
- **Visual Progress**: Charts showing improvement over time
- **Insights**: AI-powered suggestions based on patterns
- **Achievements**: Unlock badges for milestones
- **Trends**: "Your sleep has improved 15% this week"

## Technical Architecture

### Data Flow:
```
Food Scanner → scannerService.ts → healthScoringService.ts → Analytics/Home UI
Wellness Form → AsyncStorage → healthScoringService.ts → Analytics/Home UI
Apple Health → healthIntegrationService.ts → healthScoringService.ts
```

### Storage:
```
AsyncStorage:
- scanned_items: ScannedItem[]
- wellness_logs: WellnessMetrics[]
- health_scores: ComprehensiveHealthScore[] (daily)
- apple_health_sync_enabled: boolean
- apple_health_last_sync: timestamp
```

### Performance:
- Calculate scores on-demand (not real-time)
- Cache daily scores
- Aggregate weekly/monthly in background
- Lazy load historical data

## Success Metrics

### User Engagement:
- Daily logging rate
- Health score improvement over time
- Feature adoption (Apple Health sync %)

### Health Outcomes:
- Average daily sugar reduction
- Sleep quality improvement
- Wellness score trends
- Consistency increase

### Retention:
- 7-day retention
- 30-day retention
- Long-term habit formation (90+ days)
