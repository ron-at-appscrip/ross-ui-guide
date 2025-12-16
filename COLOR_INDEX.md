# 🎨 Ross AI UI - Complete Color Index

## 📋 Overview
This document provides a comprehensive index of all colors used throughout the Ross AI UI codebase, organized by category and usage.

---

## 🎯 Design System Colors

### **Primary Color Palette**

#### **Light Mode**
```css
/* Core Colors */
--background: 210 20% 98%          /* #f8fafc - Main background */
--foreground: 224 39% 10%          /* #1a202c - Primary text */

/* Primary Brand */
--primary: 217 56% 23%             /* #1a365d - Primary brand color */
--primary-foreground: 210 40% 98%  /* #fafbfc - Text on primary */

/* Secondary */
--secondary: 206 70% 51%           /* #3182ce - Secondary actions */
--secondary-foreground: 210 40% 98% /* #fafbfc - Text on secondary */

/* Accent */
--accent: 158 84% 36%              /* #10b981 - Success/positive */
--accent-foreground: 210 40% 98%   /* #fafbfc - Text on accent */

/* Destructive */
--destructive: 0 84.2% 60.2%       /* #ef4444 - Error/danger */
--destructive-foreground: 210 40% 98% /* #fafbfc - Text on destructive */
```

#### **Dark Mode**
```css
/* Core Colors */
--background: 224 39% 10%          /* #1a202c - Main background */
--foreground: 210 20% 98%          /* #f8fafc - Primary text */

/* Primary Brand */
--primary: 206 70% 51%             /* #3182ce - Primary brand color */
--primary-foreground: 224 39% 10%  /* #1a202c - Text on primary */

/* Secondary */
--secondary: 217 56% 23%           /* #1a365d - Secondary actions */
--secondary-foreground: 210 40% 98% /* #fafbfc - Text on secondary */

/* Accent */
--accent: 158 84% 36%              /* #10b981 - Success/positive */
--accent-foreground: 210 40% 98%   /* #fafbfc - Text on accent */

/* Destructive */
--destructive: 0 62.8% 30.6%       /* #dc2626 - Error/danger */
--destructive-foreground: 210 40% 98% /* #fafbfc - Text on destructive */
```

---

## 🎨 Component-Specific Colors

### **Glassmorphic Design System**
```css
/* Light Mode Glass */
--glass-bg: rgba(255, 255, 255, 0.15)      /* Semi-transparent white */
--glass-border: rgba(255, 255, 255, 0.2)   /* Subtle white border */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) /* Soft shadow */

/* Dark Mode Glass */
--glass-bg: rgba(0, 0, 0, 0.15)            /* Semi-transparent black */
--glass-border: rgba(255, 255, 255, 0.1)   /* Subtle white border */
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) /* Deeper shadow */
```

### **Sidebar Colors**
```css
/* Light Mode Sidebar */
--sidebar-background: var(--glass-bg)
--sidebar-foreground: 224 39% 10%           /* #1a202c */
--sidebar-primary: 217 56% 23%              /* #1a365d */
--sidebar-primary-foreground: 210 40% 98%   /* #fafbfc */
--sidebar-accent: 206 70% 51%               /* #3182ce */
--sidebar-accent-foreground: 210 40% 98%    /* #fafbfc */
--sidebar-border: var(--glass-border)
--sidebar-ring: 217 56% 23%                 /* #1a365d */

/* Dark Mode Sidebar */
--sidebar-background: var(--glass-bg)
--sidebar-foreground: 210 20% 98%           /* #f8fafc */
--sidebar-primary: 206 70% 51%              /* #3182ce */
--sidebar-primary-foreground: 224 39% 10%   /* #1a202c */
--sidebar-accent: 158 84% 36%               /* #10b981 */
--sidebar-accent-foreground: 210 40% 98%    /* #fafbfc */
--sidebar-border: var(--glass-border)
--sidebar-ring: 206 70% 51%                 /* #3182ce */
```

---

## 🏷️ Status & Category Colors

