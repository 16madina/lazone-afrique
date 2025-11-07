import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const ModerationPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Politique de Modération</h1>
        </div>

        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Notre engagement : Réponse sous 24 heures
                </h2>
                <p className="text-blue-700 dark:text-blue-300">
                  Tous les signalements sont examinés et traités dans un délai maximum de 24 heures. 
                  Les contenus violant nos règles sont supprimés immédiatement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Types de contenus interdits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>LaZone Afrique interdit strictement les contenus suivants :</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-2xl">🚫</span>
                <div>
                  <h3 className="font-semibold">Contenu inapproprié</h3>
                  <p className="text-sm text-muted-foreground">
                    Nudité, violence, contenu sexuellement explicite, discours de haine
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold">Fraude et arnaques</h3>
                  <p className="text-sm text-muted-foreground">
                    Annonces frauduleuses, fausses informations, escroqueries financières
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-semibold">Spam</h3>
                  <p className="text-sm text-muted-foreground">
                    Contenu répétitif, publicités non sollicitées, messages automatisés
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-semibold">Harcèlement</h3>
                  <p className="text-sm text-muted-foreground">
                    Intimidation, menaces, harcèlement ciblé, doxing
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Outils de modération disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Signalement de contenu</h3>
                  <p className="text-sm text-muted-foreground">
                    Signalez facilement toute annonce ou utilisateur qui viole nos règles. 
                    Chaque signalement est examiné par notre équipe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Blocage d'utilisateurs</h3>
                  <p className="text-sm text-muted-foreground">
                    Bloquez les utilisateurs avec qui vous ne souhaitez plus interagir. 
                    Ils ne pourront plus vous contacter ni voir vos annonces.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Modération proactive</h3>
                  <p className="text-sm text-muted-foreground">
                    Notre équipe examine régulièrement les contenus publiés pour détecter 
                    et supprimer automatiquement les violations évidentes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Processus de traitement des signalements</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="font-medium">
                Réception du signalement
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Votre signalement est enregistré immédiatement et entre dans notre file de traitement.
                </p>
              </li>
              <li className="font-medium">
                Examen par notre équipe (sous 24h)
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Un modérateur examine le contenu signalé et vérifie s'il viole nos conditions.
                </p>
              </li>
              <li className="font-medium">
                Action corrective
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Si une violation est confirmée, nous supprimons le contenu et prenons des mesures 
                  contre l'utilisateur (avertissement, suspension ou bannissement).
                </p>
              </li>
              <li className="font-medium">
                Notification
                <p className="text-sm text-muted-foreground ml-6 mt-1">
                  Les deux parties sont informées de la décision et des actions entreprises.
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sanctions possibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-bold text-yellow-600">⚠️</span>
              <div>
                <h3 className="font-semibold">Avertissement</h3>
                <p className="text-sm text-muted-foreground">
                  Première violation mineure : avertissement et suppression du contenu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-bold text-orange-600">🔒</span>
              <div>
                <h3 className="font-semibold">Suspension temporaire</h3>
                <p className="text-sm text-muted-foreground">
                  Violations répétées ou graves : suspension de 7 à 30 jours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-bold text-red-600">🚫</span>
              <div>
                <h3 className="font-semibold">Bannissement permanent</h3>
                <p className="text-sm text-muted-foreground">
                  Violations graves ou répétées après suspension : bannissement définitif
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contestation d'une décision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Si vous estimez qu'une décision de modération est injustifiée, vous pouvez :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contacter notre équipe via la page <Link to="/contact" className="text-primary hover:underline">Contact</Link></li>
              <li>Fournir des explications et preuves pour appuyer votre contestation</li>
              <li>Notre équipe réexaminera le cas dans les 48 heures</li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Besoin d'aide ?</h2>
          <p className="text-muted-foreground mb-4">
            Si vous avez des questions sur notre politique de modération ou si vous souhaitez signaler un contenu, 
            n'hésitez pas à nous contacter.
          </p>
          <Link to="/contact">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Nous contacter
            </button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};