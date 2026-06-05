// src/components/Layout.tsx
import React from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { COLORS, SPACING } from "../theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  footerBottomInset?: number;
  scrollBottomInset?: number;
  refreshControl?: React.ReactElement; // Dodane wsparcie dla Pull-to-refresh
  onScrollCallback?: (y: number) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function ScreenContainer({
  children,
  scroll = true,
  header,
  footer,
  footerBottomInset = 0,
  scrollBottomInset = 40, // Zmniejszony domyślny margines dolny (brak wielkich pływających przycisków B2C)
  refreshControl,
  onScrollCallback,
  scrollViewRef,
}: ScreenContainerProps) {
  const contentView = scroll ? (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomInset }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={refreshControl}
      onScroll={onScrollCallback ? (e) => onScrollCallback(e.nativeEvent.contentOffset.y) : undefined}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <View style={styles.container}>
      {header}
      <View style={styles.contentArea} pointerEvents="box-none">
        {contentView}
      </View>
      {footer && <View style={[styles.footer, { bottom: footerBottomInset }]}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Czyste tło pod czytelne wykresy i tabele
  },
  contentArea: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md, // Zmniejszono z lg na md: więcej miejsca na dane analityczne
    paddingTop: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
});