# SimpleQueue: User Interface Design Document

## Layout Structure

### Global Layout

-   **Navigation Bar**: Fixed at the top with app logo, main navigation links, account dropdown, and notifications icon
-   **Main Content Area**: Central area for displaying queue data, forms, and visualizations
-   **Right Sidebar**: Collapsible panel for contextual information, help, and quick actions

### Dashboard Layout

-   **Overview Cards**: Top section with key metrics and status indicators
-   **Queue List**: Central section displaying all queues in a responsive grid or list view
-   **Activity Feed**: Bottom section showing recent system events and actions

### Queue Detail Layout

-   **Header**: Queue name, status indicator, and key actions (pause/resume, delete)
-   **Metrics Panel**: Top section with vital statistics and mini-charts
-   **Tabs Section**: Central tabbed interface for messages, settings, and analytics
-   **Action Panel**: Fixed right panel with contextual actions for the selected queue

## Core Components

### Navigation Components

-   **Main Nav**: Logo, Queues, Documentation, API Keys, Settings
-   **Breadcrumb Trail**: Visible on all screens below dashboard level
-   **Context Switcher**: Account/environment selector in top bar
-   **Search**: Global search accessible from all screens

### Queue Management Components

-   **Queue Card**: Compact representation of a queue with key metrics and status
-   **Create Queue Form**: Minimal form with name, retention period, and optional settings
-   **Queue Settings Panel**: Configuration options for the selected queue
-   **Pause/Resume Toggle**: Prominent control for changing queue processing state

### Messaging Components

-   **Message Viewer**: Tabular view of messages with filtering and sorting
-   **Message Inspector**: Detailed view of message content and metadata
-   **Publish Interface**: Form for sending test messages to a queue
-   **Batch Operations**: Controls for bulk acknowledge/reject actions

### Monitoring Components

-   **Metric Cards**: Individual statistics with current value and trend indicator
-   **Time Series Charts**: Interactive graphs for queue depth and throughput
-   **Status Indicators**: Color-coded states (active, paused, error)
-   **Alerts Panel**: Notifications about queue conditions and system events

### Developer Experience Components

-   **API Explorer**: Interactive documentation with try-it-now capability
-   **Code Snippets**: Copy-ready examples in multiple languages
-   **Authentication Manager**: Interface for creating and managing API keys
-   **Postman Collection**: Download option for API collection

## Interaction Patterns

### Queue Creation Flow

1.  User clicks "Create Queue" button on dashboard
2.  Minimal form appears with required fields (name, retention)
3.  Optional advanced settings can be expanded
4.  Preview card shows what the queue will look like
5.  Confirmation creates queue and redirects to detail view
6.  Success notification confirms creation

### Queue Management Interactions

-   **Pausing**: Toggle with confirmation modal explaining implications
-   **Resuming**: Simple toggle with success confirmation
-   **Deleting**: Two-step confirmation with queue name verification
-   **Configuring**: Inline editing of queue properties with immediate feedback

### Message Interaction Patterns

-   **Viewing Messages**: Paginated list with infinite scroll option
-   **Inspecting Details**: Expandable rows or side panel for message content
-   **Publishing Test Messages**: Simple form with JSON validator
-   **Acknowledging**: Single or batch operation with visual feedback

### Monitoring Interactions

-   **Time Range Selection**: Standard presets (1h, 24h, 7d) with custom option
-   **Chart Interactions**: Zoom, pan, and point inspection on hover
-   **Threshold Setting**: Drag handles to set alert thresholds on charts
-   **Alert Configuration**: Simple form for notification preferences

## Visual Design Elements & Color Scheme

### Color Palette

-   **Primary**: `#3B82F6` (bright blue) - For primary actions and key UI elements
-   **Secondary**: `#10B981` (emerald green) - For success states and positive indicators
-   **Accent**: `#6366F1` (indigo) - For highlighting and secondary actions
-   **Neutral**:
    -   `#1F2937` (dark gray) for text
    -   `#F3F4F6` (light gray) for backgrounds
    -   `#E5E7EB` (medium gray) for borders
-   **Status Colors**:
    -   Active: `#10B981` (green)
    -   Paused: `#F59E0B` (amber)
    -   Error: `#EF4444` (red)
    -   Warning: `#F97316` (orange)

