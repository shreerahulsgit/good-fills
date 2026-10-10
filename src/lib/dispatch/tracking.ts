import { Order, CourierPartnerInfo, ConsignmentPackageSpecs, TrackingTelemetryResult } from '@/types';
import { getAllServerOrdersAsync } from '@/lib/store/orders';

function maskPhoneNumber(phone?: string): string {
    if (!phone) return '+91 ••••• •••••';
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 10) {
        const last4 = clean.slice(-4);
        const first2 = clean.slice(0, 2);
        return `+91 ${first2}••• ••${last4}`;
    }
    return phone;
}

export function deriveActiveStage(order: Order): number {
    if (order.shipmentStatus === 'Delivered' || order.orderStatus === 'Completed') {
        return 5;
    }
    if (order.shipmentStatus === 'Out for Delivery') {
        return 4;
    }
    if (
        order.shipmentStatus === 'In Transit' ||
        order.shipmentStatus === 'Handed Over' ||
        order.orderStatus === 'Shipped'
    ) {
        return 3;
    }
    if (order.orderStatus === 'Ready to Ship') {
        return 2;
    }
    return 1;
}

export function buildTrackingTelemetry(order: Order, forcedStage?: number): TrackingTelemetryResult {
    const createdDate = new Date(order.createdAt || Date.now());
    const orderId = order.id || '';
    const phoneClean = (order.customerPhone || '').replace(/\D/g, '');

    const activeStage = forcedStage !== undefined ? forcedStage : deriveActiveStage(order);

    const hasRealAwb = Boolean(order.trackingNumber && order.trackingNumber.trim().length > 0);
    const dtdcAwb = hasRealAwb ? (order.trackingNumber as string).trim() : 'Assigned on Dispatch';

    const shippingAddress = {
        city: order.shippingAddress?.city || 'Bengaluru',
        pincode: order.shippingAddress?.pincode || '560038',
        state: order.shippingAddress?.state || 'Karnataka',
        country: order.shippingAddress?.country || 'India',
    };
    const destCity = shippingAddress.city;

    const progressMap: Record<number, number> = {
        1: 20,
        2: 40,
        3: 60,
        4: 80,
        5: 100,
    };
    const overallProgressPercent = progressMap[activeStage] || 20;

    let currentStatusHeadline = 'Order Confirmed & Preparing';
    let currentStatusDescription = 'We have received your order. Our Bengaluru kitchen team is preparing your fresh batch.';
    let statusBadgeType: 'live' | 'completed' | 'processing' | 'pending' = 'processing';

    if (activeStage === 2) {
        currentStatusHeadline = 'Prepared & Packed';
        currentStatusDescription = 'Your batch has been prepared and packed into an airtight pouch, ready for courier pickup.';
        statusBadgeType = 'processing';
    } else if (activeStage === 3) {
        currentStatusHeadline = 'Dispatched via DTDC Express';
        currentStatusDescription = `Your parcel is on its way with DTDC courier to ${destCity}.`;
        statusBadgeType = 'live';
    } else if (activeStage === 4) {
        currentStatusHeadline = 'Out for Delivery Today';
        currentStatusDescription = `Your local DTDC courier agent is on the way to your doorstep in ${destCity}.`;
        statusBadgeType = 'live';
    } else if (activeStage === 5) {
        currentStatusHeadline = 'Delivered to Doorstep';
        currentStatusDescription = `Your package has been successfully delivered at ${destCity}.`;
        statusBadgeType = 'completed';
    }

    const currentDeliveryStage =
        activeStage === 5
        ? 'Delivered'
        : activeStage === 4
        ? 'Out for Delivery'
        : activeStage === 3
        ? 'In Transit with DTDC'
        : activeStage === 2
        ? 'Freshly Milled & Packed'
        : 'Order Confirmed & Preparing';

    const estimatedDeliveryWindow = currentDeliveryStage;
    const totalWeightGrams =
        order.weightGrams ||
        order.items?.reduce((sum, it) => sum + (it.product.productWeightGrams * it.quantity), 0) ||
        250;

    const packageSpecs: ConsignmentPackageSpecs = {
        totalWeightGrams,
        formattedWeight: totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(1)} kg` : `${totalWeightGrams}g`,
            packagingType: 'Airtight Barrier Foil Pouch + Sturdy Carton',
            sealIntegrity: 'Tamper-Evident Freshness Seal',
            storageRequirement: 'Store in cool, dry place away from moisture',
            batchCode: `BATCH-${createdDate.toISOString().slice(2, 10).replace(/-/g, '')}`,
    };

    const courier: CourierPartnerInfo = {
        name: 'DTDC Express Limited',
        brand: 'DTDC Pan-India Express',
        serviceType: 'Domestic Priority Express',
        awbNumber: dtdcAwb,
        isAssigned: hasRealAwb,
        trackingUrl: hasRealAwb
            ? `https://www.dtdc.in/tracking/shipment-tracking.asp`
            : 'https://www.dtdc.in/tracking/shipment-tracking.asp',
        helpline: '1800 209 6006',
    };

    const items = (order.items || []).map((it) => {
        return {
            id: it.product?.id || 'unknown-product',
            name: it.product?.name || 'Artisanal Product',
            packSize: it.product?.packSize || '250g',
            quantity: it.quantity || 1,
            price: it.product?.price || 0,
            imagePrimary: it.product?.images?.primary || '/logo.png',
            productWeightGrams: it.product?.productWeightGrams || 0,
        };
    });

    return {
        orderId,
        found: true,
        orderCreatedAt: order.createdAt || new Date().toISOString(),
        customerName: order.customerName || 'Good Fills Customer',
        maskedPhone: maskPhoneNumber(phoneClean),
        shippingAddress,
        orderStatus: order.orderStatus || 'Confirmed',
        shipmentStatus: order.shipmentStatus || 'Not Shipped',
        overallProgressPercent,
        currentStatusHeadline,
        currentStatusDescription,
        statusBadgeType,
        estimatedDeliveryDate: '',
        estimatedDeliveryWindow,
        isDelivered: activeStage === 5,
        courier,
        packageSpecs,
        items,
        subtotal: typeof order.subtotal === 'number' ? order.subtotal : (order.total || 0),
        shippingCost: typeof order.shippingCost === 'number' ? order.shippingCost : 0,
        total: typeof order.total === 'number' ? order.total : 0,
    };
}

