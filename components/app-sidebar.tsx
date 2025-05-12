"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { UserDropdown } from "@/components/user-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { LibraryContext } from "@/app/library/context";

const data = {
  navUser: [
    {
      title: "Sign out",
      url: "/sign-out",
    },
  ],
};

export function AppSidebar({ ...props }) {
  const songsContext = React.useContext(LibraryContext);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <UserDropdown options={data.navUser} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain songs={songsContext.songs} />
      </SidebarContent>
    </Sidebar>
  );
}
