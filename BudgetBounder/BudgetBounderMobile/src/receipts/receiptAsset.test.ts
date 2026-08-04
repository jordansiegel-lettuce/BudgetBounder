import { toReceiptAttachment } from './receiptAsset';

describe('receipt attachment conversion', () => {
  test.each(['camera', 'gallery'])('keeps a %s image preview and upload payload', source => {
    expect(toReceiptAttachment({ uri: `${source}://receipt.jpg`, base64: 'AQID', mimeType: 'image/jpeg' })).toEqual({
      uri: `${source}://receipt.jpg`,
      dataUrl: 'data:image/jpeg;base64,AQID',
    });
  });

  test('rejects an asset without uploadable image data', () => {
    expect(toReceiptAttachment({ uri: 'gallery://receipt.jpg' })).toBeNull();
  });
});
