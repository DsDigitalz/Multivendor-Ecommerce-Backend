import mongoose from 'mongoose';
import { env } from '../config/env.config';
import { ROLES, VENDOR_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../config/constants';
import { hashPassword } from '../utils/password.util';
import { UserModel } from '../modules/users/users.model';
import { VendorModel } from '../modules/vendors/vendors.model';
import { CategoryModel } from '../modules/categories/categories.model';
import { ProductModel } from '../modules/products/products.model';
import { OrderModel } from '../modules/orders/orders.model';
import { PaymentModel } from '../modules/payments/payments.model';
import { ReviewModel } from '../modules/reviews/reviews.model';
import { CartModel } from '../modules/cart/cart.model';
import { WishlistModel } from '../modules/wishlist/wishlist.model';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected.');

    console.log('🧹 Purging existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      VendorModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      ProductModel.deleteMany({}),
      OrderModel.deleteMany({}),
      PaymentModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      CartModel.deleteMany({}),
      WishlistModel.deleteMany({}),
    ]);

    const defaultPassword = await hashPassword('Password123!');

    console.log('👤 Creating demo accounts...');
    // 1. Admin
    const admin = await UserModel.create({
      name: 'Platform Administrator',
      email: 'admin@demo.com',
      password: defaultPassword,
      role: ROLES.ADMIN,
      phone: '+1 (555) 019-2831',
      isEmailVerified: true,
    });

    // 2. Vendor
    const vendorUser = await UserModel.create({
      name: 'Alex Vance (Vendor)',
      email: 'vendor@demo.com',
      password: defaultPassword,
      role: ROLES.VENDOR,
      phone: '+1 (555) 019-2832',
      isEmailVerified: true,
    });

    // 3. Customer
    const customer = await UserModel.create({
      name: 'Sarah Connor',
      email: 'customer@demo.com',
      password: defaultPassword,
      role: ROLES.CUSTOMER,
      phone: '+1 (555) 019-2833',
      isEmailVerified: true,
      addresses: [
        {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          country: 'USA',
          postalCode: '97477',
          isDefault: true,
        },
      ],
    });

    console.log('🏪 Creating Vendor Store...');
    const vendorStore = await VendorModel.create({
      userId: vendorUser._id,
      storeName: 'ElectroTech Official',
      slug: 'electrotech-official',
      description: 'Premier authorized distributor for premium electronics, audio gear, and computing hardware.',
      contactEmail: 'sales@electrotech.com',
      phone: '+1 (555) 987-6543',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
      status: VENDOR_STATUS.APPROVED,
      commissionRate: 10,
      payoutDetails: {
        bankName: 'Silicon Valley Commercial Bank',
        accountNumber: '****9941',
        accountHolderName: 'ElectroTech LLC',
      },
    });

    console.log('📁 Creating Categories...');
    const catLaptops = await CategoryModel.create({
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High-performance laptops, ultrabooks, and desktop computing hardware',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      isActive: true,
    });

    const catAudio = await CategoryModel.create({
      name: 'Audio & Wearables',
      slug: 'audio-wearables',
      description: 'Wireless noise-cancelling headphones, earbuds, and smartwatch fitness trackers',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      isActive: true,
    });

    const catMobile = await CategoryModel.create({
      name: 'Smartphones & Tablets',
      slug: 'smartphones-tablets',
      description: 'Latest generation smartphones, 5G devices, and productivity tablets',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      isActive: true,
    });

    console.log('📦 Creating Seed Products...');
    const productHeadphones = await ProductModel.create({
      vendorId: vendorStore._id,
      categoryId: catAudio._id,
      name: 'AcousticPro Studio Wireless Noise-Cancelling Headphones',
      slug: 'acousticpro-studio-wireless-headphones',
      description: 'Audiophile-grade 45mm neodymium drivers, active hybrid noise cancellation (ANC), 40 hours continuous playback with ultra-low latency wireless audio.',
      price: 249.99,
      salePrice: 199.99,
      sku: 'AUD-ACPR-001',
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
      ratingAverage: 4.9,
      reviewCount: 1,
      isActive: true,
    });

    const productLaptop = await ProductModel.create({
      vendorId: vendorStore._id,
      categoryId: catLaptops._id,
      name: 'Zenith Pro 16-inch M3 32GB RAM 1TB SSD',
      slug: 'zenith-pro-16-inch-m3-laptop',
      description: 'Next-generation powerhouse workstation featuring mini-LED liquid display, all-day 22-hour battery life, and high-performance hardware accelerated ray tracing.',
      price: 1899.99,
      salePrice: 1749.99,
      sku: 'LAP-ZN16-002',
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      ],
      ratingAverage: 0,
      reviewCount: 0,
      isActive: true,
    });

    const productPhone = await ProductModel.create({
      vendorId: vendorStore._id,
      categoryId: catMobile._id,
      name: 'Nova Titan 5G Smartphone 256GB Sapphire Blue',
      slug: 'nova-titan-5g-smartphone-256gb',
      description: 'Aerospace-grade titanium frame with 200MP camera system, 120Hz LTPO AMOLED display, and Qualcomm Snapdragon 8 Gen 3 flagship processor.',
      price: 999.99,
      sku: 'PHN-NVTT-003',
      stock: 45,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      ],
      ratingAverage: 0,
      reviewCount: 0,
      isActive: true,
    });

    const productWatch = await ProductModel.create({
      vendorId: vendorStore._id,
      categoryId: catAudio._id,
      name: 'Apex Horizon Ultra Smartwatch GPS + Cellular',
      slug: 'apex-horizon-ultra-smartwatch',
      description: 'Rugged titanium adventure smartwatch with precision dual-frequency GPS, ECG cardiac sensor, depth gauge, and 72-hour battery life.',
      price: 349.99,
      salePrice: 299.99,
      sku: 'WRB-APEX-004',
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      ],
      ratingAverage: 0,
      reviewCount: 0,
      isActive: true,
    });

    console.log('🛍️ Creating Sample Seed Order...');
    const orderNumber = `ORD-DEMO-${Date.now().toString().slice(-6)}`;
    const subTotal = 199.99;
    const commissionAmount = 20.0;
    const vendorEarnings = 179.99;

    const sampleOrder = await OrderModel.create({
      orderNumber,
      customerId: customer._id,
      subOrders: [
        {
          vendorId: vendorStore._id,
          items: [
            {
              productId: productHeadphones._id,
              name: productHeadphones.name,
              price: 199.99,
              quantity: 1,
            },
          ],
          subTotal,
          commissionRate: 10,
          commissionAmount,
          vendorEarnings,
          status: ORDER_STATUS.DELIVERED,
          trackingNumber: 'TRK-USPS-982148201',
        },
      ],
      shippingAddress: customer.addresses[0],
      totalAmount: 199.99,
      orderStatus: ORDER_STATUS.DELIVERED,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: 'stripe',
    });

    await PaymentModel.create({
      orderId: sampleOrder._id,
      customerId: customer._id,
      amount: 199.99,
      currency: 'USD',
      status: PAYMENT_STATUS.PAID,
      paymentMethod: 'stripe',
      transactionId: `TXN-DEMO-${Date.now().toString().slice(-6)}`,
    });

    console.log('⭐ Creating Sample Verified Review...');
    await ReviewModel.create({
      productId: productHeadphones._id,
      userId: customer._id,
      rating: 5,
      comment: 'Exceptional build quality and audio fidelity. Hybrid ANC cancels all office noise. Worth every dollar!',
      isVerifiedPurchase: true,
    });

    console.log('❤️ Creating Sample Customer Wishlist...');
    await WishlistModel.create({
      userId: customer._id,
      products: [productLaptop._id, productWatch._id],
    });

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🔐 DEMO CREDENTIALS:');
    console.log('------------------------------------------------------');
    console.log('👑 Admin Account:');
    console.log('   Email:    admin@demo.com');
    console.log('   Password: Password123!');
    console.log('\n🏬 Vendor Account:');
    console.log('   Email:    vendor@demo.com');
    console.log('   Password: Password123!');
    console.log('   Store:    ElectroTech Official (slug: electrotech-official)');
    console.log('\n🛒 Customer Account:');
    console.log('   Email:    customer@demo.com');
    console.log('   Password: Password123!');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
