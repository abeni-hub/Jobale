import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { HomeContent } from '@/lib/types';
import { company, stats as defaultStats } from '@/data/company';
import { services as defaultServices } from '@/data/services';
import { projects as defaultProjects, projectCategories as defaultCategories } from '@/data/projects';

interface CmsContextType {
  data: HomeContent | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // Fallback-safe selectors
  companyName: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<HomeContent>('/homepage/');
      if (res && res.site_settings) {
        setData(res);
      }
    } catch (err: unknown) {
      // Non-fatal: website continues seamlessly with fallback data
      const message = (err as Error)?.message || 'Failed to load CMS content';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const companyName = data?.site_settings?.company_name || company.name;
  const slogan = data?.site_settings?.slogan || company.slogan;
  const phone = data?.contact?.phone || data?.site_settings?.social_facebook ? (data?.contact?.phone || company.phone) : company.phone;
  const email = data?.contact?.email || company.email;
  const address = data?.contact?.office_address || `${company.city}, ${company.region}, ${company.country}`;
  const city = data?.contact?.city || company.city;
  const region = data?.contact?.region || company.region;
  const country = data?.contact?.country || company.country;

  return (
    <CmsContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchHomeData,
        companyName,
        slogan,
        phone,
        email,
        address,
        city,
        region,
        country,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};

// Re-export static defaults for direct fallback use
export { defaultServices, defaultProjects, defaultCategories, defaultStats };
