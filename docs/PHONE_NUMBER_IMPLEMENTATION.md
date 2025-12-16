# Phone Number Implementation Guide

## Overview
This document outlines the comprehensive implementation of international phone number support across the ROSS.AI platform, including country code picker functionality, validation, and database storage.

## Features Implemented

### 1. **PhoneInput Component** (`/src/components/ui/phone-input.tsx`)
- **Country Code Picker**: Dropdown with flag icons for all countries
- **International Format**: Automatic formatting in E.164 format (+1234567890)
- **Validation**: Real-time validation using libphonenumber-js
- **Theme Integration**: Fully integrated with shadcn/ui theme system
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Error States**: Visual error indicators and messages

### 2. **Database Schema** (`/supabase/migrations/20250622120000-phone-number-enhancements.sql`)
- **profiles.phone**: New column for E.164 format phone numbers
- **Validation Constraint**: Database-level validation for E.164 format
- **Index**: Performance index for phone number lookups
- **Unified View**: `user_phone_numbers` view combining profile and wizard data
- **RLS Policies**: Row-level security for phone number access

### 3. **Validation Schemas**
Updated validation in multiple files to support international phone numbers:
- `src/types/wizard.ts`: Personal info and enterprise contact validation
- `src/components/profile/EditProfileModal.tsx`: Profile editing validation
- Uses `libphonenumber-js` for accurate validation

### 4. **Form Integration**
Updated all forms to use the new PhoneInput component:
- **Signup Wizard - Personal Info Step**: Country code picker with validation
- **Edit Profile Modal**: Updated phone editing with international support
- **Enterprise Step**: Contact phone with country code picker

### 5. **Display Formatting**
- **Profile Page**: Shows formatted phone numbers (e.g., "+1 (555) 123-4567")
- **Consistent Formatting**: Uses `formatPhoneNumber` utility throughout the app

## Technical Implementation

### Component Usage
```tsx
import { PhoneInput } from '@/components/ui/phone-input';

<PhoneInput
  value={phoneNumber}
  onChange={setPhoneNumber}
  placeholder="Enter phone number"
  defaultCountry="US"
  error={hasError}
/>
```

### Validation Schema
```tsx
import { isValidPhoneNumber } from 'libphonenumber-js';

const schema = z.object({
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return isValidPhoneNumber(phone);
    }, 'Please enter a valid phone number with country code'),
});
```

### Database Storage
Phone numbers are stored in E.164 format:
```sql
-- Example: +14155552671
-- Country code + number without formatting
```

## Utility Functions

### Phone Number Utilities (`/src/components/ui/phone-input.tsx`)
- `isValidPhoneNumberUtil(phone)`: Validates phone number
- `formatPhoneNumber(phone)`: Formats for display
- `getPhoneNumberDetails(phone)`: Extracts country, national number, etc.

## Migration Strategy

### Database Migration
1. **New Column**: Added `phone` column to `profiles` table
2. **Validation**: E.164 format constraint with database function
3. **Index**: Performance optimization for phone lookups
4. **View**: Unified access to phone data from multiple sources

### Backward Compatibility
- **Optional Fields**: All phone fields remain optional
- **Existing Data**: Preserved in wizard_data JSONB format
- **Gradual Migration**: Users can update to international format over time

## Security & Privacy

### Data Protection
- **RLS Policies**: Row-level security prevents unauthorized access
- **E.164 Format**: Standardized storage format for consistency
- **Validation**: Server-side and client-side validation

### Privacy Considerations
- **Optional**: Phone numbers remain optional fields
- **User Control**: Users can edit/remove phone numbers
- **Minimal Storage**: Only necessary phone data stored

## Testing

### Manual Testing Checklist
- [ ] Country selection works correctly
- [ ] Phone validation prevents invalid numbers
- [ ] International numbers save properly
- [ ] Profile page displays formatted numbers
- [ ] Edit modal updates phone numbers
- [ ] Database constraints work properly

### Example Test Cases
1. **US Number**: +1 (555) 123-4567
2. **UK Number**: +44 20 7946 0958
3. **Invalid Number**: Should show validation error
4. **Empty Field**: Should be allowed (optional)

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Fallback**: Graceful degradation for older browsers

## Performance
- **Lazy Loading**: Country flags loaded on demand
- **Debounced Validation**: Prevents excessive API calls
- **Indexed Database**: Fast phone number lookups
- **Cached Formatting**: Efficient display formatting

## Future Enhancements
1. **SMS Verification**: Optional phone verification flow
2. **Regional Defaults**: Auto-detect user's country
3. **Bulk Import**: Support for importing phone lists
4. **Advanced Formatting**: Custom display formats per region

## Dependencies
- `react-phone-number-input`: Country picker and input component
- `libphonenumber-js`: Phone number validation and formatting
- Compatible with existing shadcn/ui and Tailwind CSS setup

## Support
For issues or questions about phone number implementation:
1. Check validation errors in browser console
2. Verify E.164 format in database
3. Test with different country codes
4. Review component props and validation schemas