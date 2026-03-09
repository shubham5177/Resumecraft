# Resume Builder - Complete Testing Guide

## System Overview
The Resume Builder is a fully functional web application with the following workflow:
1. **Authentication** (Login/Signup)
2. **Dashboard** (View all resumes)
3. **Builder** (Create/Edit resumes)
4. **Preview** (View resume PDF export)

## Testing the Complete Workflow

### Step 1: Testing Sign Up
1. Navigate to `signup.html`
2. Enter the following details:
   - **Full Name**: John Doe
   - **Email**: test@example.com
   - **Password**: Password123!
   - **Confirm Password**: Password123!
   - Check the terms checkbox
3. Click "Create Account"
4. **Expected Result**: Account created, redirected to dashboard

### Step 2: Testing Login
1. Navigate to `login.html`
2. Enter your credentials:
   - **Email**: test@example.com
   - **Password**: Password123!
3. Click "Sign In"
4. **Expected Result**: Redirected to dashboard with your name displayed

### Step 3: Testing Resume Building
1. On the dashboard, click "New Resume"
2. Fill in the following sections:
   
   **Personal Information**:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +1 (555) 123-4567
   - Address: New York, NY, USA
   - LinkedIn: linkedin.com/in/johndoe
   - GitHub: github.com/johndoe
   - Professional Summary: "Experienced software developer with 5+ years in full-stack development"

3. **Upload Photo**: Upload a profile picture (optional)

4. Click "Next: Education"

   **Education**:
   - Degree: Bachelor of Science in Computer Science
   - College: MIT
   - Start Year: 2018
   - End Year: 2022
   - GPA: 3.8

5. Click "Add Education" to add more entries

6. Click "Next: Skills"

   **Skills**: Add skills one by one:
   - JavaScript
   - React
   - Node.js
   - MongoDB
   - AWS
   - Python

7. Click "Next: Projects"

   **Projects**:
   - Title: Full Stack E-commerce Platform
   - Company: Personal Project
   - Start Date: Jan 2023
   - End Date: Present
   - Description: "Built a complete e-commerce platform with React frontend and Node.js backend"
   - Technologies: React, Node.js, MongoDB, Stripe

8. Click "Add Project / Experience" for more

9. Click "Next: Certifications"

   **Certifications**:
   - Name: AWS Solutions Architect Associate
   - Organization: Amazon Web Services
   - Date: December 2023

10. Click "Finish & Preview"

### Step 4: Testing Save Functionality
1. During editing, the resume auto-saves every 2 seconds
2. Look for the "Saved" indicator in the Save button
3. **Expected Result**: No data loss when closing the tab and returning

### Step 5: Testing Preview & Download
1. After clicking "Finish & Preview", the preview page loads
2. Click "Edit" to return to the builder
3. Click "Print" to open the print dialog
4. Click "Download PDF" to generate and download the resume
5. **Expected Result**: PDF downloads successfully with proper formatting

### Step 6: Testing Dashboard
1. Return to dashboard
2. See the resume card with:
   - Resume title
   - Last updated date
   - Template name
3. Click "View" to see the preview
4. Click "Edit" to modify the resume
5. Click trash icon to delete (confirm deletion)

## Common Issues & Solutions

### Issue 1: "Login Not Working" or "Not Authenticated"
**Symptoms**: Redirect loops between login and dashboard

**Solutions**:
1. Check browser console (F12) for errors
2. Verify Firebase configuration in `js/firebase-config.js`
3. Clear browser cookies/localStorage:
   ```javascript
   localStorage.clear();
   // Refresh the page
   ```
4. Try signing up with a new email account

### Issue 2: "Preview Not Showing" or "Blank Resume"
**Symptoms**: Preview page shows "Loading..." indefinitely

**Solutions**:
1. Check console for errors (F12 → Console tab)
2. Verify resume was saved (check URL has ?id=)
3. Try editing and saving again
4. Clear browser cache and refresh

