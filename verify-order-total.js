// Run this in browser console after placing an order
(async function() {
  console.log('🔍 VERIFYING ORDER TOTAL CALCULATION');
  console.log('=====================================');
  
  // Get last order ID from session
  const lastOrderId = sessionStorage.getItem('lastOrderId');
  if (!lastOrderId) {
    console.log('❌ No recent order found. Place a new order first.');
    return;
  }
  
  console.log('📦 Last order ID:', lastOrderId);
  
  try {
    // Fetch the order from API
    const response = await fetch(`/api/orders/${lastOrderId}`);
    const order = await response.json();
    
    console.log('✅ Order from database:', {
      id: order.id,
      subtotal: order.subtotal,
      servicePrice: order.servicePrice,
      serviceName: order.serviceName,
      total: order.total
    });
    
    // Calculate expected total
    const expectedTotal = order.subtotal + (order.servicePrice || 0);
    console.log('🧮 Expected total (subtotal + service):', expectedTotal);
    console.log('📊 Actual total in database:', order.total);
    
    if (expectedTotal === order.total) {
      console.log('✅✅✅ TOTAL IS CORRECT! No extra fees.');
    } else {
      console.log('❌❌❌ Total mismatch! Difference:', order.total - expectedTotal);
    }
    
    // Check if shipping address exists
    console.log('🏠 Shipping address:', order.shippingAddress ? '✅ Present' : '❌ Missing');
    if (order.shippingAddress) {
      console.log('   Address:', order.shippingAddress.city, order.shippingAddress.state);
    }
    
  } catch (error) {
    console.error('Error verifying order:', error);
  }
})();
