import { Share } from 'react-native';

export async function shareLewaItem(title: string, detail?: string | null): Promise<void> {
  const lines = [title, detail?.trim(), 'Lewa Wildlife Conservancy'].filter(Boolean);
  await Share.share({ title, message: lines.join('\n') });
}
