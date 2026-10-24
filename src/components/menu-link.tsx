import Link from "next/link";
import type { MenuItem } from "@/lib/types";

/** A menu item: internal paths through <Link>, URLs as plain links. */
export function MenuLink({ item, className }: { item: MenuItem; className?: string }) {
  const external = /^https?:\/\//.test(item.href);
  const newTab = item.new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (external) {
    return (
      <a href={item.href} className={className} {...newTab}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} {...newTab}>
      {item.label}
    </Link>
  );
}
