const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const products = require('../Models/Products');

// Fallback in-memory storage when MongoDB Atlas is disconnected (e.g. IP whitelist)
let localProducts = [
    {
        _id: "6aeb2c055c2ab139e2f911cd",
        ProductName: "new cream",
        ProductPrice: 180,
        ProductBarcode: 12182
    },
    {
        _id: "6aeb2c265c2ab139e2f911d2",
        ProductName: "Socks",
        ProductPrice: 80,
        ProductBarcode: 8514
    },
    {
        _id: "6aeb2cb95c2ab139e2f911d7",
        ProductName: "Shoes",
        ProductPrice: 499,
        ProductBarcode: 8090
    },
    {
        _id: "6aeb2cd35c2ab139e2f911dc",
        ProductName: "Book",
        ProductPrice: 180,
        ProductBarcode: 3645
    }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

//Inserting(Creating) Data:
router.post("/insertproduct", async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;

    try {
        if (isDbConnected()) {
            const pre = await products.findOne({ ProductBarcode: ProductBarcode })
            if (pre) {
                return res.status(422).json("Product is already added.")
            }
            const addProduct = new products({ ProductName, ProductPrice, ProductBarcode })
            await addProduct.save();
            return res.status(201).json(addProduct)
        } else {
            const exists = localProducts.some(p => String(p.ProductBarcode) === String(ProductBarcode));
            if (exists) {
                return res.status(422).json("Product is already added.");
            }
            const newProduct = {
                _id: new mongoose.Types.ObjectId().toString(),
                ProductName,
                ProductPrice: Number(ProductPrice),
                ProductBarcode: Number(ProductBarcode)
            };
            localProducts.push(newProduct);
            return res.status(201).json(newProduct);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//Search Data:
router.get('/search/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const safeKey = (key || '').trim().toLowerCase();
        if (isDbConnected()) {
            const regexSafe = safeKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchResults = await products.find({
                $or: [
                    { ProductName: { $regex: regexSafe, $options: "i" } },
                    { $expr: { $regexMatch: { input: { $toString: "$ProductBarcode" }, regex: regexSafe } } }
                ]
            });
            return res.status(201).json(searchResults);
        } else {
            const results = localProducts.filter(p =>
                (p.ProductName && p.ProductName.toLowerCase().includes(safeKey)) ||
                (p.ProductBarcode && String(p.ProductBarcode).includes(safeKey))
            );
            return res.status(201).json(results);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

//Getting(Reading) Data:
router.get('/products', async (req, res) => {
    try {
        const { search } = req.query;
        const queryTerm = (search || '').trim().toLowerCase();

        if (isDbConnected()) {
            let mongoQuery = {};
            if (queryTerm) {
                const regexSafe = queryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                mongoQuery = {
                    $or: [
                        { ProductName: { $regex: regexSafe, $options: "i" } },
                        { $expr: { $regexMatch: { input: { $toString: "$ProductBarcode" }, regex: regexSafe } } }
                    ]
                };
            }
            const getProducts = await products.find(mongoQuery);
            return res.status(201).json(getProducts);
        } else {
            let results = localProducts;
            if (queryTerm) {
                results = localProducts.filter(p =>
                    (p.ProductName && p.ProductName.toLowerCase().includes(queryTerm)) ||
                    (p.ProductBarcode && String(p.ProductBarcode).includes(queryTerm))
                );
            }
            return res.status(201).json(results);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//Getting(Reading) individual Data:
router.get('/products/:id', async (req, res) => {
    try {
        if (isDbConnected()) {
            const getProduct = await products.findById(req.params.id);
            return res.status(201).json(getProduct);
        } else {
            const found = localProducts.find(p => String(p._id) === String(req.params.id));
            if (!found) {
                return res.status(404).json({ error: "Product not found" });
            }
            return res.status(201).json(found);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//Editing(Updating) Data:
router.put('/updateproduct/:id', async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;

    try {
        if (isDbConnected()) {
            const updateProducts = await products.findByIdAndUpdate(req.params.id, { ProductName, ProductPrice, ProductBarcode }, { new: true });
            return res.status(201).json(updateProducts);
        } else {
            const index = localProducts.findIndex(p => String(p._id) === String(req.params.id));
            if (index === -1) {
                return res.status(404).json({ error: "Product not found" });
            }
            localProducts[index] = {
                ...localProducts[index],
                ProductName,
                ProductPrice: Number(ProductPrice),
                ProductBarcode: Number(ProductBarcode)
            };
            return res.status(201).json(localProducts[index]);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})

//Deleting Data:
router.delete('/deleteproduct/:id', async (req, res) => {
    try {
        if (isDbConnected()) {
            const deleteProduct = await products.findByIdAndDelete(req.params.id);
            return res.status(201).json(deleteProduct);
        } else {
            const index = localProducts.findIndex(p => String(p._id) === String(req.params.id));
            if (index === -1) {
                return res.status(404).json({ error: "Product not found" });
            }
            const deleted = localProducts.splice(index, 1)[0];
            return res.status(201).json(deleted);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
})


module.exports = router;