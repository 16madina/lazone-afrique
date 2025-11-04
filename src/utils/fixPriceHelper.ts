import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Helper function to fix a listing price in the database
 * This is useful when a price was incorrectly stored
 */
export const fixListingPrice = async (listingId: string, correctPrice: number) => {
  try {
    const { error } = await supabase
      .from('listings')
      .update({ price: correctPrice })
      .eq('id', listingId);

    if (error) {
      console.error('Error fixing price:', error);
      toast.error("Erreur lors de la correction du prix");
      return false;
    }

    toast.success("Prix corrigé avec succès!");
    return true;
  } catch (error) {
    console.error('Error fixing price:', error);
    toast.error("Erreur lors de la correction du prix");
    return false;
  }
};
