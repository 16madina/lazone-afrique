// Get avatar initials for conversation
const getConversationAvatar = (conversation: any) => {
  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find((p: any) => p.user_id !== user?.id);

  // Use participant's name for initials, not the conversation title
  if (otherParticipant?.profile) {
    const fullName =
      otherParticipant.profile.full_name ||
      `${otherParticipant.profile.first_name || ""}${otherParticipant.profile.last_name || ""}`.trim();

    if (fullName) {
      const words = fullName.split(" ");
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
  }

  // Final fallback: return '?' if no participant info available
  return "??";
};
