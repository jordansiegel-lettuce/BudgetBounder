export type ReceiptAsset = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
};

export type ReceiptAttachment = {
  uri: string;
  dataUrl: string;
};

export function toReceiptAttachment(asset: ReceiptAsset): ReceiptAttachment | null {
  if (!asset.base64) return null;
  return {
    uri: asset.uri,
    dataUrl: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`,
  };
}
