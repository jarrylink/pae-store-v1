import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ESG data with proper structure
    const data = {
      esg: {
        environmental: {
          carbonFootprint: 1245,
          energyUsage: 345678,
          wasteReduction: 12.5,
        },
        social: {
          communityEngagement: 89,
          employeeSatisfaction: 78,
          diversity: 65,
        },
        governance: {
          compliance: 100,
          transparency: 95,
          ethics: 98,
        },
        metrics: [
          {
            name: 'Carbon Footprint',
            value: 1245,
            unit: 'tCO2e',
            trend: -8.5,
          },
          {
            name: 'Energy Usage',
            value: 345678,
            unit: 'kWh',
            trend: -3.2,
          },
          {
            name: 'Waste Reduction',
            value: 12.5,
            unit: '%',
            trend: 4.8,
          },
          {
            name: 'Community Engagement',
            value: 89,
            unit: '%',
            trend: 6.5,
          },
          {
            name: 'Governance Score',
            value: 97,
            unit: '%',
            trend: 2.3,
          }
        ],
        summary: {
          totalScore: 87,
          rating: 'A-',
          improvements: [
            'Reduced carbon footprint by 8.5% this quarter',
            'Increased community engagement by 6.5%',
            'Improved governance score to 97%'
          ]
        }
      }
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('ESG API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
