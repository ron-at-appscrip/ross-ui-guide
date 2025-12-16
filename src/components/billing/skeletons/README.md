# Billing Skeleton Components

This directory contains comprehensive skeleton loader components for all billing-related functionality, designed to improve perceived performance during loading states.

## 🎯 Overview

Skeleton loaders provide visual placeholders that match the structure of actual content, creating a smoother user experience compared to basic loading spinners. All skeleton components in this directory are:

- **Performance Optimized**: Built with React.memo and optimized animations
- **Accessibility Ready**: Properly implemented with semantic HTML
- **Design Consistent**: Match the actual component layouts closely
- **Customizable**: Accept props for different configurations

## 📦 Components

### Time Entry Skeletons

#### `TimeEntryTableSkeleton`
- **Purpose**: Loading state for the main time entry table
- **Props**: `rows?: number` (default: 5)
- **Usage**: Matches 8-column table structure with realistic content widths

#### `CompactTimeEntryTableSkeleton`
- **Purpose**: Compact version for smaller spaces or mobile views
- **Props**: `rows?: number` (default: 3)
- **Usage**: Card-based layout for time entries

### Invoice Skeletons

#### `InvoicePreviewSkeleton`
- **Purpose**: Loading state for invoice preview components
- **Props**: 
  - `matterSections?: number` (default: 2)
  - `entriesPerSection?: number` (default: 3)
- **Usage**: Shows matter sections with time entries and totals

#### `EmptyInvoicePreviewSkeleton`
- **Purpose**: Skeleton for empty invoice state
- **Usage**: When no entries are selected for invoicing

#### `CompactInvoicePreviewSkeleton`
- **Purpose**: Smaller version for preview areas
- **Usage**: Summary statistics and quick preview

### Dashboard Skeletons

#### `BillingDashboardSkeleton`
- **Purpose**: Full dashboard loading state
- **Props**:
  - `showHeatMap?: boolean` (default: true)
  - `showRecentEntries?: boolean` (default: true)
  - `showStats?: boolean` (default: true)
- **Usage**: Complete dashboard with stats, heat map, and recent entries

#### `WeeklyHeatMapSkeleton`
- **Purpose**: Loading state for weekly time visualization
- **Usage**: 7-day grid with summary statistics

#### `CompactBillingDashboardSkeleton`
- **Purpose**: Smaller dashboard version
- **Usage**: Essential stats and recent activity only

### Timer Skeletons

#### `FloatingTimerSkeleton`
- **Purpose**: Loading state for the floating timer widget
- **Props**: `isMinimized?: boolean` (default: false)
- **Usage**: Matches both expanded and minimized timer states

#### `MatterSelectSkeleton`
- **Purpose**: Loading state for matter dropdown
- **Usage**: When loading available matters for time tracking

#### `TimerControlsSkeleton`
- **Purpose**: Loading state for timer buttons
- **Usage**: Start/pause/stop controls

#### `TimerDisplaySkeleton`
- **Purpose**: Loading state for timer display
- **Usage**: Time counter and status indicator

### LEDES Export Skeletons

#### `LEDESExportSkeleton`
- **Purpose**: Complete LEDES export modal loading state
- **Usage**: Tabbed interface with configuration, filters, preview, and validation

#### `LEDESConfigurationSkeleton`
- **Purpose**: Configuration section loading
- **Usage**: LEDES format selection and settings

#### `LEDESExportProgressSkeleton`
- **Purpose**: Export progress indicator
- **Usage**: During file generation process

### Unsubmitted Entries Skeletons

#### `UnsubmittedEntriesSkeleton`
- **Purpose**: Loading state for unsubmitted entries modal
- **Props**: `entries?: number` (default: 5)
- **Usage**: Table with checkboxes and entry details

#### `EmptyUnsubmittedEntriesSkeleton`
- **Purpose**: Empty state when no unsubmitted entries exist
- **Usage**: "All caught up" message

#### `CompactUnsubmittedEntriesSkeleton`
- **Purpose**: Smaller version for limited space
- **Props**: `entries?: number` (default: 3)
- **Usage**: Condensed entry list

### Generic Skeletons

#### `BillingCardSkeleton`
- **Purpose**: Generic card-based skeleton for billing components
- **Props**:
  - `showHeader?: boolean` (default: true)
  - `showStats?: boolean` (default: false)
  - `rows?: number` (default: 3)
  - `compact?: boolean` (default: false)
- **Usage**: Flexible skeleton for various billing cards

#### `BillingSummaryCardSkeleton`
- **Purpose**: Summary statistic cards
- **Usage**: KPI cards in dashboards

#### `BillingFormSkeleton`
- **Purpose**: Form input loading states
- **Props**: `fields?: number` (default: 4)
- **Usage**: Input fields and labels

#### `BillingListItemSkeleton`
- **Purpose**: List item loading states
- **Props**: `items?: number` (default: 5)
- **Usage**: Checkboxes, content, and actions

## 🚀 Usage Examples

```tsx
import { 
  TimeEntryTableSkeleton, 
  InvoicePreviewSkeleton,
  FloatingTimerSkeleton
} from '@/components/billing/skeletons';

// Time Entry Table
{isLoading ? (
  <TimeEntryTableSkeleton rows={8} />
) : (
  <TimeEntryTable entries={entries} />
)}

// Invoice Preview
{isLoadingInvoice ? (
  <InvoicePreviewSkeleton matterSections={3} entriesPerSection={4} />
) : (
  <InvoicePreview data={invoiceData} />
)}

// Floating Timer
{isLoadingMatters ? (
  <FloatingTimerSkeleton isMinimized={false} />
) : (
  <FloatingTimer matters={matters} />
)}
```

## 🎨 Design Principles

### Visual Consistency
- Skeleton shapes match actual content dimensions
- Proper spacing and alignment with real components
- Consistent color scheme using `bg-muted` and `bg-muted/60`

### Animation
- Smooth `animate-pulse` animation for all elements
- Staggered animations for complex components
- Performance-optimized with CSS transforms

### Accessibility
- Proper semantic structure maintained
- Screen reader friendly with appropriate ARIA labels
- High contrast ratios for visual clarity

### Performance
- All components wrapped with `React.memo`
- Minimal re-renders with stable props
- Lightweight DOM structure

## 🔧 Customization

### Colors
Skeletons use Tailwind's semantic color system:
- `bg-muted`: Primary skeleton color
- `bg-muted/60`: Secondary/lighter skeleton color
- `bg-muted/30`: Background tints

### Animations
- Primary: `animate-pulse` for content placeholders
- Secondary: Custom keyframes for progress indicators
- Duration: Standard Tailwind animation timing

### Responsive Design
- Components adapt to different screen sizes
- Mobile-first approach with responsive breakpoints
- Flexible layouts that work across devices

## 🧪 Testing

All skeleton components should be tested for:
- Proper rendering in different states
- Performance with various prop combinations
- Accessibility compliance
- Visual consistency with actual components

## 📝 Best Practices

1. **Match Layout Structure**: Ensure skeletons closely match the real component structure
2. **Realistic Dimensions**: Use appropriate widths that reflect actual content
3. **Proper Loading States**: Show skeletons during data fetching, not errors
4. **Consistent Timing**: Maintain consistent loading durations across related components
5. **Graceful Transitions**: Smooth transitions from skeleton to actual content

## 🔄 Maintenance

When updating actual billing components:
1. Review corresponding skeleton components
2. Update dimensions and layouts to match
3. Test skeleton-to-content transitions
4. Verify accessibility and performance
5. Update documentation as needed

## 📚 Resources

- [Skeleton Loading Best Practices](https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)