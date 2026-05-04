import db from "./Config/DatabaseCon.js";

console.log("🔍 Fetching all services and subservices from database...\n");

// Fetch all services
db.query("SELECT * FROM service_categories ORDER BY category_name", (err, services) => {
  if (err) {
    console.error("❌ Error fetching services:", err);
    process.exit(1);
  }

  console.log("=" .repeat(80));
  console.log("📋 SERVICES (service_categories table)");
  console.log("=" .repeat(80));
  console.log(`Total Services: ${services.length}\n`);

  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.category_name}`);
    console.log(`   ID: ${service.category_id}`);
    console.log(`   Description: ${service.description}`);
    console.log(`   Icon URL: ${service.icon_url}`);
    console.log(`   Active: ${service.is_active ? 'Yes' : 'No'}`);
    console.log(`   Created: ${service.created_at}`);
    console.log("");
  });

  // Fetch all subservices
  db.query("SELECT * FROM subservices_master ORDER BY subservice_name", (err, subservices) => {
    if (err) {
      console.error("❌ Error fetching subservices:", err);
      process.exit(1);
    }

    console.log("=" .repeat(80));
    console.log("📋 SUBSERVICES (subservices_master table)");
    console.log("=" .repeat(80));
    console.log(`Total Subservices: ${subservices.length}\n`);

    subservices.forEach((subservice, index) => {
      const categoryIds = Array.isArray(subservice.category_ids) 
        ? subservice.category_ids 
        : JSON.parse(subservice.category_ids || '[]');
      
      // Find category names
      const categoryNames = categoryIds.map(catId => {
        const service = services.find(s => s.category_id === catId);
        return service ? service.category_name : `Unknown (${catId})`;
      });

      console.log(`${index + 1}. ${subservice.subservice_name}`);
      console.log(`   ID: ${subservice.id}`);
      console.log(`   Description: ${subservice.description || 'N/A'}`);
      console.log(`   Icon URL: ${subservice.icon_url}`);
      console.log(`   Active: ${subservice.is_active ? 'Yes' : 'No'}`);
      console.log(`   Category IDs: [${categoryIds.join(', ')}]`);
      console.log(`   Categories: ${categoryNames.join(', ')}`);
      console.log(`   Created: ${subservice.created_at}`);
      console.log("");
    });

    console.log("=" .repeat(80));
    console.log("✅ Data fetch complete!");
    console.log("=" .repeat(80));

    // Close database connection
    db.end();
  });
});
