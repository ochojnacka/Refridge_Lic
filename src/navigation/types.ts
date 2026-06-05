export type RootStackParamList = {
  // --- Auth Flow ---
  Login: undefined;
  Register: undefined;
  
  // --- Main App Flow ---
  Tabs: { transition?: "forward" | "back" } | undefined;
  
  // --- Bottom Tab Screens (Nested in Tabs) ---
  Dashboard: undefined;
  Suggestions: undefined;
  Inventory: undefined;
  Account: undefined;
  
  // --- Feature Screens (Pushed on top of Tabs) ---
  WasteLogging: undefined;
  DetailedKPI: undefined;
  Alerts: undefined;
};