### Issue 3: "Save Button Not Working"
**Symptoms**: "Save" button doesn't show "Saved" confirmation

**Solutions**:
1. Check console for database errors
2. Verify user is authenticated (should see in console)
3. Try a simple test: edit name → should auto-save in 2 seconds
4. Check network tab (F12 → Network) for failed requests

### Issue 4: "Can't Upload Photo"
**Symptoms**: Photo upload area doesn't respond

**Solutions**:
1. Try dragging and dropping instead of clicking
2. Ensure image file is less than 5MB
3. Try different image formats (JPG, PNG)
4. Clear browser cache

### Issue 5: "PDF Download Not Working"
**Symptoms**: Download button doesn't generate PDF

**Solutions**:
1. Check if html2pdf library is loaded (check Network tab)
2. Try disabling browser extensions
3. Use Chrome or Firefox instead of Edge
4. Try printing to PDF instead

## Browser Developer Tools (F12)

### How to Check Console Logs
1. Press F12 to open Developer Tools
2. Click on "Console" tab
3. Look for errors in red
4. Should see logs like:
   ```
   User authenticated: test@example.com
   Loading resume: abc123def456
   Resume loaded, rendering...
   ```

### How to Check Network Requests
1. Press F12 to open Developer Tools
2. Click on "Network" tab
3. Perform actions (login, save, etc.)
4. Look for failed requests (red status codes)
5. Click on requests to see details

## Testing Checklist

- [ ] Sign up with new email works
- [ ] Login with credentials works
- [ ] Dashboard displays after login
- [ ] Can create new resume
- [ ] Can fill all sections (Personal, Education, Skills, Projects, Certifications)
- [ ] Preview updates in real-time
- [ ] Save button shows "Saved" confirmation
- [ ] Preview page loads resume data
- [ ] PDF download works
- [ ] Edit button returns to builder
- [ ] Logout button works and redirects to login
- [ ] Can view resume from dashboard
- [ ] Can delete resume from dashboard
- [ ] Multiple resumes can be created
- [ ] Session persists after page refresh
- [ ] Photo upload works
- [ ] Auto-save works without manual save

## Advanced Debugging

### Check Firebase Connection
Open console and run:
```javascript
import { db } from './js/firebase-config.js';
console.log('Firestore instance:', db);
```

### Check Auth State
```javascript
import { auth } from './js/firebase-config.js';
auth.onAuthStateChanged(user => {
  console.log('Current user:', user);
});
```

### Force Refresh User
```javascript
auth.currentUser.reload();
```

## Performance Tips

1. **Faster Preview Updates**: Resume preview updates every keystroke (optimized)
2. **Auto-Save**: Every 2 seconds automatically without user action
3. **Image Optimization**: Keep profile photos under 1MB for faster loading
4. **Browser Cache**: Clear if experiencing stale data

## File Structure Reference

```
resume-builder/
├── js/
│   ├── auth.js              (Authentication logic)
│   ├── builder.js           (Resume builder form logic)
│   ├── database.js          (Firestore operations)
│   ├── firebase-config.js   (Firebase setup)
│   ├── pdf-download.js      (PDF generation)
│   └── script.js            (Home page logic)
├── css/
│   ├── style.css            (Main styles)
│   └── animations.css       (Animations)
├── assets/templates/
│   ├── template1.html       (Modern template)
│   ├── template2.html       (Classic template)
│   └── template3.html       (Dark template)
├── login.html               (Login page)
├── signup.html              (Signup page)
├── builder.html             (Resume builder page)
├── preview.html             (Resume preview page)
├── dashboard.html           (Dashboard page)
└── index.html               (Home page)
```

## Support Contact

If you encounter any issues not listed above:
1. Check the console for error messages
2. Take a screenshot of the error
3. Note the exact steps to reproduce
4. Check the browser being used (Chrome, Firefox, Safari, Edge)

---

**Last updated**: March 7, 2026
**Version**: 1.0 Complete Fix
