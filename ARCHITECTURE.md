# Resume Builder - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (HTML/CSS)                 │
├─────────────────────────────────────────────────────────────┤
│  index.html  login.html  signup.html  builder.html           │
│  preview.html  dashboard.html  templates.html                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              JavaScript Application Layer                     │
├─────────────────────────────────────────────────────────────┤
│  auth.js (Authentication)          database.js (Firestore)   │
│  builder.js (Resume Logic)         pdf-download.js (Export)  │
│  firebase-config.js (Setup)        script.js (Utilities)     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  Firebase Services                            │
├─────────────────────────────────────────────────────────────┤
│  Authentication     Firestore Database     Cloud Storage     │
│  (Auth Module)      (Resume Data)          (Photo Uploads)   │
└───────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

```
START
  │
  ├─→ [index.html] (Home Page)
  │    │
  │    ├─→ "Sign Up" → [signup.html]
  │    │    │
  │    │    ├─ Enter Name, Email, Password
  │    │    ├─ Validate Form
  │    │    ├─ Call: auth.signUp(name, email, password)
  │    │    │  └─→ Firebase: createUserWithEmailAndPassword()
  │    │    │  └─→ Firebase: updateProfile(displayName)
  │    │    │
  │    │    └─→ Success: Redirect to [dashboard.html]
  │    │
  │    └─→ "Sign In" → [login.html]
  │         │
  │         ├─ Enter Email, Password
  │         ├─ Validate Form
  │         ├─ Call: auth.signIn(email, password)
  │         │  └─→ Firebase: signInWithEmailAndPassword()
  │         │
  │         └─→ Success: Redirect to [dashboard.html]
  │
  ├─→ [dashboard.html] (Resume Management)
  │    │
  │    ├─ Load: onAuthChange() → Check authentication
  │    ├─ Load: getUserResumes(userId) → Fetch all resumes
  │    │
  │    ├─ Display: List of existing resumes
  │    │
  │    └─ Action Options:
  │         ├─→ "New Resume" → [builder.html]
  │         ├─→ "View" → [preview.html?id=<resumeId>]
  │         ├─→ "Edit" → [builder.html?id=<resumeId>]
  │         └─→ "Delete" → deleteResume(resumeId)
  │
  ├─→ [builder.html] (Resume Editor)
  │    │
  │    ├─ Load: onAuthChange() → Check authentication
  │    ├─ If ?id= parameter: Load existing resume
  │    │  └─→ getResume(resumeId) → Load from Firestore
  │    │
  │    ├─ Display: Form with sections:
  │    │  ├─ Personal Information
  │    │  ├─ Education
  │    │  ├─ Skills
  │    │  ├─ Projects
  │    │  └─ Certifications
  │    │
  │    ├─ Features:
  │    │  ├─ Live Preview (right panel updates instantly)
  │    │  ├─ Photo Upload (drag & drop or click)
  │    │  ├─ Add/Remove Skills, Education, Projects, Certs
  │    │
  │    ├─ Auto-Save:
  │    │  ├─ Every form change triggers updatePreview()
  │    │  ├─ Debounced save (2 seconds) calls saveResumeData()
  │    │  │  └─→ database.saveResume() → Firestore update/create
  │    │
  │    └─ Actions:
  │         ├─→ "Save" → Save immediately
  │         ├─→ "Preview" → [preview.html?id=<resumeId>]
  │         └─→ "Back" → [dashboard.html]
  │
  └─→ [preview.html] (Resume Preview)
       │
       ├─ Load: onAuthChange() → Check authentication
       ├─ Get: ?id= parameter from URL
       ├─ Load: getResume(resumeId) → Fetch resume data
       │
       ├─ Render: Format resume based on template:
       │  ├─ template1: Modern design with profile photo
       │  ├─ template2: Classic serif design
       │  └─ template3: Dark professional design
       │
       └─ Actions:
            ├─→ "Edit" → [builder.html?id=<resumeId>]
            ├─→ "Print" → Open print dialog
            ├─→ "Download PDF" → html2pdf() → Download
            └─→ "Back" → History back

```

## Data Flow

### 1. Resume Data Structure
```javascript
{
  id: "docId123",                    // Firestore document ID
  userId: "user456",                 // Firebase auth user ID
  title: "My Resume",
  template: "template1",
  
  personal: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555 1234",
    address: "New York, NY",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    summary: "Professional summary...",
    photo: "data:image/..." // Base64 encoded
  },
  
  education: [
    {
      degree: "BS Computer Science",
      college: "MIT",
      start: "2018",
      end: "2022",
      gpa: "3.8"
    }
  ],
  
  skills: ["JavaScript", "React", "Node.js", ...],
  
  projects: [
    {
      title: "Project Name",
      company: "Company/Project",
      start: "Jan 2023",
      end: "Present",
      desc: "Description...",
      tech: "React, Node.js, MongoDB"
    }
  ],
  
  certifications: [
    {
      name: "AWS Solutions Architect",
      org: "Amazon",
      date: "Dec 2023"
    }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. Authentication Flow
```
User Input (Email/Password)
  ↓