### **Document Categories**
```css
/* Legal Document Types */
'corporate_formation': 'bg-blue-100 text-blue-700 border-blue-200'
'contracts_agreements': 'bg-green-100 text-green-700 border-green-200'
'employment_docs': 'bg-purple-100 text-purple-700 border-purple-200'
'pleadings': 'bg-red-100 text-red-700 border-red-200'
'motions': 'bg-orange-100 text-orange-700 border-orange-200'
'discovery': 'bg-yellow-100 text-yellow-700 border-yellow-200'
'real_estate_purchase': 'bg-indigo-100 text-indigo-700 border-indigo-200'
'real_estate_lease': 'bg-indigo-100 text-indigo-700 border-indigo-200'
'real_estate_finance': 'bg-indigo-100 text-indigo-700 border-indigo-200'
'wills_trusts': 'bg-teal-100 text-teal-700 border-teal-200'
'powers_of_attorney': 'bg-teal-100 text-teal-700 border-teal-200'
'healthcare_directives': 'bg-pink-100 text-pink-700 border-pink-200'
'divorce_separation': 'bg-rose-100 text-rose-700 border-rose-200'
'custody_support': 'bg-rose-100 text-rose-700 border-rose-200'
'prenuptial_postnuptial': 'bg-pink-100 text-pink-700 border-pink-200'
'patents': 'bg-cyan-100 text-cyan-700 border-cyan-200'
'trademarks': 'bg-cyan-100 text-cyan-700 border-cyan-200'
'copyrights': 'bg-cyan-100 text-cyan-700 border-cyan-200'
'criminal_law': 'bg-red-100 text-red-700 border-red-200'
'immigration': 'bg-blue-100 text-blue-700 border-blue-200'
'bankruptcy': 'bg-gray-100 text-gray-700 border-gray-200'
'regulatory_compliance': 'bg-green-100 text-green-700 border-green-200'
'legal_correspondence': 'bg-gray-100 text-gray-700 border-gray-200'
'alternative_dispute_resolution': 'bg-purple-100 text-purple-700 border-purple-200'
```

### **Risk Assessment Colors**
```css
/* Risk Levels */
'critical': {
  bg: 'bg-red-50',
  border: 'border-red-200',
  text: 'text-red-700',
  icon: 'text-red-600',
  progress: 'bg-red-500'
}
'high': {
  bg: 'bg-orange-50',
  border: 'border-orange-200',
  text: 'text-orange-700',
  icon: 'text-orange-600',
  progress: 'bg-orange-500'
}
'medium': {
  bg: 'bg-yellow-50',
  border: 'border-yellow-200',
  text: 'text-yellow-700',
  icon: 'text-yellow-600',
  progress: 'bg-yellow-500'
}
'low': {
  bg: 'bg-green-50',
  border: 'border-green-200',
  text: 'text-green-700',
  icon: 'text-green-600',
  progress: 'bg-green-500'
}
```

### **Activity Type Colors**
```css
/* Legal Activity Types */
'client_communication': 'bg-blue-100 text-blue-800'
'legal_research': 'bg-green-100 text-green-800'
'document_drafting': 'bg-purple-100 text-purple-800'
'document_review': 'bg-yellow-100 text-yellow-800'
'court_appearance': 'bg-red-100 text-red-800'
'case_strategy': 'bg-indigo-100 text-indigo-800'
'discovery': 'bg-orange-100 text-orange-800'
'negotiations': 'bg-teal-100 text-teal-800'
'administrative': 'bg-gray-100 text-gray-800'
'business_development': 'bg-pink-100 text-pink-800'
```

---

## 🎯 Process & Workflow Colors

### **USPTO Process Colors**
```css
/* Process Step Colors */
blue: {
  bg: "bg-blue-50",
  bgHover: "hover:bg-blue-100",
  border: "border-blue-200",
  text: "text-blue-600",
  badge: "bg-blue-100 text-blue-800",
  icon: "bg-blue-100",
  iconDark: "bg-blue-500"
}
purple: {
  bg: "bg-purple-50",
  bgHover: "hover:bg-purple-100",
  border: "border-purple-200",
  text: "text-purple-600",
  badge: "bg-purple-100 text-purple-800",
  icon: "bg-purple-100",
  iconDark: "bg-purple-500"
}
green: {
  bg: "bg-green-50",
  bgHover: "hover:bg-green-100",
  border: "border-green-200",
  text: "text-green-600",
  badge: "bg-green-100 text-green-800",
  icon: "bg-green-100",
  iconDark: "bg-green-500"
}
orange: {
  bg: "bg-orange-50",
  bgHover: "hover:bg-orange-100",
  border: "border-orange-200",
  text: "text-orange-600",
  badge: "bg-orange-100 text-orange-800",
  icon: "bg-orange-100",
  iconDark: "bg-orange-500"
}
indigo: {
  bg: "bg-indigo-50",
  bgHover: "hover:bg-indigo-100",
  border: "border-indigo-200",
  text: "text-indigo-600",
  badge: "bg-indigo-100 text-indigo-800",
  icon: "bg-indigo-100",
  iconDark: "bg-indigo-500"
}
```

---

## 📧 Email Template Colors

### **Email Design System**
```css
/* Primary Email Colors */
Primary Color: #1e40af (Blue 700)
Text Color: #374151 (Gray 700)
Secondary Text: #6b7280 (Gray 500)
Background: #ffffff (White)
Border: #e5e7eb (Gray 200)
```