export async function searchTrackingOrder(query: string): Promise<TrackingTelemetryResult | null> {
    const rawQuery = (query || '').trim();
    if (!rawQuery) return null;
    const cleanQuery = rawQuery.toUpperCase();

    const orders = await getAllServerOrdersAsync();

    const findMatch = (list: Order[]) => {
        const idDigits = cleanQuery.replace(/\D/g, '');
        const idMatch = list.find((o) => {
            const oIdUpper = o.id.toUpperCase();
            if (oIdUpper === cleanQuery) return true;
            if (idDigits.length >= 4 && oIdUpper.replace(/\D/g, '') === idDigits) return true;
            return false;
        });
        if (idMatch) return buildTrackingTelemetry(idMatch);

        const awbMatch = list.find((o) => {
            if (!o.trackingNumber) return false;
            const cleanAwb = o.trackingNumber.trim().toUpperCase().replace(/\s+/g, '');
            const testAwb = cleanQuery.replace(/\s+/g, '');
            return cleanAwb === testAwb;
        });
        if (awbMatch) return buildTrackingTelemetry(awbMatch);

        const phoneDigits = cleanQuery.replace(/\D/g, '').slice(-10);
        if (phoneDigits.length >= 8) {
            const phoneMatch = list.find((o) => {
                const oPhone = (o.customerPhone || o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
                return oPhone && (oPhone.endsWith(phoneDigits) || phoneDigits.endsWith(oPhone));
            });
            if (phoneMatch) return buildTrackingTelemetry(phoneMatch);
        }

        if (rawQuery.includes('@')) {
            const testEmail = rawQuery.toLowerCase();
            const emailMatch = list.find((o) => {
                const oEmail = (o.customerEmail || o.shippingAddress?.email || '').trim().toLowerCase();
                return oEmail === testEmail;
            });
            if (emailMatch) return buildTrackingTelemetry(emailMatch);
        }

        return null;
    };

    return findMatch(orders);
}