import { AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessible?: boolean;
}

export const createAccessibilityProps = (
  label: string,
  hint?: string,
  role?: AccessibilityRole,
  state?: AccessibilityState
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role,
  accessibilityState: state,
});

export const buttonA11y = (label: string, disabled = false): AccessibilityProps => 
  createAccessibilityProps(
    label,
    disabled ? 'Button is disabled' : 'Double tap to activate',
    'button',
    { disabled }
  );

export const linkA11y = (label: string): AccessibilityProps =>
  createAccessibilityProps(
    label,
    'Double tap to open',
    'link'
  );

export const headerA11y = (text: string): AccessibilityProps =>
  createAccessibilityProps(text, undefined, 'header');

export const imageA11y = (description: string): AccessibilityProps =>
  createAccessibilityProps(description, undefined, 'image');
