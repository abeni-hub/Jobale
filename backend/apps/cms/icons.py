"""Approved Lucide icon whitelist for CMS-managed icon pickers."""

ALLOWED_ICONS = {
    'Building2', 'HardHat', 'Ruler', 'Wrench', 'Layers', 'ShieldCheck', 'ClipboardCheck',
    'Users', 'MessageSquare', 'Clock', 'DollarSign', 'CheckCircle2', 'Leaf', 'Factory',
    'HeartPulse', 'GraduationCap', 'Home', 'Briefcase', 'Globe2', 'Quote', 'Landmark',
    'Truck', 'Crane', 'Droplets', 'Zap', 'Sun', 'Recycle', 'Truck', 'Compass', 'Award',
    'BadgeCheck', 'Cog', 'Settings', 'Waves', 'Wind', 'TreePine', 'Hammer', 'Paintbrush',
    'Anchor', 'Blocks', 'Building', 'Flame', 'Gauge', 'Lightbulb', 'Mountain', 'PenTool',
    'Pickaxe', 'Radar', 'Search', 'Sprout', 'Tent', 'TrafficCone', 'Warehouse', 'Wrench',
}

ALLOWED_ICON_LIST = sorted(ALLOWED_ICONS)


def is_allowed_icon(name: str) -> bool:
    if not name:
        return False
    return name in ALLOWED_ICONS
