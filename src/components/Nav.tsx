"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";
import cn from "clsx"; 

export function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="bg-sidebar text-primary-foreground w-60 h-full fixed top-0 left-0 flex flex-col justify-between py-60 px-2 shadow-xl">
      {children}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      className={cn(
        "py-2 px-4 w-full text-left hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground flex items-center", // Added flex and items-center
        pathname === props.href && " text-secondary-foreground"
      )}
    >
      {props.children}
    </Link>
  );
}