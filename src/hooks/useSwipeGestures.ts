import { useRef, useEffect } from "react";
import { Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";

interface SwipeGesturesConfig {
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeGestures(config: SwipeGesturesConfig) {
  const { onSwipeDown, onSwipeLeft, onSwipeRight, threshold = 50 } = config;
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState): boolean => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (onSwipeDown && dy > 16 && absDy > absDx * 1.2) {
          return true;
        }

        if ((onSwipeLeft || onSwipeRight) && absDx > 16 && absDx > absDy * 1.2) {
          return true;
        }

        return false;
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Swipe down
        if (dy > threshold && absDy > absDx) {
          onSwipeDown?.();
        }
        // Swipe left (go forward in flow)
        else if (dx < -threshold && absDx > absDy) {
          onSwipeLeft?.();
        }
        // Swipe right (go back in flow)
        else if (dx > threshold && absDx > absDy) {
          onSwipeRight?.();
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return {
    panResponder: panResponder.panHandlers,
    pan,
  };
}
