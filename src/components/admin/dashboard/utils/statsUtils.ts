
import { AdminStats } from "@/types/admin.types";

export function prepareMessageData(messages: any[] | undefined) {
  if (!messages) return [];
  
  return messages.map(m => ({
    date: new Date(m.created_at).toLocaleDateString(),
    count: 1
  })).reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.date === curr.date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
}

export function calculateActiveConversations(stats: Partial<AdminStats>) {
  return stats.conversations?.filter(conversation => {
    return stats.messages?.some(message => message.conversation_id === conversation.id);
  }).length || 0;
}

export function calculateTotalMessages(messages: any[] | undefined) {
  return Array.isArray(messages) ? messages.length : 0;
}
