import { useState, useRef } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, MapPin, Home, DollarSign, FileText, Image, Plus, X, Video, Upload } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AddProperty = () => {
  const navigate = useNavigate();
  const { selectedCountry } = useCountry();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Form states
  const [transactionType, setTransactionType] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: "",
    title: "",
    description: "",
    price: "",
    city: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    floorNumber: "",
    landType: "",
    landShape: "",
    fullName: "",
    email: "",
    phone: "",
    whatsapp: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { 
    uploadedPhotos, 
    uploadedVideo, 
    uploading, 
    uploadPhoto, 
    uploadVideo, 
    removePhoto, 
    removeVideo 
  } = useMediaUpload();

  const steps = [
    { number: 1, title: "Type de bien", icon: Home },
    { number: 2, title: "Détails", icon: FileText },
    { number: 3, title: "Prix & Contact", icon: DollarSign },
    { number: 4, title: "Photos", icon: Image }
  ];

  const features = [
    "Piscine", "Garage", "Jardin", "Climatisation", "Sécurité 24h",
    "Balcon", "Terrasse", "Cave", "Ascenseur", "Parking",
    "Internet", "Meublé", "Eau chaude", "Générateur"
  ];

  // Property documents options
  const propertyDocuments = [
    "ACD (Arrêté de Concession Définitive)",
    "Titre Foncier",
    "Attestation Villageoise", 
    "Certificat de Propriété",
    "Acte de Vente",
    "Contrat de Bail",
    "Autorisation de Construire",
    "Plan Cadastral"
  ];

  // Land-specific features
  const landFeatures = [
    "Accès à l'eau", "Électricité disponible", "Route bitumée", 
    "Proximité transports", "Zone résidentielle", "Zone commerciale",
    "Terrain plat", "Terrain en pente", "Clôturé", "Sécurisé"
  ];

  // Commercial-specific features  
  const commercialFeatures = [
    "Parking client", "Vitrine", "Climatisation", "Sécurité 24h",
    "Accès PMR", "Enseigne autorisée", "Zone passante", "Internet haut débit",
    "Sanitaires", "Stockage", "Loading dock", "Système d'alarme"
  ];

  // Property type options based on transaction type
  const getPropertyTypeOptions = () => {
    if (transactionType === "commercial") {
      return [
        { value: "bureau", label: "Bureau" },
        { value: "boutique", label: "Boutique" },
        { value: "entrepot", label: "Entrepôt" },
        { value: "local-commercial", label: "Local commercial" },
        { value: "restaurant", label: "Restaurant" },
        { value: "hotel", label: "Hôtel" },
        { value: "usine", label: "Usine" },
        { value: "terrain-commercial", label: "Terrain commercial" }
      ];
    } else {
      return [
        { value: "apartment", label: "Appartement" },
        { value: "house", label: "Maison" },
        { value: "villa", label: "Villa" },
        { value: "land", label: "Terrain" },
        { value: "studio", label: "Studio" }
      ];
    }
  };

  // Get appropriate features based on property type
  const getFeaturesList = () => {
    if (formData.propertyType === "land" || formData.propertyType === "terrain-commercial") {
      return landFeatures;
    } else if (transactionType === "commercial") {
      return commercialFeatures;
    } else {
      return features;
    }
  };

  // Check if property type is terrain
  const isLandProperty = () => {
    return formData.propertyType === "land" || formData.propertyType === "terrain-commercial";
  };

  const toggleDocument = (document: string) => {
    setSelectedDocuments(prev =>
      prev.includes(document)
        ? prev.filter(d => d !== document)
        : [...prev, document]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        uploadPhoto(file);
      });
    }
    // Reset input
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadVideo(file);
    }
    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour publier une annonce");
      return;
    }

    if (!formData.title || !formData.price || !formData.city || !transactionType || !formData.propertyType) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrls = uploadedPhotos.map(photo => photo.url);
      const videoUrl = uploadedVideo?.url || null;

      // Get real coordinates for the city using geocoding
      console.log(`Geocoding city: ${formData.city}, ${selectedCountry.code}`);
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-city', {
        body: {
          city: formData.city,
          countryCode: selectedCountry.code
        }
      });

      let coordinates = { lat: 5.3364, lng: -4.0267 }; // Fallback to Abidjan
      
      if (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        toast.error("Impossible de géolocaliser la ville, coordonnées par défaut utilisées");
      } else if (geocodeData) {
        coordinates = { lat: geocodeData.lat, lng: geocodeData.lng };
        if (!geocodeData.foundExact) {
          toast.error("Ville non trouvée, coordonnées approximatives utilisées");
        }
        console.log(`Coordinates found: ${coordinates.lat}, ${coordinates.lng}`);
      }

      // Prepare data for insertion
      const insertData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        city: formData.city,
        country_code: selectedCountry.code.toUpperCase(),
        user_id: user.id,
        lat: coordinates.lat,
        lng: coordinates.lng,
        photos: photoUrls,
        video_url: videoUrl,
        status: 'published',
        transaction_type: transactionType,
        property_type: formData.propertyType,
        surface_area: formData.area ? parseFloat(formData.area) : null,
        features: selectedFeatures,
        is_negotiable: isNegotiable
      };

      // Add property-type specific fields
      if (!isLandProperty()) {
        if (formData.bedrooms) insertData.bedrooms = parseInt(formData.bedrooms);
        if (formData.bathrooms) insertData.bathrooms = parseInt(formData.bathrooms);
        if (formData.floorNumber) insertData.floor_number = formData.floorNumber;
      }

      // Add land-specific fields
      if (isLandProperty()) {
        if (formData.landType) insertData.land_type = formData.landType;
        if (formData.landShape) insertData.land_shape = formData.landShape;
        if (selectedDocuments.length > 0) insertData.property_documents = selectedDocuments;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert(insertData);

      if (error) throw error;

      toast.success("Annonce publiée avec succès!");
      navigate("/");
    } catch (error) {
      console.error("Error publishing listing:", error);
      toast.error("Erreur lors de la publication de l'annonce");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 animate-fade-in">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div key={step.number} className="flex flex-col items-center relative">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-primary text-primary-foreground shadow-warm animate-scale-in' 
                      : isCompleted 
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`
                    text-xs mt-2 text-center max-w-[80px] font-medium
                    ${isActive ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {step.title}
                  </span>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute top-6 left-12 w-16 md:w-20 h-0.5 transition-colors duration-300
                      ${isCompleted ? 'bg-accent' : 'bg-border'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              Étape {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Property Type */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de transaction</Label>
                    <Select value={transactionType} onValueChange={(value) => {
                      setTransactionType(value);
                      // Reset property type when transaction type changes
                      updateFormData('propertyType', "");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="sale">Vente</SelectItem>
                        <SelectItem value="rent">Location</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de bien</Label>
                    <Select 
                      value={formData.propertyType} 
                      onValueChange={(value) => updateFormData('propertyType', value)}
                      disabled={!transactionType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={transactionType ? "Choisir..." : "Sélectionnez d'abord le type de transaction"} />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {getPropertyTypeOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre de l'annonce</Label>
                  <Input 
                    placeholder="ex: Belle villa moderne avec piscine" 
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Localisation</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input 
                        placeholder="Ville ou commune" 
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Conditional fields based on property type */}
                {!isLandProperty() && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{transactionType === "commercial" ? "Pièces/Espaces" : "Chambres"}</Label>
                      <Select 
                        value={formData.bedrooms} 
                        onValueChange={(value) => updateFormData('bedrooms', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={transactionType === "commercial" ? "Nombre" : "0"} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {transactionType === "commercial" ? (
                            <>
                              <SelectItem value="1">1 pièce</SelectItem>
                              <SelectItem value="2">2 pièces</SelectItem>
                              <SelectItem value="3">3 pièces</SelectItem>
                              <SelectItem value="4">4 pièces</SelectItem>
                              <SelectItem value="5">5 pièces</SelectItem>
                              <SelectItem value="6">6+ pièces</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="0">Studio</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5+</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{transactionType === "commercial" ? "Sanitaires" : "Salles de bain"}</Label>
                      <Select 
                        value={formData.bathrooms} 
                        onValueChange={(value) => updateFormData('bathrooms', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Surface (m²)</Label>
                      <Input 
                        type="number" 
                        placeholder="120" 
                        value={formData.area}
                        onChange={(e) => updateFormData('area', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Étage</Label>
                      <Input 
                        placeholder="RDC"
                        value={formData.floorNumber}
                        onChange={(e) => updateFormData('floorNumber', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Land-specific fields */}
                {isLandProperty() && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Surface (m²)</Label>
                      <Input 
                        type="number" 
                        placeholder="ex: 500" 
                        value={formData.area}
                        onChange={(e) => updateFormData('area', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type de terrain</Label>
                      <Select 
                        value={formData.landType} 
                        onValueChange={(value) => updateFormData('landType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="residential">Résidentiel</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industriel</SelectItem>
                          <SelectItem value="agricultural">Agricole</SelectItem>
                          <SelectItem value="mixed">Mixte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Forme du terrain</Label>
                      <Select 
                        value={formData.landShape} 
                        onValueChange={(value) => updateFormData('landShape', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="square">Carré</SelectItem>
                          <SelectItem value="irregular">Irrégulier</SelectItem>
                          <SelectItem value="corner">D'angle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Documents section for land properties */}
                {isLandProperty() && (
                  <div className="space-y-3">
                    <Label>Documents en votre possession (sélection multiple possible)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {propertyDocuments.map(document => (
                        <Button
                          key={document}
                          variant={selectedDocuments.includes(document) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDocument(document)}
                          className="text-xs justify-start h-auto py-2 px-3"
                        >
                          {document}
                        </Button>
                      ))}
                    </div>
                    {selectedDocuments.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Documents sélectionnés : {selectedDocuments.length}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Label>
                    {isLandProperty() ? "Caractéristiques du terrain" : "Commodités"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getFeaturesList().map(feature => (
                      <Button
                        key={feature}
                        variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFeature(feature)}
                        className="text-xs"
                      >
                        {feature}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Décrivez votre bien en détail..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Price & Contact */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix</Label>
                    <div className="flex">
                      <Input 
                        type="number" 
                        placeholder="85000000" 
                        className="rounded-r-none" 
                        value={formData.price}
                        onChange={(e) => updateFormData('price', e.target.value)}
                      />
                      <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
                        FCFA
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Prix négociable</Label>
                    <Select 
                      value={isNegotiable ? "yes" : "no"} 
                      onValueChange={(value) => setIsNegotiable(value === "yes")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Informations de contact</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Nom complet</Label>
                       <Input 
                         placeholder="Votre nom" 
                         value={formData.fullName}
                         onChange={(e) => updateFormData('fullName', e.target.value)}
                       />
                     </div>

                     <div className="space-y-2">
                       <Label>Téléphone</Label>
                       <Input 
                         placeholder="+225 XX XX XX XX XX" 
                         value={formData.phone}
                         onChange={(e) => updateFormData('phone', e.target.value)}
                       />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="votre@email.com" 
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type d'agent</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Particulier</SelectItem>
                        <SelectItem value="agency">Agence immobilière</SelectItem>
                        <SelectItem value="broker">Courtier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos & Vidéo */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Ajoutez des photos et une vidéo</h4>
                  <p className="text-muted-foreground text-sm">
                    Ajoutez jusqu'à 20 photos et 1 vidéo pour valoriser votre bien
                  </p>
                </div>

                {/* Photos Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photos ({uploadedPhotos.length}/20)
                    </h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploading || uploadedPhotos.length >= 20}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter photos
                    </Button>
                  </div>
                  
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Upload Button */}
                    <div 
                      className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer group"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2" />
                      <span className="text-xs text-center text-muted-foreground group-hover:text-primary">
                        Ajouter<br />photo
                      </span>
                    </div>

                    {/* Uploaded Photos */}
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="aspect-square bg-muted rounded-lg relative group overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt="Property photo" 
                          className="w-full h-full object-cover" 
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {uploadedPhotos.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Aucune photo ajoutée</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Video Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Vidéo {uploadedVideo ? "(1/1)" : "(0/1)"}
                    </h5>
                    {!uploadedVideo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Ajouter vidéo
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />

                  {uploadedVideo ? (
                    <div className="aspect-video bg-muted rounded-lg relative group overflow-hidden">
                      <video 
                        src={uploadedVideo.url} 
                        className="w-full h-full object-cover" 
                        controls
                        preload="metadata"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                        onClick={removeVideo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer group"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="w-12 h-12 text-muted-foreground group-hover:text-primary mb-2" />
                      <span className="text-sm text-muted-foreground group-hover:text-primary">
                        Ajouter une vidéo
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        MP4, MOV, AVI (max 50MB)
                      </span>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Téléchargement en cours...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="bg-gradient-primary">
                  Suivant
                </Button>
               ) : (
                 <Button 
                   className="bg-gradient-primary" 
                   onClick={handleSubmit}
                   disabled={isSubmitting || uploading}
                 >
                   {isSubmitting ? "Publication..." : "Publier l'annonce"}
                 </Button>
               )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default AddProperty;