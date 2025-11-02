import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  contact_email: string;
  contact_phone: string;
  contact_hours: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    contact_email: "support@lazone.app",
    contact_phone: "+225 07 00 00 00 00",
    contact_hours: "Du lundi au vendredi, 9h-18h"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["contact_email", "contact_phone", "contact_hours"]);

        if (data && !error) {
          const newSettings: any = {};
          data.forEach(item => {
            if (item.setting_key === "contact_email") newSettings.contact_email = item.setting_value;
            if (item.setting_key === "contact_phone") newSettings.contact_phone = item.setting_value;
            if (item.setting_key === "contact_hours") newSettings.contact_hours = item.setting_value;
          });
          setSettings(prev => ({ ...prev, ...newSettings }));
        }
      } catch (error) {
        console.error("Error loading site settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
};
