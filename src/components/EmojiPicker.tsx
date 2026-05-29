import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { COLORS, RADIUS } from "../theme";

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelectEmoji: (emoji: string) => void;
  topOffset?: number;
}

const COMMON_EMOJIS = [
  "🥩", "🥬", "🧈", "🧀", "🥚", // predefined
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍓", "🫐", "🍒", "🍑",
  "🥕", "🌽", "🥒", "🧄", "🧅", "🥔", "🍞", "🥐", "🥯",
  "🥛", "🍶", "🍺", "🍻", "🥂", "🍾", "🍷", "🍸", "🍹",
  "🍔", "🍟", "🌭", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯",
  "🥗", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥘", "🍚",
  "🍤", "🦐", "🦑", "🐚", "🧂", "🧈", "🥄", "🍴", "🥡",
  "🍰", "🎂", "🍪", "🍩", "🍫", "🍬", "🍭", "🍮", "🍯",
  "🥟", "🥠", "🥮", "🍱", "🥻", "🍘", "🍙", "🍚", "🍛",
  "🌶️", "🫑", "🌶", "🫒", "🫓", "🌾",
];

export function EmojiPicker({ selectedEmoji, onSelectEmoji, topOffset: propsTopOffset }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [closePressed, setClosePressed] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Modal starts after AddToFridge header if propsTopOffset is provided, otherwise just use screen top
  const topOffset = propsTopOffset ?? insets.top;

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.emojiButton,
          pressed ? styles.emojiButtonPressed : undefined,
        ]}
      >
        <Text style={styles.emojiText}>{selectedEmoji || "😀"}</Text>
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable 
            onPress={() => {}} 
            style={[styles.modalContent, { marginTop: topOffset }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>select icon</Text>
              <Pressable
                onPress={() => setShowPicker(false)}
                onPressIn={() => setClosePressed(true)}
                onPressOut={() => setClosePressed(false)}
                style={[styles.closeButton, closePressed ? styles.closeButtonPressed : undefined]}
              >
                <X size={18} color={closePressed ? "#ffffff" : COLORS.primary} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.emojiGrid}
              contentContainerStyle={styles.emojiGridContent}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              bounces={false}
              alwaysBounceVertical={false}
            >
              {COMMON_EMOJIS.map((emoji, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    onSelectEmoji(emoji);
                    setShowPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.emojiGridItem,
                    pressed ? styles.emojiGridItemPressed : undefined,
                    selectedEmoji === emoji ? styles.emojiGridItemSelected : undefined,
                  ]}
                >
                  <Text style={styles.emojiGridEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiButtonPressed: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.modal,
    borderTopRightRadius: RADIUS.modal,
    width: "100%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "center",
    gap: 12,
  },
  emojiGridItem: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  emojiGridItemPressed: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiGridItemSelected: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emojiGridEmoji: {
    fontSize: 24,
    lineHeight: 48,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: COLORS.primary,
  },
});
