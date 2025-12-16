# Quick Reference Guide - Ross AI UI

## 🚀 Quick Start
```bash
npm run dev          # Start on http://localhost:8080
```

## 🔧 Common Fixes

### Session Not Showing?
1. Open Console (F12)
2. Click "Add Test Session" button
3. Check localStorage: `user_sessions_[userId]`

### Invalid Date Error?
- Session timestamps might be undefined
- Fallback creates new timestamp on each load
- This is a known issue with auth.sessions access

### Icon Size Issues?
- Navigation icons: `h-4 w-4`
- Chevron icons: `h-3 w-3`
- Button icons: `h-4 w-4`

## 📁 Key Files to Check

### For Session Issues
- `/src/services/sessionService.ts` - Main session logic
- `/src/pages/dashboard/Sessions.tsx` - UI component
- `/supabase/migrations/*` - Database functions

### For Auth Issues
- `/src/contexts/AuthContext.tsx` - Auth state
- `/src/services/supabaseAuthService.ts` - Auth operations
- `/src/hooks/useSupabaseAuthOperations.ts` - Auth hooks

### For UI Consistency
- `/src/styles/utilities.css` - Semantic colors
- `/src/components/ui/*` - shadcn components
- `/src/index.css` - Global styles

## 🎨 Design System

### Colors (Semantic)
```css
text-muted-foreground   /* Secondary text */
bg-muted               /* Subtle backgrounds */
border-border          /* All borders */
bg-background          /* Main background */
text-foreground        /* Primary text */
```

### Layout
```jsx
<div className="max-w-5xl mx-auto px-4 sm:px-6">
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

### Common Patterns
- PhoneInput for phone numbers
- Card components for sections
- Semantic color variables
- Responsive padding: `px-4 sm:px-6`

## 🐛 Known Issues

1. **Sessions**: Only shows current, not history
2. **Activity Logs**: RPC functions missing
3. **Team Features**: Not implemented
4. **Search**: Basic implementation only

## 🔑 Test Accounts
- shivansh@trulyfreehome.com
- shivansh.mudgil@gmail.com

## 📞 Debug Commands
```javascript
// In browser console
localStorage.getItem('user_sessions_' + userId)
supabase.auth.getSession()
supabase.auth.getUser()
```