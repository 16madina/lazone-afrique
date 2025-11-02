import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Database, UserX, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
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
            <Shield className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Collecte des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                LaZone collecte et traite les données personnelles suivantes pour le bon fonctionnement de la plateforme :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informations de compte :</strong> Nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Informations de profil :</strong> Photo de profil, biographie</li>
                <li><strong>Annonces immobilières :</strong> Photos, descriptions, prix, localisation des biens</li>
                <li><strong>Messages :</strong> Communications entre utilisateurs via la messagerie interne</li>
                <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Utilisation des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Vos données personnelles sont utilisées pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Publier et gérer vos annonces immobilières</li>
                <li>Faciliter la communication entre acheteurs et vendeurs</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Assurer la sécurité et prévenir la fraude</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Partage des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Avec d'autres utilisateurs :</strong> Vos annonces et informations de contact sont visibles par les utilisateurs intéressés</li>
                <li><strong>Prestataires de services :</strong> Hébergement, paiement, analyse (avec accord de confidentialité)</li>
                <li><strong>Obligations légales :</strong> Si requis par la loi ou pour protéger nos droits</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Sécurité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Authentification sécurisée et hachage des mots de passe</li>
                <li>Accès limité aux données personnelles</li>
                <li>Sauvegardes régulières et système de récupération</li>
                <li>Surveillance continue des accès et activités suspectes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Conformément aux lois sur la protection des données, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos informations inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Refuser certains traitements de données</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous via la page{" "}
                <Link to="/contact" className="text-primary underline">Service Client</Link>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conservation des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte actif :</strong> Tant que votre compte existe</li>
                <li><strong>Après suppression :</strong> 30 jours pour permettre une récupération</li>
                <li><strong>Données d'annonces :</strong> Archivées pendant 3 mois après suppression</li>
                <li><strong>Obligations légales :</strong> Certaines données conservées selon les exigences légales</li>
              </ul>
              <p className="mt-4">
                Consultez notre <Link to="/data-deletion" className="text-primary underline">Politique de Suppression de Données</Link> pour plus de détails.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Pour toute question concernant cette politique de confidentialité, contactez-nous :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Email : privacy@lazone.app</li>
                <li>Page : <Link to="/contact" className="text-primary underline">Service Client</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
