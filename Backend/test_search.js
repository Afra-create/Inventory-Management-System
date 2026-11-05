const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.Mongo_url);
    const Products = require('./Models/Products');
    const all = await Products.find({});
    console.log('Total products:', all.length);
    if (all.length > 0) {
        console.log('Sample product:', all[0]);
    }
    const search = 'a';
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const res = await Products.find({
        $or: [
            { ProductName: { $regex: safeSearch, $options: 'i' } },
            { $expr: { $regexMatch: { input: { $toString: "$ProductBarcode" }, regex: safeSearch } } }
        ]
    });
    console.log(`Search results for "${search}":`, res.length);
    await mongoose.disconnect();
}

test().catch(console.error);

