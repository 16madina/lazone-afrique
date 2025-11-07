import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Acceptation des conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              En accédant et en utilisant LaZone Afrique, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Description du service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              LaZone Afrique est une plateforme de mise en relation pour l'immobilier en Afrique. Nous permettons aux utilisateurs 
              de publier des annonces immobilières et de rechercher des biens.
            </p>
            <p>
              Nous ne sommes pas propriétaires des biens listés et n'agissons pas comme agent immobilier. Nous fournissons uniquement 
              une plateforme technologique de mise en relation.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Compte utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Pour publier des annonces, vous devez créer un compte. Vous êtes responsable de :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées depuis votre compte</li>
              <li>La véracité des informations fournies lors de l'inscription</li>
              <li>La mise à jour de vos informations personnelles</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Règles de contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Les utilisateurs s'engagent à ne pas publier de contenu qui :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Est faux, trompeur ou frauduleux</li>
              <li>Viole les droits d'autrui (propriété intellectuelle, vie privée, etc.)</li>
              <li>Est illégal, offensant, diffamatoire ou inapproprié</li>
              <li>Contient des virus, malwares ou code malveillant</li>
              <li>Constitue du spam ou du harcèlement</li>
            </ul>
            <p className="mt-4">
              Nous nous réservons le droit de supprimer tout contenu qui viole ces règles sans préavis.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Modération et signalement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              LaZone Afrique met en œuvre des systèmes de modération pour maintenir la qualité et la sécurité de la plateforme :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les utilisateurs peuvent signaler du contenu inapproprié</li>
              <li>Les utilisateurs peuvent bloquer d'autres utilisateurs</li>
              <li>Nous nous engageons à examiner et traiter les signalements sous 24 heures</li>
              <li>Les comptes violant de manière répétée les règles peuvent être suspendus ou bannis</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Paiements et abonnements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Certains services sont payants (annonces supplémentaires, abonnements premium, sponsoring). 
              Les paiements sont traités de manière sécurisée par nos prestataires de paiement.
            </p>
            <p>
              Les prix sont affichés en Francs CFA (XOF) ou en USD selon le service. Tous les paiements sont non remboursables 
              sauf disposition contraire de la loi.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Suppression de compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Vous pouvez demander la suppression de votre compte à tout moment depuis les paramètres. 
              La suppression entraîne :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La suppression définitive de toutes vos données personnelles</li>
              <li>La suppression de toutes vos annonces</li>
              <li>La suppression de vos messages et conversations</li>
              <li>La perte de l'accès à tous les services payants actifs</li>
            </ul>
            <p className="mt-4">
              Pour plus d'informations, consultez notre <Link to="/data-deletion" className="text-primary hover:underline">politique de suppression de données</Link>.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Limitation de responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              LaZone Afrique ne garantit pas l'exactitude, la qualité ou la légalité des annonces publiées. 
              Nous ne sommes pas responsables des transactions entre utilisateurs.
            </p>
            <p>
              L'utilisation de la plateforme se fait à vos propres risques. Nous vous recommandons de vérifier 
              toutes les informations et de faire preuve de prudence dans vos transactions.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Tous les droits de propriété intellectuelle sur la plateforme (logo, design, code, contenu) appartiennent à LaZone Afrique 
              ou à ses concédants de licence.
            </p>
            <p>
              En publiant du contenu, vous accordez à LaZone Afrique une licence non exclusive pour utiliser, 
              afficher et promouvoir ce contenu dans le cadre du service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Modifications des CGU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nous nous réservons le droit de modifier ces Conditions Générales à tout moment. 
              Les modifications importantes seront notifiées aux utilisateurs par email ou via la plateforme.
            </p>
            <p>
              La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles conditions.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Pour toute question concernant ces CGU, veuillez nous contacter via notre <Link to="/contact" className="text-primary hover:underline">page de contact</Link>.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};