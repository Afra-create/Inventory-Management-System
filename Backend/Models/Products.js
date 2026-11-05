const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: false
        },
        ProductName: {
            type: String,
            required: true,
        },
        ProductPrice: {
            type: Number,
            required: true,
        },
        ProductBarcode: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Products = mongoose.model("Products", ProductSchema)
module.exports = Products;
