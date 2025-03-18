"use client";

import Image from "next/image";
import Background from "/assets/branding/visionary.png";
import { clearLinkClicks, getFrequentLinks } from "./utils/trackLinkClicks";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import { useSchema } from "./context/SchemaContext";

export default function Home() {
  const { setUser } = useUser();
  const { clearLocalData } = useSchema();
  const [links, setLinks] = useState<string[]>([]);

  // useEffect(() => {
  //   clearLinkClicks(); // Clear the link clicks when the component mounts
  //   setLinks(getFrequentLinks());
  //   localStorage.clear();
  //   clearLocalData();
  // }, []);

  return (
    <div>
      <Image src={Background} alt="background" sizes="100vw" />
    </div>
  );
}
