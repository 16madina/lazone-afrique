import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountry } from '@/contexts/CountryContext';
import { ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Mapping des codes pays aux indicatifs téléphoniques
const countryPhoneCodes: Record<string, string> = {
  'ci': '+225',
  'gn': '+224', 
  'sn': '+221',
  'ma': '+212',
  'ng': '+234',
  'gh': '+233',
  'ke': '+254',
  'za': '+27',
  'tn': '+216',
  'eg': '+20',
  'cm': '+237',
  'rw': '+250',
  'et': '+251',
  'tz': '+255',
  'ug': '+256',
  'dz': '+213',
  'ly': '+218',
  'ml': '+223',
  'bf': '+226',
  'ne': '+227',
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  id?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "XX XX XX XX XX",
  label = "Numéro de téléphone",
  required = false,
  id = "phone-input"
}) => {
  const { countries, selectedCountry } = useCountry();
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(selectedCountry);
  const [open, setOpen] = useState(false);

  const phoneCode = countryPhoneCodes[selectedPhoneCountry.code] || '+225';

  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedPhoneCountry(country);
      setOpen(false);
      // Clear the phone number when changing country
      onChange('');
    }
  };

  const handlePhoneChange = (phoneValue: string) => {
    // Remove any non-numeric characters except spaces and hyphens
    const cleanPhone = phoneValue.replace(/[^\d\s\-]/g, '');
    const fullPhone = `${phoneCode} ${cleanPhone}`.trim();
    onChange(fullPhone);
  };

  // Extract just the number part (without country code) for display
  const displayPhone = value.startsWith(phoneCode) 
    ? value.slice(phoneCode.length).trim() 
    : value;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <div className="flex">
        {/* Desktop Country Selector */}
        <div className="hidden md:block">
          <Select 
            value={selectedPhoneCountry.code} 
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger className="w-[140px] rounded-r-none border-r-0">
              <div className="flex items-center gap-2">
                <span>{selectedPhoneCountry.flag}</span>
                <span className="text-sm font-mono">{phoneCode}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => {
                const code = countryPhoneCodes[country.code] || '+225';
                return (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2 w-full">
                      <span>{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">{code}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Country Selector */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-1 rounded-r-none border-r-0 px-3"
            >
              <span>{selectedPhoneCountry.flag}</span>
              <span className="text-xs font-mono">{phoneCode}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Sélectionner un pays</SheetTitle>
              <SheetDescription>
                Choisissez votre pays pour l'indicatif téléphonique
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid grid-cols-1 gap-2 mt-6 max-h-[40vh] overflow-y-auto">
              {countries.map((country) => {
                const code = countryPhoneCodes[country.code] || '+225';
                return (
                  <Button
                    key={country.code}
                    variant={selectedPhoneCountry.code === country.code ? "default" : "outline"}
                    onClick={() => handleCountrySelect(country.code)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-medium">{country.name}</span>
                        <span className="text-sm text-muted-foreground font-mono">{code}</span>
                      </div>
                      {selectedPhoneCountry.code === country.code && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        {/* Phone Number Input */}
        <Input
          id={id}
          type="tel"
          placeholder={placeholder}
          value={displayPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="rounded-l-none"
          required={required}
        />
      </div>
    </div>
  );
};

export default PhoneInput;