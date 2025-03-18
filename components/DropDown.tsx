"use client";
import { handleLinkClick, trackLinkClick } from "@/app/utils/trackLinkClicks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface DropdownItem {
  label: string;
  url: string;
}

interface DropdownProps {
  items: DropdownItem[];
  title: string;
}

export function Dropdown({ items, title }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSeparator />
        {items?.map((item, index) => (
          <DropdownMenuGroup key={index}>
            <DropdownMenuItem>
              <Link
                href={item.url}
                onClick={() => handleLinkClick(` ${item.url} `)}
              >
                {item.label}
              </Link>
            </DropdownMenuItem>

            {index < items.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
