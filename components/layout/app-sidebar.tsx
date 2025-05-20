"use client";

import * as React from "react";

import { NavMain } from "@/components/layout/nav-main";
import { UserDropdown } from "@/components/layout/user-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { LibraryContext } from "@/app/library/context";

export function AppSidebar({ ...props }) {
  const songsContext = React.useContext(LibraryContext);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <UserDropdown />
      </SidebarHeader>
      <SidebarContent>
        <NavMain songs={songsContext.songs} />
      </SidebarContent>
    </Sidebar>
  );
} 