"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          CamelChords
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome!</CardTitle>
              <CardDescription>
                {mode === "signin"
                  ? "Sign in to your account"
                  : "Create your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                <input type="hidden" name="redirect" value={redirect || ""} />
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        defaultValue={state.email}
                        required
                        maxLength={50}
                        placeholder="Enter your email"
                        className="text-text"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={
                          mode === "signin"
                            ? "current-password"
                            : "new-password"
                        }
                        defaultValue={state.password}
                        required
                        minLength={8}
                        maxLength={100}
                        placeholder="Enter your password"
                        className="text-text"
                      />
                      {state?.error && (
                        <div className="text-red-500 text-sm">
                          {state.error}
                        </div>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={pending}
                      className="cursor-pointer"
                    >
                      {pending ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Loading...
                        </>
                      ) : mode === "signin" ? (
                        "Sign in"
                      ) : (
                        "Sign up"
                      )}
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    <Link
                      href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                        redirect ? `?redirect=${redirect}` : ""
                      }`}
                    >
                      {mode === "signin"
                        ? "Create an account"
                        : "Sign in to existing account"}
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
