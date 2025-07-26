# Project Refactor Plan

This document outlines the tasks required to refactor the application. The tasks should be completed in the order they are listed.

---

### Phase 1: Database Refactor (Supabase)

**Goal:** Set up a clean, empty Supabase database with a `camelCase` schema, ready to be populated from the admin panel.

**Tasks:**

1.  **Clean Up Old Supabase-Related Files:**
    -   [ ] Delete the file `app/setup/page.tsx`.
    -   [ ] Delete the file `scripts/create-alumni-table.sql`.
    -   [ ] Delete the file `components/database-seeder.tsx`.

2.  **USER ACTION: Create the `alumni` Table in Supabase:**
    -   [ ] The user must log in to their Supabase project dashboard, navigate to the "SQL Editor", and run the following script. **This step must be completed by the user before proceeding.**
    ```sql
    CREATE TABLE public.alumni (
      "id" BIGSERIAL PRIMARY KEY,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "phone" TEXT,
      "address" JSONB,
      "programsAttended" JSONB,
      "biography" TEXT,
      "currentWork" JSONB,
      "tags" TEXT[],
      "languagesSpoken" TEXT[],
      "professionalAchievements" TEXT[],
      "portfolioLinks" JSONB,
      "experiencesAtDellArte" TEXT[],
      "referrals" TEXT[],
      "lastUpdated" DATE,
      "profilePrivacy" TEXT DEFAULT 'public',
      "donationHistory" JSONB,
      "createdAt" TIMESTAMPTZ DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ DEFAULT NOW()
    );
    ```

3.  **Connect Admin Import Page to Supabase:**
    -   [ ] Modify `app/admin/import/page.tsx`.
    -   [ ] Replace the simulated logic in `handleValidateAndPreview` and `handleImport` with calls to the Supabase client.
    -   [ ] The validation logic should check for required fields and ensure emails do not already exist in the `alumni` table.
    -   [ ] The import logic should insert the validated records into the `alumni` table.

4.  **Refactor the Data Store:**
    -   [ ] Modify `lib/alumni-store.ts`.
    -   [ ] Update the `fetchAlumni`, `addAlumni`, and any other data-mutating functions to interact directly with the `camelCase` Supabase `alumni` table.
    -   [ ] Remove any data transformation logic that converted between `snake_case` and `camelCase`, as it is no longer needed.

---

### Phase 2: Authentication (Clerk)

**Goal:** Replace the insecure mock login with Clerk for robust user authentication.

**Tasks:**

1.  **Install and Configure Clerk:**
    -   [ ] Add the `@clerk/nextjs` package to `package.json`.
    -   [ ] Wrap the application's root layout in `app/layout.tsx` with the `<ClerkProvider>`.
    -   [ ] Create a `middleware.ts` file in the root directory to configure protected routes.

2.  **Implement Clerk Components:**
    -   [ ] In `app/page.tsx`, remove the existing HTML form and replace it with Clerk's `<SignIn />` component.
    -   [ ] In `app/register/page.tsx`, remove the existing HTML form and replace it with Clerk's `<SignUp />` component.

3.  **Update UI to Reflect Auth State:**
    -   [ ] Modify `components/layout/header.tsx`.
    -   [ ] Use Clerk's `useUser()` and `<UserButton />` components to display user information and provide sign-out functionality. Show "Sign In" and "Sign Up" buttons when the user is not authenticated.

---

### Phase 3: Email Communications (Mailgun)

**Goal:** Implement a real email-sending service for admin communications.

**Tasks:**

1.  **Set up Mailgun:**
    -   [ ] Add a library for sending emails, such as `mailgun.js`, to `package.json`.
    -   [ ] Create a server-side API route at `app/api/send-email/route.ts`. This route will contain the logic for sending emails via the Mailgun API.

2.  **Connect Communications Page to API:**
    -   [ ] Modify `app/admin/communications/page.tsx`.
    -   [ ] Update the `handleSendBulk` and `handleSendTest` functions to send a POST request to the `app/api/send-email/route.ts` endpoint with the necessary email data (recipients, subject, body).
    -   [ ] Remove the `setTimeout` mock logic.
