import { ShippingCalculation } from '@/types';

export function calculateDomesticShipping(totalWeightGrams: number): ShippingCalculation {
    if (totalWeightGrams <= 0) {
        return {
            totalWeightGrams: 0,
            totalWeightKg: 0,
            shippingCost: 0,
            slabDescription: 'Complimentary (₹0)',
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

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}