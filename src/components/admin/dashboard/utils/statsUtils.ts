
import { AdminStats } from "@/types/admin.types";

export function prepareMessageData(messages: any[] | undefined) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) return [];
  
  // Group messages by date and count them
  return messages
    .filter(m => m && m.created_at) // Filter out invalid messages
    .map(m => ({
      date: new Date(m.created_at).toLocaleDateString(),
      count: 1
    }))
    .reduce((acc: any[], curr) => {
      const existing = acc.find(a => a.date === curr.date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function calculateActiveConversations(stats: Partial<AdminStats>) {
  if (!stats.conversations || !Array.isArray(stats.conversations) || 
      !stats.messages || !Array.isArray(stats.messages)) {
    return 0;
  }
  
  // Count conversations that have at least one message
  return stats.conversations.filter(conversation => {
    return conversation && conversation.id && 
           stats.messages?.some(message => 
             message && message.conversation_id === conversation.id
           );
  }).length;
}

export function calculateTotalMessages(messages: any[] | undefined) {
  if (!messages || !Array.isArray(messages)) return 0;
  return messages.length;
}

export function calculateMessagesToday(messages: any[] | undefined) {
  if (!messages || !Array.isArray(messages)) return 0;
  
  const today = new Date().toDateString();
  return messages.filter(m => 
    m && m.created_at && new Date(m.created_at).toDateString() === today
  ).length;
}

export function calculateMessagesTrend(messages: any[] | undefined) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) return "0%";
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayMessages = messages.filter(m => 
    m && m.created_at && new Date(m.created_at).toDateString() === now.toDateString()
  ).length;
  
  const yesterdayMessages = messages.filter(m => 
    m && m.created_at && new Date(m.created_at).toDateString() === yesterday.toDateString()
  ).length;
  
  if (yesterdayMessages === 0) return todayMessages > 0 ? "+100%" : "0%";
  
  const percentChange = ((todayMessages - yesterdayMessages) / yesterdayMessages) * 100;
  return `${percentChange > 0 ? '+' : ''}${Math.round(percentChange)}%`;
}
