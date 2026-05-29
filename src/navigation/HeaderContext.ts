import React, { createContext, useContext } from "react";

interface HeaderConfig {
  title?: string;
  onBack?: () => void;
}

export const HeaderContext = createContext<{
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
}>({
  config: {},
  setConfig: () => {},
});

export function useHeaderConfig() {
  return useContext(HeaderContext);
}
