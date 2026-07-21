// scripts/checkAndSeedProducts.js
// Run: node scripts/checkAndSeedProducts.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Product from '../src/models/productModel.js';

const CATEGORIES = ['Men', 'Women', 'Kids'];
const SUB_CATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SEED_TARGET = 200;

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('DB connected');

    const count = await Product.countDocuments();
    console.log(`Current product count: ${count}`);

    if (count >= SEED_TARGET) {
        console.log(`Already have ${count} products — no seeding needed.`);
        await mongoose.disconnect();
        return;
    }

    const needed = SEED_TARGET - count;
    console.log(`Seeding ${needed} products to reach ${SEED_TARGET}...`);

    const docs = [];
    for (let i = 0; i < needed; i++) {
        const cat = CATEGORIES[i % CATEGORIES.length];
        const sub = SUB_CATEGORIES[i % SUB_CATEGORIES.length];
        const sizes = SIZES.slice(0, 3 + (i % 3));
        const inventory = {};
        sizes.forEach(s => { inventory[s] = { stock: 100, available: true }; });

        docs.push({
            name: `Seed Product ${count + i + 1} — ${cat} ${sub}`,
            description: `Auto-seeded product for benchmark testing. Category: ${cat}, SubCategory: ${sub}.`,
            price: 299 + (i % 700),
            category: cat,
            subCategory: sub,
            sizes,
            inventory,
            bestseller: i % 5 === 0,
            date: Date.now() - i * 1000,
            image1: 'https://via.placeholder.com/400',
            image2: 'https://via.placeholder.com/400',
            image3: 'https://via.placeholder.com/400',
            image4: 'https://via.placeholder.com/400',
        });
    }

    // Insert in batches of 50
    for (let i = 0; i < docs.length; i += 50) {
        await Product.insertMany(docs.slice(i, i + 50));
        console.log(`  Inserted batch ${Math.floor(i / 50) + 1} (${Math.min(i + 50, docs.length)}/${needed})`);
    }

    const finalCount = await Product.countDocuments();
    console.log(`Done. Total products in DB: ${finalCount}`);
    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
