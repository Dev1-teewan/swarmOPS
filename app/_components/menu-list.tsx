"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, History, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuListProps {
  sider: {
    collapsed: boolean
  }
  showIcons: boolean
}

const MenuList = ({ sider, showIcons }: MenuListProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const items = [
    {
      key: "/chat",
      icon: Home,
      label: "Chat",
      onClick: () => router.push("/chat"),
    },
  ]

  return (
    <nav className="flex flex-col gap-2 mt-10">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.key

        return (
          <button
            key={item.key}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-3 px-5  lg:px-7 py-2 text-sm font-medium transition-colors",
              "hover:text-[#ddf813]",
              isActive ? "bg-[#ddf813]/10 text-[#ddf813]" : "text-zinc-400",
              !sider.collapsed && "w-full",
            )}
          >
            {showIcons && <Icon className="h-[18px] w-[18px] shrink-0" />}
            {!sider.collapsed && <span className="truncate">{item.label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

export default MenuList

