"use client";

import React, { useEffect, useState } from "react";

import { getFrequentLinks } from "@/app/utils/trackLinkClicks";
import Link from "next/link";
import { Button } from "../ui/button";

const FrequentLinks: React.FC = () => {
  const [links, setLinks] = useState<string[]>([]);

  useEffect(() => {
    setLinks(getFrequentLinks());
  }, []);

  const getButtonText = (route: string) => {
    const parts = route.split("/");
    const text = parts[parts.length - 1] || parts[parts.length - 2]; // Replace hyphens with spaces and capitalize each word
    return text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className=" gradientBG flex space-x-2 flex-col items-center justify-center  w-full py-2">
      <div className="h-2 text-xs pb-4 justify-center text-white">
        Frequent Links
      </div>
      <div className="flex-row space-x-2">
        {links.map((route) => (
          <Link href={route} key={route}>
            <Button variant="outline" className="h-2 text-xs">
              {getButtonText(route)}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FrequentLinks;
