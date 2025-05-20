"use client";

import * as React from "react";
import { ChevronDown, Guitar, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

export function UserDropdown({
  options,
}: {
  options?: { title: string; url: string; isSignOut?: boolean }[];
}) {
  const { userPromise } = useUser();
  const user = React.use(userPromise);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Guitar className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{user?.name || "Camel"}</span>
                <span className="">{user?.email || ""}</span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {options?.map((option) => {
              if (option.isSignOut) {
                return null;
              }
              return (
                <DropdownMenuItem key={option.title} asChild>
                  <a href={option.url} className="w-full">{option.title}</a>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="stroke-primary" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
} 