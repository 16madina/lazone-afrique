import { DemoImageUploader } from '@/components/admin/DemoImageUploader';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdminImageUpload = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
        
        <DemoImageUploader />
        
        <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">ℹ️ Instructions</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ce composant est temporaire et sert à uploader les images démo</li>
            <li>Les images seront uploadées vers <code className="bg-background px-1 py-0.5 rounded">property-photos/demo/</code></li>
            <li>Le bucket doit être public pour que les images soient visibles</li>
            <li>Après l'upload réussi, vous pouvez supprimer cette page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminImageUpload;
