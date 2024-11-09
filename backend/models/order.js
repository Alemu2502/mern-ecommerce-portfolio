import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema;

// Schema for items in the shopping cart
const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    count: Number
  },
  { timestamps: true }
);

const CartItem = mongoose.model('CartItem', CartItemSchema);

// Schema for orders
const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema],
    transaction_id: {},
    amount: { type: Number },
    address: String,
    status: {
      type: String,
      default: 'Not processed',
      enum: ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] // enum defines possible status values
    },
    updated: Date,
    user: { type: ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

// Exporting the models
export { Order, CartItem };
