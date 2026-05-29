import React from "react";
import { ScrollView, StyleSheet, View, GestureResponderHandlers } from "react-native";
import { COLORS, SPACING } from "../theme";

export function ScreenContainer({
  children,
  scroll = true,
  header,
  footer,
  swipeResponder,
  footerBottomInset = 0,
  scrollBottomInset = 100,
  onScrollCallback,
  scrollViewRef,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  swipeResponder?: GestureResponderHandlers;
  footerBottomInset?: number;
  scrollBottomInset?: number;
  onScrollCallback?: (y: number) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}) {
  const contentView = scroll ? (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomInset }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bounces={true}
      alwaysBounceVertical={true}
      onScroll={(e) => onScrollCallback?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <View style={styles.container} {...swipeResponder}>
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
    backgroundColor: COLORS.background,
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
    paddingHorizontal: SPACING.lg,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
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