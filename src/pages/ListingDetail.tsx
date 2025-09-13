import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ListingDetail = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'annonce</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Annonce ID: {id}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Cette page sera développée pour afficher les détails complets de la propriété.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ListingDetail;