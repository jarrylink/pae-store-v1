import { google } from 'googleapis';

// Initialize Google Analytics Data API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analyticsData = google.analyticsdata('v1beta');

interface FunnelData {
  visits: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  purchases: number;
}

export async function getRealFunnelData(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<FunnelData> {
  try {
    const response = await analyticsData.properties.runReport({
      property: "properties/" + propertyId,
      requestBody: {
        dateRanges: [{ startDate: startDate, endDate: endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'viewItem' },
          { name: 'addToCart' },
          { name: 'beginCheckout' },
          { name: 'purchases' },
        ],
      },
    });

    const rows = response.data.rows?.[0]?.metricValues;

    return {
      visits: parseInt(rows?.[0]?.value || '0'),
      productViews: parseInt(rows?.[1]?.value || '0'),
      addToCart: parseInt(rows?.[2]?.value || '0'),
      checkouts: parseInt(rows?.[3]?.value || '0'),
      purchases: parseInt(rows?.[4]?.value || '0'),
    };
  } catch (error: any) {
    console.error('Error fetching GA4 data:', error?.message || error);
    return {
      visits: 0,
      productViews: 0,
      addToCart: 0,
      checkouts: 0,
      purchases: 0,
    };
  }
}

export async function trackRevenueEvent(revenue: number, orderId: string) {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;

  const payload = {
    client_id: orderId,
    events: [{
      name: 'purchase',
      params: {
        currency: 'NGN',
        value: revenue,
        transaction_id: orderId,
      },
    }],
  };

  try {
    await fetch('https://www.google-analytics.com/mp/collect?measurement_id=' + measurementId + '&api_secret=' + apiSecret, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    console.error('Error tracking revenue event:', error?.message || error);
  }
}
