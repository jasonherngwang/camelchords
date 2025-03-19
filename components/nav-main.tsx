'use client';

import { ChevronRight, BookOpen, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { Song } from '@/lib/db/schema';

export function NavMain({ songs }: { songs: Song[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {/* <BookOpen /> */}
              <span>{'Library'}</span>
            </SidebarMenuButton>
            {songs?.length ? (
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {songs?.map((song) => (
                      <SidebarMenuSubItem key={song.name}>
                        <SidebarMenuSubButton asChild>
                          <a href={`/library/${song.id.toString()}`}>
                            <span>{song.name}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </>
            ) : null}
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
