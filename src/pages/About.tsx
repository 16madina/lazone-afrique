import { Info, Heart, Shield, Zap, Users, MapPin, Award } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  const features = [
    {
      icon: Heart,
      title: "Notre Mission",
      description: "Simplifier l'accès au marché immobilier africain en connectant acheteurs, vendeurs et professionnels",
      color: "text-red-500",
    },
    {
      icon: Shield,
      title: "Sécurité & Confiance",
      description: "Vérification des annonces et protection des données pour garantir des transactions sécurisées",
      color: "text-blue-500",
    },
    {
      icon: Zap,
      title: "Rapidité",
      description: "Trouvez le bien idéal en quelques clics grâce à nos outils de recherche avancés",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      title: "Communauté",
      description: "Rejoignez des milliers d'utilisateurs qui font confiance à LaZone pour leurs projets immobiliers",
      color: "text-green-500",
    },
  ];

  const stats = [
    { label: "Utilisateurs actifs", value: "10,000+", icon: Users },
    { label: "Annonces publiées", value: "5,000+", icon: MapPin },
    { label: "Transactions réussies", value: "2,500+", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 pb-32">
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Info className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              À Propos de LaZone
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            La première plateforme immobilière panafricaine qui révolutionne la manière dont vous achetez, vendez et louez des biens
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-elevation-4 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-elevation-4 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="glass-button p-3 rounded-lg">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Story Section */}
        <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Notre Histoire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              LaZone est née d'une vision simple : rendre l'immobilier africain accessible à tous. 
              Nous avons constaté que trouver un logement ou investir dans l'immobilier en Afrique 
              pouvait être complexe et opaque.
            </p>
            <p>
              C'est pourquoi nous avons créé une plateforme moderne, transparente et sécurisée qui 
              connecte directement les acteurs du marché immobilier. De la Côte d'Ivoire au Sénégal, 
              en passant par le Cameroun et le Bénin, LaZone s'étend progressivement dans toute l'Afrique.
            </p>
            <p>
              Aujourd'hui, nous sommes fiers d'accompagner des milliers d'utilisateurs dans leurs projets 
              immobiliers, qu'il s'agisse d'acheter leur première maison, de louer un appartement ou 
              d'investir dans des biens de prestige.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <Card className="mt-6 animate-fade-in" style={{ animationDelay: "700ms" }}>
          <CardHeader>
            <CardTitle className="text-2xl">Nos Valeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Transparence", "Innovation", "Excellence", "Engagement", "Accessibilité", "Confiance"].map(
                (value, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-base px-4 py-2 hover:shadow-elevation-2 transition-all duration-300"
                  >
                    {value}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
