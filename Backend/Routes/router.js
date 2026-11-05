const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const products = require('../Models/Products');
const { fetchUser } = require('../middleware/fetchUser');

// Fallback in-memory storage when MongoDB Atlas is disconnected
let localProducts = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. Inserting (Creating) Product for Authenticated User
router.post("/insertproduct", fetchUser, async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;
    const userId = req.user.id;

    if (!ProductName || !ProductPrice || !ProductBarcode) {
        return res.status(400).json({ error: "Please fill in all product fields." });
    }

    try {
        if (isDbConnected()) {
            const pre = await products.findOne({ ProductBarcode: Number(ProductBarcode), userId });
            if (pre) {
                return res.status(422).json("Product is already added with that barcode in your inventory.");
            }
            const addProduct = new products({
                userId,
                ProductName,
                ProductPrice: Number(ProductPrice),
                ProductBarcode: Number(ProductBarcode)
            });
            await addProduct.save();
            return res.status(201).json(addProduct);
        } else {
            const exists = localProducts.some(p => p.userId === userId && String(p.ProductBarcode) === String(ProductBarcode));
            if (exists) {
                return res.status(422).json("Product is already added with that barcode in your inventory.");
            }
            const newProduct = {
                _id: new mongoose.Types.ObjectId().toString(),
                userId,
                ProductName,
                ProductPrice: Number(ProductPrice),
                ProductBarcode: Number(ProductBarcode)
            };
            localProducts.push(newProduct);
            return res.status(201).json(newProduct);
        }
    }
    catch (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// 2. Search Products for Authenticated User
router.get('/search/:key', fetchUser, async (req, res) => {
    const { key } = req.params;
    const userId = req.user.id;

    try {
        const safeKey = (key || '').trim();
        if (isDbConnected()) {
            const regexSafe = safeKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchResults = await products.find({
                userId,
                $or: [
                    { ProductName: { $regex: regexSafe, $options: "i" } },
                    { $expr: { $regexMatch: { input: { $toString: "$ProductBarcode" }, regex: regexSafe } } }
                ]
            });
            return res.status(201).json(searchResults);
        } else {
            const lowerKey = safeKey.toLowerCase();
            const results = localProducts.filter(p =>
                p.userId === userId &&
                ((p.ProductName && p.ProductName.toLowerCase().includes(lowerKey)) ||
                 (p.ProductBarcode && String(p.ProductBarcode).includes(lowerKey)))
            );
            return res.status(201).json(results);
        }
    } catch (err) {
        console.error("Search Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// 3. Getting (Reading) Products for Authenticated User (with optional search)
router.get('/products', fetchUser, async (req, res) => {
    const userId = req.user.id;

    try {
        const { search } = req.query;
        const queryTerm = (search || '').trim();

        if (isDbConnected()) {
            let mongoQuery = { userId };
            if (queryTerm) {
                const regexSafe = queryTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                mongoQuery = {
                    userId,
                    $or: [
                        { ProductName: { $regex: regexSafe, $options: "i" } },
                        { $expr: { $regexMatch: { input: { $toString: "$ProductBarcode" }, regex: regexSafe } } }
                    ]
                };
            }
            const getProducts = await products.find(mongoQuery).sort({ createdAt: -1 });
            return res.status(201).json(getProducts);
        } else {
            let results = localProducts.filter(p => p.userId === userId);
            if (queryTerm) {
                const lowerTerm = queryTerm.toLowerCase();
                results = results.filter(p =>
                    (p.ProductName && p.ProductName.toLowerCase().includes(lowerTerm)) ||
                    (p.ProductBarcode && String(p.ProductBarcode).includes(lowerTerm))
                );
            }
            return res.status(201).json(results);
        }
    }
    catch (err) {
        console.error("Get Products Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// 4. Getting (Reading) Single Product for Authenticated User
router.get('/products/:id', fetchUser, async (req, res) => {
    const userId = req.user.id;

    try {
        if (isDbConnected()) {
            const getProduct = await products.findOne({ _id: req.params.id, userId });
            if (!getProduct) {
                return res.status(404).json({ error: "Product not found in your inventory." });
            }
            return res.status(201).json(getProduct);
        } else {
            const found = localProducts.find(p => String(p._id) === String(req.params.id) && p.userId === userId);
            if (!found) {
                return res.status(404).json({ error: "Product not found in your inventory." });
            }
            return res.status(201).json(found);
        }
    }
    catch (err) {
        console.error("Get Single Product Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// 5. Editing (Updating) Product for Authenticated User
router.put('/updateproduct/:id', fetchUser, async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;
    const userId = req.user.id;

    try {
        if (isDbConnected()) {
            const updateProducts = await products.findOneAndUpdate(
                { _id: req.params.id, userId },
                { ProductName, ProductPrice: Number(ProductPrice), ProductBarcode: Number(ProductBarcode) },
                { new: true }
            );
            if (!updateProducts) {
                return res.status(404).json({ error: "Product not found in your inventory." });
            }
            return res.status(201).json(updateProducts);
        } else {
            const index = localProducts.findIndex(p => String(p._id) === String(req.params.id) && p.userId === userId);
            if (index === -1) {
                return res.status(404).json({ error: "Product not found in your inventory." });
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
        console.error("Update Product Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// 6. Deleting Product for Authenticated User
router.delete('/deleteproduct/:id', fetchUser, async (req, res) => {
    const userId = req.user.id;

    try {
        if (isDbConnected()) {
            const deleteProduct = await products.findOneAndDelete({ _id: req.params.id, userId });
            if (!deleteProduct) {
                return res.status(404).json({ error: "Product not found in your inventory." });
            }
            return res.status(201).json(deleteProduct);
        } else {
            const index = localProducts.findIndex(p => String(p._id) === String(req.params.id) && p.userId === userId);
            if (index === -1) {
                return res.status(404).json({ error: "Product not found in your inventory." });
            }
            const deleted = localProducts.splice(index, 1)[0];
            return res.status(201).json(deleted);
        }
    }
    catch (err) {
        console.error("Delete Product Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
