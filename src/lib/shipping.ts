import { ShippingCalculation } from '@/types';

/**
 * Calculates DTDC Domestic Shipping charges based strictly on Total Product Weight (excluding packaging weight).
 * Source of truth: handoff.md Section 14 & agent.md Section 3
 * 
 * Slabs:
 * - Up to 500g: ₹100
 * - 501g to 1,000g (1kg): ₹200
 * - 1,001g to 2,000g (2kg): ₹400
 * - 2,001g to 3,000g (3kg): ₹600
 * - Each additional started 1kg beyond 3kg: +₹200
 */
export function calculateDomesticShipping(totalWeightGrams: number): ShippingCalculation {
  if (totalWeightGrams <= 0) {
    return {
      totalWeightGrams: 0,
      totalWeightKg: 0,
      shippingCost: 0,
      slabDescription: 'Cart empty',
      courierName: 'DTDC',
      estimatedDelivery: '2–4 days'
    };
  }

  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(3));
  let shippingCost = 0;
  let slabDescription = '';

  if (totalWeightGrams <= 500) {
    shippingCost = 100;
    slabDescription = 'Up to 500g (₹100)';
  } else if (totalWeightGrams <= 1000) {
    shippingCost = 200;
    slabDescription = '501g – 1kg (₹200)';
  } else if (totalWeightGrams <= 2000) {
    shippingCost = 400;
    slabDescription = '1.01kg – 2kg (₹400)';
  } else if (totalWeightGrams <= 3000) {
    shippingCost = 600;
    slabDescription = '2.01kg – 3kg (₹600)';
  } else {
    // Beyond 3kg: ₹600 + ₹200 for every started 1kg
    const extraWeightGrams = totalWeightGrams - 3000;
    const additionalKg = Math.ceil(extraWeightGrams / 1000);
    shippingCost = 600 + additionalKg * 200;
    slabDescription = `3kg+ with ${additionalKg} extra kg (₹${shippingCost})`;
  }

  return {
    totalWeightGrams,
    totalWeightKg,
    shippingCost,
    slabDescription,
    courierName: 'DTDC',
    estimatedDelivery: '2–4 days'
  };
}

/**
 * Format currency in Indian Rupee format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
