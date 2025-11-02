import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqCategories = [
    {
      title: "Compte et Connexion",
      questions: [
        {
          q: "Comment créer un compte sur LaZone ?",
          a: "Cliquez sur 'Se connecter' en haut de la page, puis sur 'Créer un compte'. Renseignez votre email, mot de passe, nom et prénom. Vous recevrez un email de confirmation."
        },
        {
          q: "J'ai oublié mon mot de passe, que faire ?",
          a: "Cliquez sur 'Mot de passe oublié ?' sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe."
        },
        {
          q: "Comment modifier mes informations personnelles ?",
          a: "Allez dans 'Profil' puis 'Paramètres'. Vous pouvez modifier votre nom, photo de profil, numéro de téléphone et autres informations."
        },
        {
          q: "Comment supprimer mon compte ?",
          a: "Dans Paramètres, descendez jusqu'à la section 'Zone Dangereuse' et cliquez sur 'Supprimer mon compte'. Consultez notre politique de suppression de données pour plus d'informations."
        }
      ]
    },
    {
      title: "Annonces Immobilières",
      questions: [
        {
          q: "Comment publier une annonce ?",
          a: "Cliquez sur 'Ajouter une annonce' dans le menu. Renseignez les détails de votre bien (type, prix, localisation, description) et ajoutez des photos. Votre annonce sera publiée après validation."
        },
        {
          q: "Combien d'annonces puis-je publier ?",
          a: "Les utilisateurs gratuits peuvent publier jusqu'à 5 annonces actives. Pour publier plus d'annonces, vous devez souscrire à un abonnement premium."
        },
        {
          q: "Comment modifier ou supprimer une annonce ?",
          a: "Allez dans 'Mon profil' puis 'Mes annonces'. Cliquez sur l'annonce à modifier, puis sur l'icône d'édition ou de suppression."
        },
        {
          q: "Mes photos ne s'affichent pas, pourquoi ?",
          a: "Vérifiez que vos images sont au format JPG ou PNG et ne dépassent pas 5 Mo chacune. Si le problème persiste, contactez le support."
        }
      ]
    },
    {
      title: "Recherche et Navigation",
      questions: [
        {
          q: "Comment rechercher un bien spécifique ?",
          a: "Utilisez la barre de recherche sur la page d'accueil. Vous pouvez filtrer par type de bien, ville, prix, nombre de chambres, etc."
        },
        {
          q: "Comment sauvegarder mes annonces préférées ?",
          a: "Cliquez sur l'icône cœur sur chaque annonce. Retrouvez tous vos favoris dans 'Mes Favoris'."
        },
        {
          q: "Comment contacter un vendeur ?",
          a: "Sur la page de l'annonce, cliquez sur 'Contacter le vendeur'. Vous pouvez envoyer un message via la messagerie interne ou appeler directement."
        }
      ]
    },
    {
      title: "Sponsoring et Paiements",
      questions: [
        {
          q: "Qu'est-ce que le sponsoring d'annonce ?",
          a: "Le sponsoring permet de mettre en avant votre annonce en première page pendant une durée déterminée (3, 7, 15 ou 30 jours), augmentant ainsi sa visibilité."
        },
        {
          q: "Combien coûte le sponsoring ?",
          a: "Les tarifs commencent à 15$ pour 3 jours. Consultez la page 'Sponsoring' pour voir tous les forfaits disponibles."
        },
        {
          q: "Quels modes de paiement acceptez-vous ?",
          a: "Nous acceptons les paiements par Mobile Money (Orange Money, MTN Money, Moov Money) et CinetPay pour plus de flexibilité."
        },
        {
          q: "Puis-je obtenir un remboursement ?",
          a: "Les sponsorings ne sont pas remboursables une fois activés. Cependant, si vous rencontrez un problème technique, contactez notre support."
        }
      ]
    },
    {
      title: "Sécurité et Confidentialité",
      questions: [
        {
          q: "Mes données sont-elles sécurisées ?",
          a: "Oui, nous utilisons le chiffrement SSL/TLS et des mesures de sécurité strictes pour protéger vos données. Consultez notre politique de confidentialité pour plus de détails."
        },
        {
          q: "Comment signaler une annonce suspecte ?",
          a: "Sur chaque annonce, cliquez sur '...' puis 'Signaler'. Décrivez le problème et notre équipe examinera le signalement dans les 24h."
        },
        {
          q: "Que faites-vous de mes données si je supprime mon compte ?",
          a: "Après 30 jours, toutes vos données personnelles sont définitivement supprimées. Consultez notre politique de suppression de données pour tous les détails."
        }
      ]
    },
    {
      title: "Problèmes Techniques",
      questions: [
        {
          q: "L'application ne se charge pas correctement",
          a: "Essayez de vider le cache de votre navigateur ou de rafraîchir la page (Ctrl+F5). Si le problème persiste, contactez le support technique."
        },
        {
          q: "Je ne reçois pas les notifications",
          a: "Vérifiez que vous avez autorisé les notifications dans les paramètres de votre navigateur ou de votre téléphone. Allez dans Paramètres > Notifications pour activer/désactiver les alertes."
        },
        {
          q: "L'application est lente",
          a: "Cela peut être dû à une connexion internet faible. Essayez de redémarrer votre appareil ou de vous connecter à un réseau plus stable."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <HelpCircle className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Foire Aux Questions (FAQ)</h1>
            <p className="text-muted-foreground text-lg">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>

          {/* Search (future feature) */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une question..."
                className="pl-10"
              />
            </div>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {faqCategories.map((category, idx) => (
              <Card key={idx} className="p-6">
                <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-muted-foreground">
                Notre équipe de support est là pour vous aider
              </p>
              <Link to="/contact">
                <Button size="lg" className="mt-4">
                  Contacter le Support
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
