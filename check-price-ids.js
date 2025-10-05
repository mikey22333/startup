// Run this in browser console on your pricing page to check price IDs

console.log('🔍 Paddle Price ID Environment Check\n');

// Your current price IDs
const priceIds = {
  'Pro Monthly': process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || 'pri_01k4f550jy8e15dy74nzt6yq5x',
  'Pro Yearly': process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || 'pri_01k4f5cr5sz7ev95b8yt7jtrf4',
  'Pro+ Monthly': process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_MONTHLY_PRICE_ID || 'pri_01k4f6cjrdkvkrsdve2dmaff3s',
  'Pro+ Yearly': process.env.NEXT_PUBLIC_PADDLE_PRO_PLUS_YEARLY_PRICE_ID || 'pri_01k4f6nftvpnkhhsmjwrdc2wrt'
};

console.log('Current Price IDs:');
Object.entries(priceIds).forEach(([name, id]) => {
  console.log(`  ${name}: ${id}`);
});

console.log('\n📋 Next Steps:\n');
console.log('1. Open Paddle Production Dashboard:');
console.log('   https://vendors.paddle.com/catalog/prices\n');

console.log('2. Search for each price ID above\n');

console.log('3. If NOT FOUND in production:');
console.log('   ❌ These are SANDBOX price IDs');
console.log('   ✅ You need to create production prices\n');

console.log('4. If FOUND in production:');
console.log('   ✅ Price IDs are correct');
console.log('   ⚠️  Look for other issues (webhook config, etc.)\n');
