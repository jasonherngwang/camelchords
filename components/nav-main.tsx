"use client";

import Link from "next/link";
import { ChevronRight, PlusIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { Song } from "@/lib/db/schema";

function SongNameWithTooltip({
  name,
  hovered,
}: {
  name: string;
  hovered: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    function checkTruncation() {
      const el = spanRef.current;
      if (el) {
        setTruncated(el.scrollWidth > el.offsetWidth);
      }
    }
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [name]);

  useEffect(() => {
    if (hovered && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setTooltipPos({
        left: rect.left,
        top: rect.top - 2,
        width: rect.width,
      });
    } else {
      setTooltipPos(null);
    }
  }, [hovered]);

  return (
    <>
      <span
        className="truncate text-left w-full"
        ref={spanRef}
        style={{ display: "inline-block", maxWidth: "12rem" }}
      >
        {name}
      </span>
      {truncated &&
        hovered &&
        tooltipPos &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <span
            className="z-50 h-7 px-2 flex items-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground font-normal text-sm pointer-events-none"
            style={{
              position: "fixed",
              left: tooltipPos.left - 8,
              top: tooltipPos.top - 2,
              minWidth: tooltipPos.width,
              height: 28,
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>,
          document.body
        )}
    </>
  );
}

export function NavMain({ songs }: { songs: Song[] }) {
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="flex items-center w-full justify-between group">
                <span>Library</span>
                <ChevronRight className="chevron transition-transform group-data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {songs?.length ? (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {songs
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((song) => (
                      <SidebarMenuSubItem key={song.id}>
                        <SidebarMenuSubButton
                          asChild
                          onMouseEnter={() =>
                            setHoveredSongId(song.id.toString())
                          }
                          onMouseLeave={() => setHoveredSongId(null)}
                        >
                          <Link
                            href={`/library/${song.id.toString()}`}
                            className="w-full"
                          >
                            <SongNameWithTooltip
                              name={song.name}
                              hovered={hoveredSongId === song.id.toString()}
                            />
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/library/create-song">
                        <PlusIcon className="stroke-primary" />
                        <span>Create Song</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            ) : null}
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
