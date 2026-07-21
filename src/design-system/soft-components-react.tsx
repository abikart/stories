"use client";

import { useEffect, useState } from "react";
import { registerSoftComponents } from "./soft-components/register";

export function SoftComponentsLoader({ children }: { children?: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void registerSoftComponents().then(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div data-soft-components-ready={ready ? "true" : "false"}>
      {children}
    </div>
  );
}
