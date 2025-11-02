import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const { settings: contactInfo } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically send the contact form data to your backend
      // For now, we'll just show a success message
      
      console.log("Contact form submitted:", formData);
      
      toast.success("Message envoyé avec succès ! Nous vous répondrons dans les 24-48h.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <MessageSquare className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Service Client</h1>
            <p className="text-muted-foreground text-lg">
              Notre équipe est là pour vous aider. Contactez-nous pour toute question.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Envoyer un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      placeholder="Objet de votre demande"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre demande en détail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Pour toute question ou assistance :
                  </p>
                  <a href={`mailto:${contactInfo.contact_email}`} className="text-primary font-medium hover:underline">
                    {contactInfo.contact_email}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Téléphone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    {contactInfo.contact_hours}
                  </p>
                  <a href={`tel:${contactInfo.contact_phone.replace(/\s/g, '')}`} className="text-primary font-medium hover:underline">
                    {contactInfo.contact_phone}
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Temps de réponse</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Email :</strong> Réponse sous 24-48h</li>
                    <li>• <strong>Téléphone :</strong> Réponse immédiate pendant les heures d'ouverture</li>
                    <li>• <strong>Formulaire :</strong> Réponse sous 24-48h</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ressources utiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/faq" className="block text-primary hover:underline">
                    → Consulter la FAQ
                  </Link>
                  <Link to="/privacy-policy" className="block text-primary hover:underline">
                    → Politique de confidentialité
                  </Link>
                  <Link to="/data-deletion" className="block text-primary hover:underline">
                    → Suppression de données
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
