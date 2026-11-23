import { logger } from "../src/config/logger.js";
import { restaurantsData } from "../src/modules/restaurants/restaurants.data.js";

async function runSeed() {
  logger.info(
    { count: restaurantsData.length },
    "Day 1 seed check (in-memory dataset ready)",
  );
  console.table(
    restaurantsData.map(({ id, name, city, rating, isOpen }) => ({
      id,
      name,
      city,
      rating,
      isOpen,
    })),
  );
  logger.info("Replace this script with Supabase inserts on Day 2.");
}

runSeed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
