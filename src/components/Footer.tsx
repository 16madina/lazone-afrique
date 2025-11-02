import { Link } from "react-router-dom";
import { Mail, Phone, Shield, HelpCircle, Trash2, FileText } from "lucide-react";
import lazoneTextLogo from "@/assets/lazone-text-logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <img 
              src={lazoneTextLogo} 
              alt="LaZone"
              className="h-12 object-contain"
            />
            <p className="text-sm text-muted-foreground">
              La plateforme de référence pour l'immobilier en Afrique. Trouvez votre chez-vous facilement.
            </p>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Légal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/data-deletion" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Trash2 className="w-3 h-3" />
                  Suppression de données
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <HelpCircle className="w-3 h-3" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Service client
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">
                  {settings.contact_email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                  {settings.contact_phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LaZone. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
