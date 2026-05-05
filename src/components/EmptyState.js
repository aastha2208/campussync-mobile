import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme';

/**
 * Reusable empty state component
 * @param {string} icon - Ionicons name
 * @param {string} emoji - Optional emoji to show with icon
 * @param {string} title - Big bold heading
 * @param {string} description - Smaller helper text
 * @param {string} actionLabel - CTA button text (optional)
 * @param {function} onAction - CTA handler (optional)
 * @param {string} variant - 'default' | 'minimal'
 */
export default function EmptyState({
  icon = 'document-outline',
  emoji,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  variant = 'default',
  iconColor = COLORS.primary,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Gentle floating animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const float = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimal, { opacity: fadeAnim }]}>
        <Ionicons name={icon} size={36} color={COLORS.textTertiary} />
        <Text style={styles.minimalText}>{title}</Text>
        {description && <Text style={styles.minimalDesc}>{description}</Text>}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* Animated icon with gradient bg */}
      <Animated.View style={{ transform: [{ translateY: float }] }}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={[iconColor + '33', iconColor + '11']}
            style={styles.iconBg}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {emoji ? (
              <Text style={styles.emoji}>{emoji}</Text>
            ) : (
              <Ionicons name={icon} size={42} color={iconColor} />
            )}
          </LinearGradient>
          {/* Decorative dots */}
          <View style={[styles.decorDot, { top: 6, right: 12, backgroundColor: iconColor + '88' }]} />
          <View style={[styles.decorDot, { bottom: 12, left: 4, backgroundColor: iconColor + '66', width: 6, height: 6 }]} />
          <View style={[styles.decorDot, { top: 28, left: -2, backgroundColor: iconColor + '44', width: 4, height: 4 }]} />
        </View>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.85} style={styles.btnWrap}>
          <LinearGradient colors={COLORS.gradientPrimary} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.btnText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg, gap: 8 },

  iconWrap: { position: 'relative', marginBottom: SPACING.sm },
  iconBg: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  emoji: { fontSize: 50 },
  decorDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },

  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginTop: 4 },
  description: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 19, paddingHorizontal: SPACING.md, maxWidth: 320 },

  btnWrap: { marginTop: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12 },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Minimal variant
  minimal: { alignItems: 'center', paddingVertical: SPACING.lg, gap: 6 },
  minimalText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  minimalDesc: { fontSize: 12, color: COLORS.textTertiary },
});