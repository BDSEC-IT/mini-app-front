# Requirements Document

## Introduction

This feature enhances the portfolio page by adding interactive pie charts for portfolio visualization and implementing glowing card designs in dark mode, similar to the equity cards on the main dashboard. The enhancement aims to provide better visual representation of portfolio data and improve the overall user experience with more engaging UI elements.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see pie charts in my portfolio so that I can visually understand my asset allocation and investment distribution.

#### Acceptance Criteria

1. WHEN the user views the portfolio page THEN the system SHALL display a pie chart showing asset allocation by stock symbols
2. WHEN the user views the portfolio page THEN the system SHALL display a pie chart showing profit/loss distribution across different assets
3. WHEN the user hovers over pie chart segments THEN the system SHALL display detailed information including asset name, value, and percentage
4. WHEN the user has no assets THEN the system SHALL display an empty state message instead of pie charts
5. IF the user toggles balance visibility THEN the pie charts SHALL respect the privacy setting and hide/show values accordingly

### Requirement 2

**User Story:** As a user, I want the portfolio cards to have glowing effects in dark mode so that the interface feels more modern and engaging like the main dashboard.

#### Acceptance Criteria

1. WHEN the user is in dark mode THEN the portfolio summary cards SHALL display subtle glowing effects similar to the equity cards on the main dashboard
2. WHEN the user hovers over portfolio cards THEN the system SHALL enhance the glow effect with smooth transitions
3. WHEN the user is in light mode THEN the cards SHALL maintain clean borders without glow effects
4. IF the card represents positive values THEN the system SHALL use green-tinted glow effects
5. IF the card represents negative values THEN the system SHALL use red-tinted glow effects
6. WHEN the card represents neutral values THEN the system SHALL use blue/indigo-tinted glow effects

### Requirement 3

**User Story:** As a user, I want an improved portfolio layout so that the information is better organized and more visually appealing.

#### Acceptance Criteria

1. WHEN the user views the portfolio page THEN the system SHALL organize content in a more structured grid layout
2. WHEN the user views portfolio metrics THEN the system SHALL display them in enhanced cards with better visual hierarchy
3. WHEN the user scrolls through the portfolio THEN the system SHALL provide smooth animations and transitions
4. IF the screen size is mobile THEN the system SHALL adapt the layout responsively while maintaining visual appeal
5. WHEN the user views stock holdings THEN the system SHALL display them with improved card designs and better spacing

### Requirement 4

**User Story:** As a user, I want interactive portfolio analytics so that I can better understand my investment performance.

#### Acceptance Criteria

1. WHEN the user views the portfolio THEN the system SHALL display portfolio composition with visual indicators
2. WHEN the user interacts with portfolio elements THEN the system SHALL provide immediate visual feedback
3. WHEN the user views profit/loss data THEN the system SHALL use consistent color coding (green for gains, red for losses)
4. IF the user has multiple assets THEN the system SHALL show relative performance comparisons
5. WHEN the user refreshes portfolio data THEN the system SHALL update all visual elements including charts smoothly