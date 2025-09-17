-- Add missing foreign key constraints to fix relationship issues

-- Add foreign key for listings.user_id referencing auth.users
ALTER TABLE public.listings 
ADD CONSTRAINT fk_listings_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for sponsorship_transactions.listing_id referencing listings
ALTER TABLE public.sponsorship_transactions 
ADD CONSTRAINT fk_sponsorship_transactions_listing_id 
FOREIGN KEY (listing_id) REFERENCES public.listings(id);

-- Add foreign key for sponsorship_transactions.user_id referencing auth.users  
ALTER TABLE public.sponsorship_transactions 
ADD CONSTRAINT fk_sponsorship_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for sponsorship_transactions.package_id referencing sponsorship_packages
ALTER TABLE public.sponsorship_transactions 
ADD CONSTRAINT fk_sponsorship_transactions_package_id 
FOREIGN KEY (package_id) REFERENCES public.sponsorship_packages(id);

-- Add foreign key for favorites.listing_id referencing listings
ALTER TABLE public.favorites 
ADD CONSTRAINT fk_favorites_listing_id 
FOREIGN KEY (listing_id) REFERENCES public.listings(id);

-- Add foreign key for favorites.user_id referencing auth.users
ALTER TABLE public.favorites 
ADD CONSTRAINT fk_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for profiles.user_id referencing auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for conversations.property_id referencing listings
ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_property_id 
FOREIGN KEY (property_id) REFERENCES public.listings(id);

-- Add foreign key for conversation_participants.user_id referencing auth.users
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT fk_conversation_participants_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for conversation_participants.conversation_id referencing conversations
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT fk_conversation_participants_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);

-- Add foreign key for messages.conversation_id referencing conversations
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);

-- Add foreign key for messages.sender_id referencing auth.users
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id);

-- Add foreign key for admin_roles.user_id referencing auth.users
ALTER TABLE public.admin_roles 
ADD CONSTRAINT fk_admin_roles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Add foreign key for admin_roles.granted_by referencing auth.users
ALTER TABLE public.admin_roles 
ADD CONSTRAINT fk_admin_roles_granted_by 
FOREIGN KEY (granted_by) REFERENCES auth.users(id);

-- Add foreign key for user_actions.admin_id referencing auth.users
ALTER TABLE public.user_actions 
ADD CONSTRAINT fk_user_actions_admin_id 
FOREIGN KEY (admin_id) REFERENCES auth.users(id);

-- Add foreign key for user_actions.target_user_id referencing auth.users
ALTER TABLE public.user_actions 
ADD CONSTRAINT fk_user_actions_target_user_id 
FOREIGN KEY (target_user_id) REFERENCES auth.users(id);

-- Add foreign key for user_actions.target_listing_id referencing listings
ALTER TABLE public.user_actions 
ADD CONSTRAINT fk_user_actions_target_listing_id 
FOREIGN KEY (target_listing_id) REFERENCES public.listings(id);

-- Add foreign key for sponsorship_transactions.approved_by referencing auth.users
ALTER TABLE public.sponsorship_transactions 
ADD CONSTRAINT fk_sponsorship_transactions_approved_by 
FOREIGN KEY (approved_by) REFERENCES auth.users(id);