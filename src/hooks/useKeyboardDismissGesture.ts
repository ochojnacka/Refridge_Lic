import React, { useMemo } from "react";
import { Keyboard, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

interface UseKeyboardDismissGestureOptions {
  threshold?: number;
}

export function useKeyboardDismissGesture(options: UseKeyboardDismissGestureOptions = {}) {
  const { threshold = 50 } = options;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          // Trigger on downward swipe
          return gestureState.dy > threshold && Math.abs(gestureState.dx) < threshold;
        },
        onPanResponderMove: () => {},
        onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          if (gestureState.dy > threshold) {
            Keyboard.dismiss();
          }
        },
      }),
    [threshold]
  );

  return panResponder;
}
