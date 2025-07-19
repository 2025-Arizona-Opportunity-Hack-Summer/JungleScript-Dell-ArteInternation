import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp 
        afterSignUpUrl="/complete-profile" // Redirect after successful sign-up
        redirectUrl="/complete-profile" // For social logins
      />
    </div>
  );
}