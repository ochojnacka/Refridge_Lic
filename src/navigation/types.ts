export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  
  // B2B App screens
  Tabs: { transition?: "forward" | "back" } | undefined;
  
  // Tab screens (nested in Tabs)
  Dashboard: undefined;
  Suggestions: undefined;
  Inventory: undefined;
  Account: undefined;
  
  // Future screens (placeholder for new features)
  WasteLogging: undefined;
  DetailedKPI: undefined;
  Alerts: undefined;
};
