import { Platform } from 'react-native';

import { loadReceiptLogoDataUri, receiptHtml, type ReceiptModel } from '@/utils/receipt';

/** Writes a PDF from the live receipt model and opens share or the print dialog. */
export async function downloadReceipt(model: ReceiptModel): Promise<void> {
  const logo = await loadReceiptLogoDataUri();
  const html = receiptHtml(model, logo);
  if (Platform.OS === 'web') {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) throw new Error('Allow pop-ups to download this receipt.');
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    return;
  }

  const Print = await import('expo-print');
  const file = await Print.printToFileAsync({ html });
  const Sharing = await import('expo-sharing');
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: model.receiptNumber,
    });
    return;
  }
  await Print.printAsync({ uri: file.uri });
}
