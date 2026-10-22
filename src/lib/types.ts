/** Types mirroring the Django CMS API payloads. */

export type PublishState = 'draft' | 'published' | 'archived';

export interface SiteSettings {
  id: number;
  company_name: string;
  legal_name: string;
  slogan: string;
  logo: string | null;
  logo_dark: string | null;
  favicon: string | null;
  brand_primary: string;
  brand_navy: string;
  brand_accent: string;
  default_page_title: string;
  default_meta_description: string;
  social_facebook: string;
  social_linkedin: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  footer_copyright: string;
  website_url: string;
  updated_at?: string;
}

export interface HeroContent {
  id: number;
  eyebrow: string;
  headline: string;
  headline_accent: string;
  supporting_text: string;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  hero_image: string | null;
  background_image: string | null;
  overlay_opacity: number;
  show_blueprint: boolean;
  image_position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  focal_x: number;
  focal_y: number;
  caption: string;
  slogan: string;
}

export interface AboutStat {
  label: string;
  value: string;
  suffix?: string;
}

export interface IconTextItem {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutContent {
  id: number;
  eyebrow: string;
  heading: string;
  introduction: string;
  overview: string;
  mission: string;
  vision: string;
  core_values: IconTextItem[];
  history: string;
  main_image: string | null;
  secondary_image: string | null;
  stats: AboutStat[];
}

export interface AboutBlock {
  id: number;
  title: string;
  body: string;
  icon: string;
  image: string | null;
  display_order: number;
  is_visible: boolean;
}

export interface QualitySafetyContent {
  id: number;
  heading: string;
  introduction: string;
  quality_assurance: string;
  safety_practices: string;
  environmental_practices: string;
  commitments: IconTextItem[];
  hero_image: string | null;
  display_order: number;
}

export interface QualityStandard {
  id: number;
  name: string;
  issuing_body: string;
  certificate_number: string;
  valid_from: string | null;
  valid_until: string | null;
  category: string;
  description: string;
  document: string | null;
  image: string | null;
  display_order: number;
  status?: PublishState;
  internal_notes?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiService {
  id: number;
  title: string;
  slug: string;
  short_name: string;
  icon: string;
  summary: string;
  overview: string;
  scope: string[];
  applications: string[];
  approach: string;
  quality_safety: string;
  image: string | null;
  cta_label: string;
  cta_url: string;
  display_order: number;
  status: PublishState;
  is_featured: boolean;
  internal_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ProjectGalleryImage {
  id: number;
  project?: number;
  image: string;
  caption: string;
  alt_text: string;
  display_order: number;
}

export interface ApiProject {
  id: number;
  name: string;
  slug: string;
  category: number | null;
  category_name: string;
  resolved_category: string;
  client: string;
  location: string;
  overview: string;
  summary: string;
  description: string;
  scope: string[];
  specifications: string[];
  image: string | null;
  gallery: ProjectGalleryImage[];
  start_date: string | null;
  completion_date: string | null;
  project_status: 'Completed' | 'Ongoing' | 'Planned';
  project_status_display?: string;
  is_featured: boolean;
  display_order: number;
  status: PublishState;
  internal_notes?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientReference {
  id: number;
  name: string;
  logo: string | null;
  project: number | null;
  project_name?: string;
  association: string;
  description: string;
  display_order: number;
  status: PublishState;
  internal_notes?: string;
  show_logo: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  job_title: string;
  organization: string;
  quote: string;
  image: string | null;
  project: number | null;
  project_name?: string;
  display_order: number;
  status: PublishState;
  internal_notes?: string;
  is_verified: boolean;
}

export interface ContactSettings {
  id: number;
  heading: string;
  description: string;
  office_address: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  secondary_phone: string;
  email: string;
  secondary_email: string;
  business_hours: string;
  map_url: string;
  map_embed_url: string;
  inquiry_recipient: string;
  form_note: string;
  social_facebook: string;
  social_linkedin: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
}

export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  display_order: number;
  is_visible: boolean;
  is_external: boolean;
  open_in_new_tab: boolean;
  status: PublishState;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterContactDetail {
  label: string;
  value: string;
  href?: string;
}

export interface FooterSettings {
  id: number;
  description: string;
  logo: string | null;
  columns: FooterColumn[];
  contact_details: FooterContactDetail[];
  social_links: FooterLink[];
  copyright_text: string;
  legal_links: FooterLink[];
  show_replay_intro: boolean;
}

export interface SEOSettings {
  id: number;
  page_title: string;
  meta_description: string;
  og_image: string | null;
  social_title: string;
  social_description: string;
  twitter_handle: string;
  keywords: string;
  canonical_url: string;
}

export interface PageSection {
  id: number;
  key: string;
  label: string;
  description: string;
  display_order: number;
  is_enabled: boolean;
  icon: string;
  updated_at: string;
}

export interface MediaAsset {
  id: number;
  file: string;
  url: string;
  title: string;
  alt_text: string;
  description: string;
  kind: 'image' | 'document';
  kind_display: string;
  content_type: string;
  size_bytes: number;
  size_display: string;
  extension: string;
  filename: string;
  uploaded_by_name: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeContent {
  site_settings: SiteSettings;
  hero: HeroContent;
  about: AboutContent;
  about_blocks: AboutBlock[];
  quality_safety: QualitySafetyContent;
  quality_standards: QualityStandard[];
  services: ApiService[];
  projects: ApiProject[];
  featured_projects: ApiProject[];
  project_categories: ProjectCategory[];
  clients: ClientReference[];
  testimonials: Testimonial[];
  contact: ContactSettings;
  footer: FooterSettings;
  navigation: NavigationItem[];
  seo: SEOSettings;
}

export interface CMSUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'owner' | 'editor' | 'viewer';
  role_display: string;
  job_title: string;
  is_owner: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface DashboardSummary {
  published_sections: number;
  enabled_sections: number;
  draft_changes: number;
  published_projects: number;
  featured_projects: number;
  draft_projects: number;
  active_services: number;
  draft_services: number;
  published_clients: number;
  published_testimonials: number;
  quality_standards: number;
  media_assets: number;
  last_content_update: string | null;
  last_activity: ActivityItem | null;
}

export interface ActivityItem {
  id?: number;
  action: string;
  section: string;
  summary: string;
  actor: string;
  created_at: string;
}

export interface SingletonEnvelope<T> {
  live: T;
  draft: Partial<T> | null;
  has_draft: boolean;
  published_at: string | null;
  updated_at: string;
}
