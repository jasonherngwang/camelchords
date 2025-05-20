import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function SignInPage() {
  return (
    <Suspense>
      <LoginForm mode="signin" />;
    </Suspense>
  );
}
