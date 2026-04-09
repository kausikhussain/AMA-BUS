import QRCode from "qrcode";

export const generateTicketQr = async (payload: object) =>
  QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280
  });