### **Email Template Specific Colors**
```css
/* Invoice Email */
.header { background: #f8f9fa; }
.invoice-details { background: #fff; border: 1px solid #dee2e6; }
.footer { border-top: 1px solid #dee2e6; color: #6c757d; }
.button { background: #007bff; color: white; }

/* Meeting Email */
.header { background: #e7f3ff; }
.meeting-details { background: #f8f9fa; border: 1px solid #dee2e6; }

/* Reminder Email */
.header { background: #fff3cd; }

/* Notification Email */
.header { background: #d1ecf1; }
```

---

## 🎨 Hardcoded Colors

### **Social Media Icons**
```css
/* Google Colors */
Google Blue: #4285F4
Google Green: #34A853
Google Yellow: #FBBC05
Google Red: #EA4335
```

### **Utility Colors**
```css
/* Confirmation Generator */
Primary Text: #333
Background: #f9f9f9
Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Accent: #667eea
Success: #10b981
Warning: #fff3cd
Border: #ffeaa7
```

### **Trademark Utils**
```css
/* Trademark Status Colors */
Registered: #dcfce7 (bg), #166534 (text)
Pending: #fef3c7 (bg), #92400e (text)
Abandoned: #fecaca (bg), #991b1b (text)

/* Trademark UI Colors */
Primary: #2563eb
Border: #e5e7eb
Background: #f8fafc
Accent: #3b82f6
Muted: #6b7280
```

---

## 🎯 Semantic Color Usage

### **Text Colors**
```css
/* Primary Text */
text-foreground          /* Main text color */
text-muted-foreground    /* Secondary text */
text-primary            /* Brand text */
text-secondary          /* Secondary actions */
text-accent             /* Success/positive */
text-destructive        /* Error/danger */

/* Status Text */
text-green-500          /* Success */
text-red-500            /* Error */
text-yellow-500         /* Warning */
text-blue-500           /* Info */
text-purple-500         /* Special */
text-orange-500         /* Attention */
```

### **Background Colors**
```css
/* Main Backgrounds */
bg-background           /* Primary background */
bg-card                 /* Card backgrounds */
bg-muted               /* Subtle backgrounds */
bg-primary             /* Brand backgrounds */
bg-secondary           /* Secondary backgrounds */
bg-accent              /* Success backgrounds */
bg-destructive         /* Error backgrounds */

/* Status Backgrounds */
bg-green-50            /* Success light */
bg-red-50              /* Error light */
bg-yellow-50           /* Warning light */
bg-blue-50             /* Info light */
bg-purple-50           /* Special light */
bg-orange-50           /* Attention light */
```

### **Border Colors**
```css
/* Main Borders */
border-border           /* Default borders */
border-primary          /* Brand borders */
border-secondary        /* Secondary borders */
border-accent           /* Success borders */
border-destructive      /* Error borders */

/* Status Borders */
border-green-200        /* Success borders */
border-red-200          /* Error borders */
border-yellow-200       /* Warning borders */
border-blue-200         /* Info borders */
border-purple-200       /* Special borders */
border-orange-200       /* Attention borders */
```

---

## 🎨 Icon Colors

### **Icon Color Classes**
```css
/* Semantic Icon Colors */
text-primary            /* Brand icons */
text-secondary          /* Secondary icons */
text-accent             /* Success icons */
text-destructive        /* Error icons */
text-muted-foreground   /* Muted icons */

/* Status Icon Colors */
text-green-500          /* Success icons */
text-red-500            /* Error icons */
text-yellow-500         /* Warning icons */
text-blue-500           /* Info icons */
text-purple-500         /* Special icons */
text-orange-500         /* Attention icons */

/* Icon Backgrounds */
bg-primary              /* Brand icon backgrounds */
bg-secondary            /* Secondary icon backgrounds */
bg-accent               /* Success icon backgrounds */
bg-destructive          /* Error icon backgrounds */
```

---

## 🎯 Usage Guidelines

### **Color Hierarchy**
1. **Primary Brand**: Use for main actions, headers, and brand elements
2. **Secondary**: Use for supporting actions and secondary elements
3. **Accent**: Use for success states and positive feedback
4. **Destructive**: Use for errors, warnings, and destructive actions
5. **Muted**: Use for subtle backgrounds and secondary text

### **Accessibility**
- All color combinations meet WCAG AA contrast requirements
- Dark mode support for all semantic colors
- High contrast ratios for text readability

### **Consistency**
- Use semantic color variables instead of hardcoded values
- Maintain consistent color usage across components
- Follow the established color hierarchy

---

## 📝 Notes

- **CSS Variables**: All colors are defined as CSS custom properties for easy theming
- **Dark Mode**: Complete dark mode support with inverted color schemes
- **Glassmorphic**: Special glass effect colors for modern UI elements
- **Status Colors**: Consistent color coding for different states and categories
- **Email Templates**: Separate color system optimized for email client compatibility

This color index serves as the definitive reference for all colors used in the Ross AI UI system.
