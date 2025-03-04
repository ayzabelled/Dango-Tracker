"use client"
import { ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";


import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";

import Image from "next/image";

// Menu items.
const items = [
  {
    title: "📊 Dashboard",
    url: "/",
  },
];

const collapsibleItems = [
  {
    label: "Financial Tracker",
    items: [
      {
        title: "📜 Financial History",
        url: "/financial-tracker",
      },
      {
        title: "➕ New Entry",
        url: "/financial-tracker/new-entry",
      },
    ],
  },
  {
    label: "Journal",
    items: [
      {
        title: "📖 Journal Entries",
        url: "/journal",
      },
      {
        title: "✍️ New Entry",
        url: "/journal/new-entry",
      },
    ],
  },
  {
    label: "To-do List",
    items: [
      {
        title: "☑️ To-do List",
        url: "/to-do-list",
      },
      {
        title: "➕ New Entry",
        url: "/to-do-list/new-entry",
      },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <Image src="/logo.png" height={200} width={200} alt="Logo" className="flex justify-center pl-12" />
      <h1 className="text-[#6486DB] flex justify-center text-xl font-bold">🍡 Dango Tracker 🍡</h1>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {collapsibleItems.map((group) => (
          <Collapsible key={group.label} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {group.label}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu> {/* Add SidebarMenu here */}
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}> {/* Key is important */}
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu> {/* Close SidebarMenu */}
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        <SidebarMenu>
            <SidebarMenuItem key="logout">
              <SidebarMenuButton asChild>
              <button onClick={() => signOut()}>
              <span>🚪 Logout</span>
            </button>

              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <footer className="text-sm text-muted-foreground p-4">
        Designed and Developed by{" "}
        <a
          href="https://www.linkedin.com/in/allana-yzabelle-diaz-346787236/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Allana Yzabelle Diaz
        </a>
        <br />
        Icons by{" "}
        <a
          href="https://icons8.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Icons8
        </a>
      </footer>
    </Sidebar>
    
  );
}