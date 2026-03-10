/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js
 */

const SUPABASE_URL = "https://uxdiipqxujzbzfizbhic.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "REDACTED_KEY"; // Get from Supabase Dashboard > Settings > API

const adminData = {
  email: "REDACTED_EMAIL",
  password: "REDACTED_PASSWORD"
};

async function createAdmin() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-admin-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log(result);
    } else {
      console.error('❌ Failed to create admin user:');
      console.error(result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
