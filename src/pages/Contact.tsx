import { useState, type FormEvent } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { company } from '@/data/company';
import { services as defaultServices } from '@/data/services';
import { api } from '@/lib/api';
import { useCms } from '@/context/CmsContext';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  full_name: string;
  organization: string;
  email: string;
  phone: string;
  service_required: string;
  project_location: string;
  estimated_budget: string;
  project_description: string;
  consent: boolean;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  service_required?: string;
  project_description?: string;
  consent?: string;
}

const initialFormData: FormData = {
  full_name: '',
  organization: '',
  email: '',
  phone: '',
  service_required: '',
  project_location: '',
  estimated_budget: '',
  project_description: '',
  consent: false,
};

export default function Contact() {
  const { data, companyName, phone, email, address, city, region, country } = useCms();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>('idle');
  const [inquiryReference, setInquiryReference] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  const servicesList = (data?.services && data.services.length > 0)
    ? data.services
    : defaultServices;

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!formData.full_name.trim()) e.full_name = 'Please enter your full name.';
    if (!formData.email.trim()) {
      e.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) e.phone = 'Please enter your phone number.';
    if (!formData.service_required) e.service_required = 'Please select a service.';
    if (!formData.project_description.trim()) e.project_description = 'Please describe your project.';
    if (!formData.consent) e.consent = 'Please accept the privacy notice to continue.';
    return e;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFormState('submitting');
    setSubmitError('');

    try {
      const response = await api.post<{ detail?: string; reference?: string }>('/contact/inquiries/', {
        full_name: formData.full_name.trim(),
        organization: formData.organization.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service_required: formData.service_required,
        project_location: formData.project_location.trim() || undefined,
        estimated_budget: formData.estimated_budget.trim() || undefined,
        project_description: formData.project_description.trim(),
        consent: formData.consent,
      });

      if (response && response.reference) {
        setInquiryReference(response.reference);
      }
      setFormState('success');
      setFormData(initialFormData);
    } catch (err: unknown) {
      console.error('Contact form submission error:', err);
      const msg = (err as Error)?.message || "We couldn't submit your inquiry at this time.";
      setSubmitError(msg);
      setFormState('error');
    }
  }

  const inputBase =
    'w-full px-4 py-3 rounded-lg border bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 transition-all text-sm';
  const inputNormal = 'border-surface-steel focus:ring-brand-blue focus:border-transparent';
  const inputError = 'border-red-400 focus:ring-red-400 focus:border-transparent';

  return (
    <>
      <SEO
        title={`Contact Us | ${companyName}`}
        description={`Contact ${companyName} in ${city}, ${country}. Call ${phone} or email ${email} to discuss your construction or civil engineering project.`}
      />

      <PageHeader
        label={data?.contact?.heading ? "Get in Touch" : "Get in Touch"}
        title={data?.contact?.heading || "Contact Our Team"}
        description={data?.contact?.description || "Have a construction or civil engineering project in mind? Speak with our team about your requirements, site conditions, and timeline."}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="py-20 lg:py-24 bg-white">
        <div className="container-page">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Contact info */}
            <div className="lg:col-span-2">
              <p className="section-label mb-4">Contact Information</p>
              <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-brand-navy mb-6">
                Reach Us Directly
              </h2>
              <p className="text-ink leading-relaxed mb-8">
                We're based in {city || company.city}, {region || company.region}, {country || company.country}. Contact us by phone or email, or submit the inquiry form and our engineering team will get back to you promptly.
              </p>

              <div className="space-y-5">
                <a
                  href={`tel:${(phone || company.phone).replace(/\s/g, '')}`}
                  className="flex items-start gap-4 p-5 rounded-xl bg-surface-offwhite hover:shadow-card transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-semibold uppercase tracking-wider text-ink-light">Telephone</p>
                    <p className="text-sm font-medium text-brand-navy group-hover:text-brand-blue transition-colors mt-1">{phone || company.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${email || company.email}`}
                  className="flex items-start gap-4 p-5 rounded-xl bg-surface-offwhite hover:shadow-card transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-semibold uppercase tracking-wider text-ink-light">Email</p>
                    <p className="text-sm font-medium text-brand-navy group-hover:text-brand-blue transition-colors mt-1">{email || company.email}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-offwhite">
                  <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-semibold uppercase tracking-wider text-ink-light">Location</p>
                    <p className="text-sm font-medium text-brand-navy mt-1">{address || `${company.city}, ${company.region}, ${company.country}`}</p>
                  </div>
                </div>

                {company.website && (
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-offwhite">
                    <div className="w-11 h-11 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-heading font-semibold uppercase tracking-wider text-ink-light">Website</p>
                      <p className="text-sm font-medium text-brand-navy mt-1">{company.website}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map embed if provided */}
              {data?.contact?.map_embed_url && (
                <div className="mt-8 rounded-xl overflow-hidden border border-surface-steel/60 h-64">
                  <iframe
                    src={data.contact.map_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location Map"
                  />
                </div>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="p-6 lg:p-8 rounded-2xl bg-surface-offwhite border border-surface-steel/60">
                <h2 className="text-xl lg:text-2xl font-heading font-extrabold text-brand-navy mb-2">
                  Project Inquiry Form
                </h2>
                <p className="text-sm text-ink-light mb-6">
                  {data?.contact?.form_note || 'Fill in the form below with your project details. Required fields are marked with an asterisk.'}
                </p>

                {/* Success state */}
                {formState === 'success' && (
                  <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-bold text-brand-navy mb-2">
                      Inquiry Submitted Successfully
                    </h3>
                    {inquiryReference && (
                      <p className="inline-block px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-mono font-semibold mb-3">
                        Reference: {inquiryReference}
                      </p>
                    )}
                    <p className="text-sm text-ink leading-relaxed">
                      Thank you for your inquiry. Our engineering team will review your project details and contact you shortly. For urgent matters, please call us directly at {phone || company.phone}.
                    </p>
                    <button
                      onClick={() => {
                        setFormState('idle');
                        setInquiryReference('');
                      }}
                      className="mt-6 btn-outline"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                )}

                {/* Error state */}
                {formState === 'error' && (
                  <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-bold text-brand-navy mb-2">
                      Submission Failed
                    </h3>
                    <p className="text-sm text-ink leading-relaxed mb-4">
                      {submitError || "We couldn't submit your inquiry at this time. Please try again, or contact us directly by phone or email."}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button onClick={() => setFormState('idle')} className="btn-primary">
                        Try Again
                      </button>
                      <a href={`mailto:${email || company.email}`} className="btn-outline">
                        Email Us Instead
                      </a>
                    </div>
                  </div>
                )}

                {/* Form */}
                {formState !== 'success' && (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className={`${inputBase} ${errors.full_name ? inputError : inputNormal}`}
                          placeholder="Your full name"
                          aria-invalid={!!errors.full_name}
                          aria-describedby={errors.full_name ? 'full_name-error' : undefined}
                        />
                        {errors.full_name && (
                          <p id="full_name-error" className="mt-1.5 text-xs text-red-500">{errors.full_name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="organization" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          className={`${inputBase} ${inputNormal}`}
                          placeholder="Company or institution (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <p id="email-error" className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                          placeholder="+251 ..."
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        {errors.phone && (
                          <p id="phone-error" className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="service_required" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Service Required *
                        </label>
                        <select
                          id="service_required"
                          name="service_required"
                          value={formData.service_required}
                          onChange={handleChange}
                          className={`${inputBase} ${errors.service_required ? inputError : inputNormal}`}
                          aria-invalid={!!errors.service_required}
                          aria-describedby={errors.service_required ? 'service-error' : undefined}
                        >
                          <option value="">Select a service...</option>
                          {servicesList.map((s) => (
                            <option key={s.slug} value={s.title}>{s.title}</option>
                          ))}
                          <option value="Other">Other / Not sure yet</option>
                        </select>
                        {errors.service_required && (
                          <p id="service-error" className="mt-1.5 text-xs text-red-500">{errors.service_required}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="project_location" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                          Project Location
                        </label>
                        <input
                          type="text"
                          id="project_location"
                          name="project_location"
                          value={formData.project_location}
                          onChange={handleChange}
                          className={`${inputBase} ${inputNormal}`}
                          placeholder="City or region (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="estimated_budget" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                        Estimated Budget
                      </label>
                      <input
                        type="text"
                        id="estimated_budget"
                        name="estimated_budget"
                        value={formData.estimated_budget}
                        onChange={handleChange}
                        className={`${inputBase} ${inputNormal}`}
                        placeholder="Budget range (optional)"
                      />
                    </div>

                    <div>
                      <label htmlFor="project_description" className="block text-sm font-heading font-semibold text-brand-navy mb-2">
                        Project Description *
                      </label>
                      <textarea
                        id="project_description"
                        name="project_description"
                        value={formData.project_description}
                        onChange={handleChange}
                        rows={5}
                        className={`${inputBase} ${errors.project_description ? inputError : inputNormal} resize-y`}
                        placeholder="Tell us about your project — scope, timeline, site conditions, and any specific requirements."
                        aria-invalid={!!errors.project_description}
                        aria-describedby={errors.project_description ? 'description-error' : undefined}
                      />
                      {errors.project_description && (
                        <p id="description-error" className="mt-1.5 text-xs text-red-500">{errors.project_description}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleChange}
                          className="mt-1 w-4 h-4 rounded border-surface-steel text-brand-blue focus:ring-brand-blue"
                          aria-invalid={!!errors.consent}
                          aria-describedby={errors.consent ? 'consent-error' : undefined}
                        />
                        <span className="text-sm text-ink leading-relaxed">
                          I consent to Jobale Engineering PLC collecting and using the information provided in this form to respond to my inquiry, in accordance with the applicable privacy notice.
                        </span>
                      </label>
                      {errors.consent && (
                        <p id="consent-error" className="mt-1.5 text-xs text-red-500">{errors.consent}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formState === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
