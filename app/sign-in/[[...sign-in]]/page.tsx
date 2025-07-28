import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <SignIn path="/sign-in" />
    </div>
  );
} 