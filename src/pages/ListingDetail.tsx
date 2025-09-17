import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { useCountry } from "@/contexts/CountryContext";
import { ArrowLeft, MapPin, Calendar, Phone, MessageCircle, Play, Send, X } from "lucide-react";
import { toast } from "sonner";

interface ListingData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  lat: number;
  lng: number;
  image: string | null;
  photos: string[] | null;
  video_url: string | null;
  city: string;
  country_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  transaction_type: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_area: number | null;
  floor_number: string | null;
  land_type: string | null;
  land_shape: string | null;
  property_documents: string[] | null;
  features: string[] | null;
  is_negotiable: boolean | null;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { formatPrice: formatPriceWithCurrency } = useCountry();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { createConversation, sendMessage } = useRealTimeMessages();

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Vous devez vous connecter pour voir les détails d'une annonce");
      navigate('/auth');
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("Annonce non trouvée");
          return;
        }

        setListing(data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError("Erreur lors du chargement de l'annonce");
        toast.error("Impossible de charger l'annonce");
      } finally {
        setLoading(false);
      }
    };

    if (user || !authLoading) {
      fetchListing();
    }
  }, [id, user, authLoading]);

  const formatPrice = (price: number) => {
    // Le prix en base est en USD, on le convertit en devise locale
    return formatPriceWithCurrency ? formatPriceWithCurrency(price) : new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAllImages = () => {
    const images: string[] = [];
    if (listing?.photos && Array.isArray(listing.photos)) {
      images.push(...listing.photos);
    }
    if (listing?.image) {
      images.push(listing.image);
    }
    return images.length > 0 ? images : ['https://via.placeholder.com/800x400?text=Pas+d%27image'];
  };


  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'CI': 'Côte d\'Ivoire',
      'SN': 'Sénégal',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'MA': 'Maroc',
      'TN': 'Tunisie',
      'DZ': 'Algérie',
      'KE': 'Kenya',
      'ZA': 'Afrique du Sud'
    };
    return countries[countryCode] || countryCode;
  };

  const handleSendMessage = async () => {
    console.log('🎯 Starting handleSendMessage');
    console.log('📋 Current state:', { 
      messageContent: messageContent.trim(), 
      listingUserId: listing?.user_id, 
      currentUser: user?.id,
      listingId: listing?.id 
    });
    
    if (!messageContent.trim() || !listing?.user_id || !user) {
      console.error('❌ Missing required data for message sending');
      toast.error("Impossible d'envoyer le message");
      return;
    }

    setSendingMessage(true);
    try {
      console.log('🏗️ Creating conversation with seller...');
      // Créer une conversation avec le vendeur
      const conversationId = await createConversation(
        [listing.user_id], 
        listing.id, 
        `À propos de: ${listing.title}`
      );

      console.log('💬 Conversation created, ID:', conversationId);

      if (conversationId) {
        console.log('📤 Sending message...');
        // Envoyer le message
        await sendMessage(conversationId, messageContent);
        console.log('✅ Message sent successfully');
        toast.success("Message envoyé avec succès!");
        setMessageContent('');
        setMessageDialogOpen(false);
        
        // Rediriger vers la page des messages
        console.log('🔄 Redirecting to messages page');
        navigate('/messages');
      } else {
        console.error('❌ Conversation creation failed - no ID returned');
        toast.error("Impossible de créer la conversation");
      }
    } catch (error) {
      console.error('💥 Error in handleSendMessage:', error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSendingMessage(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the useEffect redirect
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Annonce non trouvée</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  onClick={() => navigate(-1)}
                  className="mt-4"
                >
                  Retour
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          {/* Galerie d'images */}
          <Card className="overflow-hidden">
            <div className="relative">
              {(() => {
                const images = getAllImages();
                
                return (
                  <>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((imgSrc, index) => (
                          <CarouselItem key={index}>
                            <div className="relative">
                              <img 
                                src={imgSrc} 
                                alt={`${listing.title} - Image ${index + 1}`}
                                className="w-full h-64 md:h-96 object-cover cursor-pointer"
                                onClick={() => {
                                  setCurrentImageIndex(index);
                                  setGalleryOpen(true);
                                }}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    {/* Miniatures sous l'image principale */}
                    {images.length > 1 && (
                      <div className="flex gap-2 p-4 overflow-x-auto">
                        {images.slice(0, 3).map((imgSrc, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setGalleryOpen(true);
                            }}
                          >
                            <img 
                              src={imgSrc} 
                              alt={`Miniature ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        
                        {/* Bouton "voir plus" si plus de 3 images */}
                        {images.length > 3 && (
                          <div
                            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors relative bg-black/60"
                            onClick={() => setGalleryOpen(true)}
                          >
                            <img 
                              src={images[3]} 
                              alt="Voir plus"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                +{images.length - 3}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Badges et contrôles superposés */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-background/80">
                        {listing.status === 'published' ? 'Publié' : listing.status}
                      </Badge>
                    </div>
                    
                    {/* Bouton vidéo si disponible */}
                    {listing.video_url && (
                      <Button
                        variant="secondary"
                        className="absolute top-4 left-4 bg-background/80 hover:bg-background/90 z-10"
                        onClick={() => window.open(listing.video_url!, '_blank')}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Voir la vidéo
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </Card>

          {/* Dialog galerie plein écran */}
          <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
            <DialogContent className="max-w-full w-[100vw] h-[100vh] p-0 bg-background">
              <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-4 pb-2 bg-background/95 backdrop-blur-sm border-b">
                <DialogTitle className="text-center">Galerie photos - {listing.title}</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                  onClick={() => setGalleryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="w-full h-full pt-16 pb-20 flex items-center justify-center">
                <Carousel className="w-full h-full" setApi={(api) => {
                  if (api) {
                    api.scrollTo(currentImageIndex, false);
                  }
                }}>
                  <CarouselContent className="h-full">
                    {getAllImages().map((imgSrc, index) => (
                      <CarouselItem key={index} className="h-full">
                        <div className="h-full w-full flex items-center justify-center">
                          <img 
                            src={imgSrc} 
                            alt={`${listing.title} - Image ${index + 1}`}
                            className="w-full h-full object-contain"
                            style={{ maxHeight: '100%', maxWidth: '100%' }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <CarouselPrevious className="bg-background/80 hover:bg-background border shadow-lg" />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    <CarouselNext className="bg-background/80 hover:bg-background border shadow-lg" />
                  </div>
                </Carousel>
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t">
                <div className="flex justify-center gap-2 p-4 overflow-x-auto">
                  {getAllImages().map((imgSrc, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden cursor-pointer border-2 transition-colors ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent hover:border-primary'
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        // Force carousel to navigate to selected image
                        const carouselApi = document.querySelector('[data-carousel-api]') as any;
                        if (carouselApi?.scrollTo) {
                          carouselApi.scrollTo(index, false);
                        }
                      }}
                    >
                      <img 
                        src={imgSrc} 
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Informations principales */}
          <Card>
            <CardContent className="p-8 space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.city}, {getCountryName(listing.country_code)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(listing.price)}
                </div>
                {listing.is_negotiable && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Prix négociable
                  </Badge>
                )}
              </div>

              {/* Badges de type */}
              <div className="flex flex-wrap gap-2">
                {listing.transaction_type && (
                  <Badge variant="secondary">
                    {listing.transaction_type === 'sale' ? 'Vente' : 
                     listing.transaction_type === 'rent' ? 'Location' : 
                     listing.transaction_type === 'commercial' ? 'Commercial' : listing.transaction_type}
                  </Badge>
                )}
                {listing.property_type && (
                  <Badge variant="outline">
                    {listing.property_type === 'apartment' ? 'Appartement' :
                     listing.property_type === 'house' ? 'Maison' :
                     listing.property_type === 'villa' ? 'Villa' :
                     listing.property_type === 'land' ? 'Terrain' :
                     listing.property_type === 'bureau' ? 'Bureau' :
                     listing.property_type === 'boutique' ? 'Boutique' :
                     listing.property_type === 'entrepot' ? 'Entrepôt' :
                     listing.property_type === 'local-commercial' ? 'Local commercial' :
                     listing.property_type}
                  </Badge>
                )}
              </div>

              {listing.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{listing.description}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Publié le {formatDate(listing.created_at)}</span>
                {listing.updated_at !== listing.created_at && (
                  <span className="ml-4">• Modifié le {formatDate(listing.updated_at)}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques du bien */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Caractéristiques du bien</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Surface */}
                {listing.surface_area && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{listing.surface_area}</div>
                    <div className="text-sm text-muted-foreground">m²</div>
                  </div>
                )}

                {/* Chambres/Pièces pour non-terrain */}
                {listing.bedrooms !== null && listing.property_type !== 'land' && listing.property_type !== 'terrain-commercial' && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{listing.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">
                      {listing.transaction_type === 'commercial' ? 'Pièces' : 'Chambres'}
                    </div>
                  </div>
                )}

                {/* Salles de bain/Sanitaires pour non-terrain */}
                {listing.bathrooms !== null && listing.property_type !== 'land' && listing.property_type !== 'terrain-commercial' && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{listing.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">
                      {listing.transaction_type === 'commercial' ? 'Sanitaires' : 'Salles de bain'}
                    </div>
                  </div>
                )}

                {/* Étage pour non-terrain */}
                {listing.floor_number && listing.property_type !== 'land' && listing.property_type !== 'terrain-commercial' && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">{listing.floor_number}</div>
                    <div className="text-sm text-muted-foreground">Étage</div>
                  </div>
                )}
              </div>

              {/* Informations spécifiques aux terrains */}
              {(listing.property_type === 'land' || listing.property_type === 'terrain-commercial') && (
                <div className="space-y-4 mb-6">
                  {listing.land_type && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Type de terrain</span>
                      <span className="text-muted-foreground capitalize">{listing.land_type}</span>
                    </div>
                  )}
                  {listing.land_shape && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Forme du terrain</span>
                      <span className="text-muted-foreground capitalize">{listing.land_shape}</span>
                    </div>
                  )}
                  
                  {/* Documents de propriété */}
                  {listing.property_documents && listing.property_documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Documents en possession</h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.property_documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            ✓ {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Caractéristiques/Commodités */}
              {listing.features && listing.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">
                    {listing.property_type === 'land' || listing.property_type === 'terrain-commercial' 
                      ? 'Caractéristiques du terrain' 
                      : 'Commodités'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Localisation</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{listing.city}, {getCountryName(listing.country_code)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Coordonnées: {listing.lat.toFixed(6)}, {listing.lng.toFixed(6)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions de contact */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Contacter le vendeur</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
                <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Contacter le vendeur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          À propos de: <span className="font-medium">{listing.title}</span>
                        </p>
                        <Textarea
                          placeholder="Bonjour, je suis intéressé(e) par votre annonce. Pouvez-vous me donner plus d'informations ?"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {messageContent.length}/500 caractères
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => setMessageDialogOpen(false)}
                          disabled={sendingMessage}
                        >
                          Annuler
                        </Button>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageContent.trim() || sendingMessage}
                        >
                          {sendingMessage ? (
                            "Envoi..."
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Contactez directement le vendeur pour plus d'informations ou pour organiser une visite.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ListingDetail;