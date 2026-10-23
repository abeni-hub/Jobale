import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Building2 } from 'lucide-react';

/**
 * Safely resolves a Lucide icon component by name string.
 * Returns the provided fallback (or Building2) if the icon name is not found or invalid.
 */
export function resolveLucideIcon(iconName?: string | null, fallback: LucideIcon = Building2): LucideIcon {
  if (!iconName) return fallback;
  const iconsRecord = LucideIcons as unknown as Record<string, LucideIcon>;
  const resolved = iconsRecord[iconName];
  return typeof resolved === 'function' ? resolved : fallback;
}