HTML Form Validation
  ↓
Call: auth.signUp() or auth.signIn()
  ↓
Firebase Authentication
  ↓
Create Auth Session (stored in browser)
  ↓
onAuthStateChanged() listener fires
  ↓
Check if user exists
  ↓
Yes → Load user data and redirect to dashboard
No → Show error message
```

### 3. Save Flow
```
User types in form field
  ↓
Input event listener triggered
  ↓
updatePreview() called → Updates live preview
  ↓
scheduleSave() called → Debounce timer resets (2 seconds)
  ↓
User stops typing for 2 seconds
  ↓
saveResumeData() called
  ↓
collectFormData() → Gather all form values
  ↓
database.saveResume() → Firebase Firestore
  ↓
If new resume → Create new document → Get ID
If existing → Update document with merge: true
  ↓
URL updated with resume ID
  ↓
Show "Saved" confirmation (2 seconds)
```

## Key Functions

### Authentication
- `signUp(name, email, password)` - Create new account
- `signIn(email, password)` - Login
- `logOut()` - Logout
- `resetPassword(email)` - Send reset email
- `onAuthChange(callback)` - Listen to auth state changes
- `getCurrentUser()` - Get current authenticated user

### Resume Management
- `saveResume(userId, resumeData, resumeId)` - Save/update resume
- `getResume(resumeId)` - Load single resume
- `getUserResumes(userId)` - Load all user's resumes
- `deleteResume(resumeId)` - Delete a resume

### Builder Functions
- `updatePreview()` - Update live preview
- `collectFormData()` - Gather form data
- `addSkill() / removeSkill()` - Manage skills
- `addEducation() / removeEducation()` - Manage education
- `addProject() / removeProject()` - Manage projects
- `addCertification() / removeCertification()` - Manage certifications
- `saveResumeData()` - Save resume to Firebase

### Preview & Export
- `downloadPDF()` - Generate and download PDF using html2pdf

## State Management

### Global Variables in builder.js
```javascript
let skills = []                              // Array of skill strings
let educationCount = 1                       // Number of education entries
let projectCount = 1                         // Number of project entries
let certCount = 1                            // Number of certification entries
let currentTemplate = 'template1'            // Selected template
let photoDataURL = null                      // Base64 encoded photo
let currentResumeId = null                   // ID if editing existing resume
let currentUser = null                       // Auth user object
```

### Local Storage
```javascript
localStorage.getItem('selectedTemplate')    // Last selected template
```

## Event Listeners

### Form Changes
- All inputs with class `preview-trigger` listen for `input` events
- Trigger: `updatePreview()` and `scheduleSave()`

### Document Ready
- `DOMContentLoaded` → Initialize form, attach listeners

### Auth State
- `onAuthStateChanged()` → Check user, load resume if editing

### Button Clicks
- "Save" → `saveResumeData()`
- "Preview" → Redirect to `preview.html?id=<resumeId>`
- "Add X" buttons → Add new entry to respective section
- "Remove X" buttons → Delete entry from section

## Error Handling

### Login/Signup Errors
```javascript
{
  'auth/user-not-found': 'No account found',
  'auth/wrong-password': 'Incorrect password',
  'auth/email-already-in-use': 'Email already registered',
  'auth/invalid-email': 'Invalid email format',
  'auth/weak-password': 'Password too weak'
}
```

### Database Errors
- All database functions wrapped in try-catch
- Errors logged to console
- User receives alert if critical

### General Error Strategy
1. Try operation
2. Catch error
3. Log to console
4. Show user-friendly message
5. Allow retry

## Performance Considerations

1. **Debounced Saving**: 2-second delay prevents database spam
2. **Live Preview**: Inline HTML generation is instant
3. **Lazy Loading**: Resume data only loaded when needed
4. **Efficient Queries**: SingleFirestore queries with proper indexing
5. **Base64 Photos**: Embedded in document (alternative: Firebase Storage)

## Security Measures

1. **Firebase Authentication**: Secured user accounts
2. **Firestore Rules**: Data access based on userId
3. **Client-side Validation**: Form input validation
4. **HTTPS**: Required by Firebase
5. **No Sensitive Data**: No passwords stored client-side

---

This architecture ensures a smooth, reliable, and scalable resume builder application.
