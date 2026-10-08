import QRCode from 'qrcode';
import { Order } from '@/types';

export const ATELIER_INFO = {
  brandName: 'Good Fills',
  legalEntity: 'Good Fills Artisanal Kitchen',
  tagline: 'Handcrafted Traditional Care • Made to Order',
  founderName: 'Alankrutha Sunil',
  founderTitle: 'Founder & Head of Atelier',
  address: 'No. 24, 4th Cross, Indira Nagar, Bengaluru, Karnataka – 560038',
  location: 'Bengaluru, Karnataka, India',
  phone: '+91 97420 68899',
  email: 'goodfillsproducts@gmail.com',
  website: 'https://goodfills.in',
  fssaiNumber: 'FSSAI Registered • Traditional Preparation Standards',
  panIndiaCourier: 'DTDC Domestic Express Doorstep Courier',
};

export function isInvoiceEligible(order: Pick<Order, 'orderStatus' | 'paymentStatus'>): boolean {
  return (
    order.orderStatus !== 'Pending' &&
    order.orderStatus !== 'Failed' &&
    order.orderStatus !== 'Cancelled' &&
    order.paymentStatus !== 'Pending' &&
    order.paymentStatus !== 'Failed'
  );
}

/**
 * Converts a numerical amount in INR to formal Indian Rupee Words
 * e.g., 1 -> "Rupees One Only", 450 -> "Rupees Four Hundred Fifty Only"
 */
export function numberToIndianRupeeWords(amount: number): string {
  if (isNaN(amount) || amount <= 0) return 'Rupees Zero Only';

  const singleDigits = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit > 0 ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred > 0) {
      str += singleDigits[hundred] + ' Hundred';
      if (rest > 0) str += ' ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str;
  }

  const integerPart = Math.floor(amount);
  const paisePart = Math.round((amount - integerPart) * 100);

  let num = integerPart;
  const parts: string[] = [];

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  if (crore > 0) {
    parts.push(convertThreeDigits(crore) + ' Crore');
  }

  const lakh = Math.floor(num / 100000);
  num %= 100000;
  if (lakh > 0) {
    parts.push(convertThreeDigits(lakh) + ' Lakh');
  }

  const thousand = Math.floor(num / 1000);
  num %= 1000;
  if (thousand > 0) {
    parts.push(convertThreeDigits(thousand) + ' Thousand');
  }

  if (num > 0) {
    parts.push(convertThreeDigits(num));
  }

  let words = parts.join(' ').trim();
  if (!words) words = 'Zero';

  let result = `Rupees ${words}`;
  if (paisePart > 0) {
    result += ` and ${convertTwoDigits(paisePart)} Paise`;
  }
  result += ' Only';

  return result;
}

/**
 * Generates a high-resolution QR code pointing to live DTDC courier tracking
 */
export async function generateTrackingQrCode(orderId: string): Promise<string> {
  try {
    const url = `https://goodfills.in/track-order?id=${encodeURIComponent(orderId)}`;
    return await QRCode.toDataURL(url, {
      width: 256,
      margin: 1,
      color: {
        dark: '#2d1810',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate tracking QR code:', err);
    return '';
  }
}

/**
 * Formats order ID into standard official invoice number
 * e.g., "ORD-3567" -> "INV-GF-3567"
 */
export function formatInvoiceNumber(orderId: string): string {
  const clean = orderId.replace(/^ORD-?/i, '');
  return `INV-GF-${clean}`;
}
