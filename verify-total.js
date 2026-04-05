// Run this in browser console after placing an order
console.log('🔍 Verifying order total calculation:');

// Check what's in the cart
const cartItems = JSON.parse(localStorage.getItem('cart-storage') || '{}');
console.log('Cart items:', cartItems);

// Calculate manually
let itemsTotal = 0;
if (cartItems.state && cartItems.state.items) {
  itemsTotal = cartItems.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  console.log('Items subtotal:', itemsTotal);
}

// Check for service in sessionStorage
const lastOrderId = sessionStorage.getItem('lastOrderId');
console.log('Last order ID:', lastOrderId);

// Fetch the actual order to verify
if (lastOrderId) {
  fetch(`/api/orders/${lastOrderId}`)
    .then(res => res.json())
    .then(order => {
      console.log('✅ Order from database:', {
        id: order.id,
        subtotal: order.subtotal,
        servicePrice: order.servicePrice,
        total: order.total,
        hasService: order.hasService
      });
      
      const calculatedTotal = order.subtotal + (order.servicePrice || 0);
      console.log('Calculated total:', calculatedTotal);
      console.log('Match:', calculatedTotal === order.total ? '✅ YES' : '❌ NO');
    })
    .catch(err => console.error('Error fetching order:', err));
}