### Visual Hierarchy

-   **Primary Actions**: Solid fill buttons with the primary color
-   **Secondary Actions**: Outline buttons with secondary color
-   **Tertiary Actions**: Text links with subtle hover effects
-   **Information Density**: Moderate, with focus on key metrics and clear headings
-   **Empty States**: Helpful illustrations and onboarding guidance

### Iconography

-   **System Icons**: Simple, consistent line icons for navigation and actions
-   **Status Icons**: Clear, distinct shapes for different states
-   **Data Visualization**: Minimal, clean charts with focused data representation
-   **Custom Icons**: Unique visual language for queue types and operations

## Mobile, Web App, Desktop Considerations

### Responsive Approach

-   **Mobile First**: Core functions optimized for small screens
-   **Progressive Enhancement**: Additional features on larger screens
-   **Touch Targets**: Minimum 44x44px for all interactive elements
-   **Gestures**: Swipe patterns for common actions on mobile

### Mobile-Specific Design

-   **Bottom Navigation**: Primary actions moved to bottom bar
-   **Simplified Views**: Focused on essential metrics and actions
-   **Collapsible Sections**: Accordion patterns for detailed information
-   **Pull-to-Refresh**: For updating queue metrics

### Desktop Enhancements

-   **Multi-Panel Layout**: Utilize larger screen space for simultaneous views
-   **Keyboard Shortcuts**: Efficiency actions for power users
-   **Persistent Context**: Always visible queue metrics while navigating tabs
-   **Advanced Visualizations**: More detailed charts and data representations

### Web App Optimizations

-   **Quick-Load Views**: Essential data loads first
-   **Progressive Loading**: Additional details loaded as needed
-   **Background Updates**: Real-time data refreshed without page reloads
-   **Offline Indicators**: Clear status when connectivity is lost

## Typography

### Font Selection

-   **Primary Font**: Inter - Clean, modern sans-serif for all UI elements
-   **Monospace Font**: Fira Code - For JSON data, code snippets, and technical content
-   **Font Weights**:
    -   400 (Regular) for body text
    -   500 (Medium) for subheadings
    -   600 (SemiBold) for headings
    -   700 (Bold) for emphasis and key metrics

### Type Scale

-   **Caption**: 12px - For secondary information and metadata
-   **Body Small**: 14px - For dense information areas
-   **Body**: 16px - For primary content and descriptions
-   **Subtitle**: 18px - For section headings
-   **Title**: 20px - For page titles and major sections
-   **Display**: 24px - For dashboard highlights and key metrics

### Text Formatting

-   **Line Height**: 1.5 for body text, 1.25 for headings
-   **Letter Spacing**: Slight increase (0.01em) for body text
-   **Text Alignment**: Left-aligned for most content, centered for some headings
-   **Text Truncation**: Ellipsis for long queue names and message content with hover expansion

## Accessibility

### Color Accessibility

-   **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
-   **Non-Color Indicators**: All status information conveyed by both color and shape/text
-   **Focus States**: Visible focus indicators for keyboard navigation
-   **Dark Mode**: Complete theme support with appropriate contrast

### Keyboard Navigation

-   **Logical Tab Order**: Natural progression through interactive elements
-   **Keyboard Shortcuts**: Common actions accessible via keyboard
-   **Focus Trapping**: Modal dialogs and forms maintain focus within context
-   **Skip Links**: Allow bypassing navigation to main content

### Screen Reader Support

-   **ARIA Labels**: Descriptive labels for all interactive elements
-   **Semantic HTML**: Proper heading structure and landmark regions
-   **Status Updates**: Announcements for dynamic content changes
-   **Alternative Text**: Descriptions for all charts and visualizations

### Inclusive Design

-   **Text Resizing**: UI handles font size increases up to 200%
-   **Reduced Motion**: Alternative transitions for users with motion sensitivity
-   **Simple Language**: Clear, concise text for error messages and instructions
-   **Sufficient Spacing**: Adequate touch targets and form field spacing

___

This UI Design Document provides a comprehensive framework for SimpleQueue's interface, ensuring a consistent, intuitive, and accessible experience across devices. The design prioritizes simplicity and clarity while providing powerful tools for monitoring and managing message queues.