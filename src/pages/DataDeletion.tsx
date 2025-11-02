import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DataDeletion = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <Trash2 className="w-16 h-16 mx-auto text-destructive" />
            <h1 className="text-4xl font-bold">Politique de Suppression de Données</h1>
            <p className="text-muted-foreground">
              Comprendre comment vos données sont traitées lors de la suppression de compte
            </p>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cette politique explique clairement ce qui arrive à vos données personnelles lorsque vous supprimez votre compte LaZone.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Suppression de Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Vous pouvez supprimer votre compte LaZone à tout moment depuis la page{" "}
                <Link to="/settings" className="text-primary underline">Paramètres</Link> de votre profil.
              </p>
              <p className="font-semibold text-destructive">
                ⚠️ La suppression de votre compte est une action irréversible après 30 jours.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Que se passe-t-il immédiatement ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Dès que vous supprimez votre compte :</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Compte désactivé :</strong> Vous ne pouvez plus vous connecter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Profil masqué :</strong> Votre profil n'est plus visible publiquement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Annonces retirées :</strong> Toutes vos annonces sont dépubliées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Accès révoqué :</strong> Tous vos accès et sessions sont terminés</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Période de Grâce (30 jours)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Nous conservons vos données pendant 30 jours</strong> après la demande de suppression pour vous permettre de changer d'avis :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vous pouvez réactiver votre compte en vous reconnectant dans les 30 jours</li>
                <li>Toutes vos données seront restaurées (profil, annonces, messages, favoris)</li>
                <li>Cette période permet également de résoudre tout litige en cours</li>
              </ul>
              <Alert>
                <AlertDescription>
                  Pour réactiver votre compte durant cette période, connectez-vous simplement avec vos identifiants.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Suppression Définitive (Après 30 jours)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-semibold">
                Après 30 jours, vos données personnelles sont <strong>définitivement supprimées</strong> :
              </p>
              
              <div className="space-y-3">
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">✅ Données complètement supprimées :</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Nom, prénom, email, numéro de téléphone</li>
                    <li>Photo de profil et informations personnelles</li>
                    <li>Annonces immobilières et leurs photos</li>
                    <li>Messages privés échangés</li>
                    <li>Favoris et recherches sauvegardées</li>
                    <li>Historique de navigation et préférences</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 Données anonymisées conservées :</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Statistiques agrégées (nombre de vues, performances des annonces)</li>
                    <li>Données anonymes pour améliorer nos services</li>
                    <li>Ces données ne peuvent plus être reliées à vous personnellement</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">⚖️ Données conservées pour obligations légales :</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Transactions financières (paiements de sponsoring) : 10 ans</li>
                    <li>Données de facturation : selon les lois fiscales</li>
                    <li>Logs de sécurité en cas de litige : durée légale applicable</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important :</strong> Après la suppression définitive, nous ne pourrons PAS récupérer vos données. Cette action est irréversible.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comment Supprimer Votre Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-6 space-y-2">
                <li>Connectez-vous à votre compte LaZone</li>
                <li>Accédez à la page <Link to="/settings" className="text-primary underline">Paramètres</Link></li>
                <li>Descendez jusqu'à la section "Zone Dangereuse"</li>
                <li>Cliquez sur "Supprimer mon compte"</li>
                <li>Confirmez votre décision en entrant votre mot de passe</li>
              </ol>
              
              <Alert>
                <AlertDescription>
                  Besoin d'aide ? Contactez notre <Link to="/contact" className="text-primary underline">Service Client</Link>.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Récupération de Vos Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Avant de supprimer votre compte, vous pouvez demander une copie de toutes vos données personnelles :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accédez aux <Link to="/settings" className="text-primary underline">Paramètres</Link></li>
                <li>Cliquez sur "Télécharger mes données"</li>
                <li>Vous recevrez un fichier contenant toutes vos informations dans les 48h</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions Fréquentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Puis-je supprimer uniquement certaines données ?</h4>
                  <p className="text-muted-foreground">
                    Oui, vous pouvez supprimer individuellement vos annonces, messages ou photos depuis votre profil sans supprimer votre compte.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Que deviennent mes messages après suppression ?</h4>
                  <p className="text-muted-foreground">
                    Vos messages sont supprimés de votre côté, mais restent visibles pour les autres utilisateurs jusqu'à ce qu'ils les suppriment également.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Puis-je créer un nouveau compte avec le même email ?</h4>
                  <p className="text-muted-foreground">
                    Après la suppression définitive (30 jours), oui, vous pouvez créer un nouveau compte avec le même email.
                  </p>
                </div>
              </div>
              
              <p className="mt-6">
                Plus de questions ? Consultez notre <Link to="/faq" className="text-primary underline">FAQ complète</Link> ou contactez le{" "}
                <Link to="/contact" className="text-primary underline">Service Client</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
