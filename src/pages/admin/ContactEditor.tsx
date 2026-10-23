import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { ContactSettings, SingletonEnvelope } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Share2,
  Inbox,
  Loader2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface InquiryRecord {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  created_at: string;
}

export default function ContactEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [contact, setContact] = useState<Partial<ContactSettings>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<ContactSettings> | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fetchContact = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<SingletonEnvelope<ContactSettings>>('/cms/contact-settings/');
      setEnvelope(res);
      const initial = res.draft ? { ...res.live, ...res.draft } : res.live;
      setContact(initial || {});
      setIsDirty(false);

      // Attempt to load inquiries if endpoint available
      try {
        const inqRes = await api.get<unknown>('/contact/inquiries/');
        if (Array.isArray(inqRes)) {
          setInquiries(inqRes as InquiryRecord[]);
        }
      } catch {
        // Inquiries endpoint might return empty or not list all, safe fallback
      }
    } catch (err) {
      error((err as Error).message || 'Failed to load contact settings');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const handleChange = (field: keyof ContactSettings, value: unknown) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/contact-settings/', { fields: contact });
      success('Draft contact settings saved. Publish to make them live on the website.', 'Draft Saved');
      await fetchContact();
    } catch (err) {
      error((err as Error).message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/contact-settings/', { fields: contact });
      success('Contact settings published live successfully!', 'Published');
      await fetchContact();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish contact settings');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Discard staged draft changes for Contact Information?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/contact-settings/');
      success('Staged draft discarded.');
      await fetchContact();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-steel/60">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light mb-2" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Contact Information & Inquiries
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage corporate telephone lines, office address, notification recipients, business hours, and view client inquiry messages.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Headings & Introduction */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <PhoneCall className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Contact Page Headings
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                value={contact.heading || ''}
                onChange={(e) => handleChange('heading', e.target.value)}
                placeholder="Get in Touch with Jobale Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Introductory Description
              </label>
              <textarea
                rows={2}
                value={contact.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Our engineering team is ready to discuss your project requirements, technical specifications, and site inspections."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Phone & Email Channels */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Mail className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Communication Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Primary Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={contact.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+251 910 256 686"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Alternate Phone Number
              </label>
              <input
                type="text"
                value={contact.secondary_phone || ''}
                onChange={(e) => handleChange('secondary_phone', e.target.value)}
                placeholder="+251 911 000 000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Primary Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="civiljob12@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Inquiry Form Recipient Email
              </label>
              <input
                type="email"
                value={contact.inquiry_recipient || ''}
                onChange={(e) => handleChange('inquiry_recipient', e.target.value)}
                placeholder="inquiries@jobaleengineering.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
              <p className="text-[11px] text-surface-steel/50 mt-1">
                Where website inquiries are routed internally.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Physical Location & Hours */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <MapPin className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Office Location & Hours
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Physical Office Address
              </label>
              <input
                type="text"
                value={contact.office_address || ''}
                onChange={(e) => handleChange('office_address', e.target.value)}
                placeholder="Adama City, Oromia, Ethiopia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">City</label>
              <input
                type="text"
                value={contact.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Adama"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">Region</label>
              <input
                type="text"
                value={contact.region || ''}
                onChange={(e) => handleChange('region', e.target.value)}
                placeholder="Oromia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">Country</label>
              <input
                type="text"
                value={contact.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Ethiopia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Business Hours
              </label>
              <input
                type="text"
                value={contact.business_hours || ''}
                onChange={(e) => handleChange('business_hours', e.target.value)}
                placeholder="Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 8:00 AM – 12:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Google Map URL or Embed Link
              </label>
              <input
                type="text"
                value={contact.map_url || contact.map_embed_url || ''}
                onChange={(e) => {
                  handleChange('map_url', e.target.value);
                  handleChange('map_embed_url', e.target.value);
                }}
                placeholder="https://maps.google.com/?q=Adama,Ethiopia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Received Website Inquiries Log */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Inbox className="w-5 h-5 text-brand-blue-light" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Received Website Inquiries ({inquiries.length})
              </h3>
            </div>
            <span className="text-xs text-surface-steel/60">
              Live submissions from contact form
            </span>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-steel/60 border border-dashed border-white/10 rounded-xl">
              <Inbox className="w-8 h-8 mx-auto text-surface-steel/30 mb-2" />
              <p className="font-semibold text-white">No inquiries received yet</p>
              <p className="text-[11px] text-surface-steel/50 mt-1">
                Submissions from the public contact page will be logged here in real-time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111E] text-surface-steel/60 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Service Interest</th>
                    <th className="py-2.5 px-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-mono text-surface-steel/60 shrink-0">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {inq.full_name}
                      </td>
                      <td className="py-3 px-3 text-surface-steel/80">
                        <div>{inq.email}</div>
                        <div className="text-[10px] text-surface-steel/50 font-mono">{inq.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-brand-blue-light font-medium">
                        {inq.service || 'General'}
                      </td>
                      <td className="py-3 px-3 text-surface-steel/80 max-w-xs break-words">
                        {inq.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Publish Bar */}
      <PublishBar
        hasDraft={envelope?.has_draft}
        publishedAt={envelope?.published_at}
        updatedAt={envelope?.updated_at}
        isDirty={isDirty}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
        isDiscarding={isDiscarding}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscardDraft={envelope?.has_draft ? handleDiscardDraft : undefined}
      />
    </div>
  );
}
