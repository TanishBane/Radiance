import { getSupabaseBrowserClient } from "./client";
import { Conversation, ChatMessage } from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";

export const conversationService = {
  /**
   * Persists a conversation to Supabase if client & session exist,
   * otherwise persists safely to safeLocalStorage.
   */
  async save(conv: Conversation, userId?: string): Promise<void> {
    // 1. Always update local storage for instant offline availability & resilience
    safeLocalStorage.saveConversation(conv);

    // 2. Sync to Supabase if user is authenticated
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) return;

    try {
      const { error: convError } = await supabase.from("conversations").upsert({
        id: conv.id,
        user_id: userId,
        title: conv.title,
        pinned: conv.pinned,
        updated_at: new Date(conv.updatedAt).toISOString(),
      });

      if (convError) throw convError;

      // Upsert messages in batch
      if (conv.messages.length > 0) {
        const messageRows = conv.messages.map((m: ChatMessage) => ({
          id: m.id,
          conversation_id: conv.id,
          role: m.role,
          content: m.content,
          image_url: m.generatedImageUrl,
          created_at: new Date(m.createdAt).toISOString(),
        }));

        const { error: msgError } = await supabase.from("messages").upsert(messageRows, {
          onConflict: "id",
        });

        if (msgError) throw msgError;
      }
    } catch (err) {
      console.warn("[ConversationService] Supabase sync failed, cached locally:", err);
    }
  },

  /**
   * Loads all conversations for the user, combining cloud and local records.
   */
  async list(userId?: string): Promise<Conversation[]> {
    const local = safeLocalStorage.listConversations();

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          pinned,
          created_at,
          updated_at,
          messages (
            id,
            role,
            content,
            image_url,
            created_at
          )
        `)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error || !data) return local;

      // Format Supabase response into unified Conversation domain objects
      const cloudConvs: Conversation[] = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        pinned: c.pinned,
        createdAt: new Date(c.created_at).getTime(),
        updatedAt: new Date(c.updated_at).getTime(),
        messages: (c.messages || [])
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.created_at).getTime(),
            generatedImageUrl: m.image_url,
          })),
      }));

      return cloudConvs;
    } catch (err) {
      console.warn("[ConversationService] Cloud fetch failed, falling back to local:", err);
      return local;
    }
  },

  /**
   * Deletes a conversation locally and in the cloud.
   */
  async delete(convId: string, userId?: string): Promise<void> {
    safeLocalStorage.deleteConversation(convId);

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) return;

    try {
      await supabase.from("conversations").delete().eq("id", convId).eq("user_id", userId);
    } catch (err) {
      console.warn("[ConversationService] Cloud delete failed:", err);
    }
  },

  /**
   * Toggles pinned state locally and in the cloud.
   */
  async togglePin(convId: string, isPinned: boolean, userId?: string): Promise<void> {
    const conv = safeLocalStorage.getConversation(convId);
    if (conv) {
      conv.pinned = !isPinned;
      safeLocalStorage.saveConversation(conv);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) return;

    try {
      await supabase
        .from("conversations")
        .update({ pinned: !isPinned })
        .eq("id", convId)
        .eq("user_id", userId);
    } catch (err) {
      console.warn("[ConversationService] Cloud pin update failed:", err);
    }
  },
};
