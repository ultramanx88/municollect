"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, User, ReceiptText, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "หน้าหลัก" },
  { href: "/dashboard/payment", icon: QrCode, label: "ชำระเงิน" },
  { href: "/dashboard/billing", icon: ReceiptText, label: "ใบแจ้งหนี้" },
  { href: "/dashboard/history", icon: History, label: "ประวัติ" },
  { href: "/dashboard/profile", icon: User, label: "โปรไฟล์" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-t-md z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = (item.href === '/dashboard' && pathname === item.href) || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-sm transition-colors duration-200 w-1/5",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
