// seed.js
import mongoose from "mongoose";
import slugify from "slugify";
import Brand from "./models/brandModel.js";
import Category from "./models/categoryModel.js";
import SubCategory from "./models/subCategoryModel.js";
import Product from "./models/productModel.js";
import productModel from "./models/productModel.js";

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const seedBrands = async () => {
  await Brand.deleteMany();

  const brands = [
    {
      name: "Apple",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      name: "Samsung",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    },
    {
      name: "Nike",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    },
    {
      name: "Adidas",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    },
    {
      name: "Sony",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    },
  ].map((b) => ({
    ...b,
    slug: `${slugify(b.name, { lower: true })}-${uid()}`,
  }));

  await Brand.insertMany(brands);
};

export const seedCategories = async () => {
  await SubCategory.deleteMany();
  await Category.deleteMany();

  const categories = [
    {
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      subs: ["Mobiles", "Laptops", "Headphones"],
    },
    {
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
      subs: ["Men Clothing", "Shoes", "Accessories"],
    },
  ];

  for (const cat of categories) {
    const category = await Category.create({
      name: `${cat.name} ${uid()}`,
      slug: `${slugify(cat.name, { lower: true })}-${uid()}`,
      image: cat.image,
    });

    await SubCategory.insertMany(
      cat.subs.map((sub) => ({
        name: `${sub} ${uid()}`,
        slug: `${slugify(sub, { lower: true })}-${uid()}`,
        category: category._id,
      }))
    );
  }
};
export const seedProducts = async () => {
  //   await productModel.deleteMany();

  const electronics = await Category.findOne({ slug: /electronics/ });
  const mobiles = await SubCategory.findOne({ slug: /mobiles/ });
  const laptops = await SubCategory.findOne({ slug: /laptops/ });
  const headphones = await SubCategory.findOne({ slug: /headphones/ });

  const apple = await Brand.findOne({ slug: /apple/ });
  const samsung = await Brand.findOne({ slug: /samsung/ });
  const sony = await Brand.findOne({ slug: /sony/ });

  const products = [
    {
      title: "iPhone 15 Pros Max",
      slug: slugify(`iphone-15-pro-max-${Date.now()}`, { lower: true }),
      description:
        "Apple iPhone 15 Pro Max with multiple storage & color options.",
      imageCover: {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      },
      images: [
        { url: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48" },
        { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8" },
      ],
      category: electronics._id,
      subcategory: [mobiles._id],
      brand: apple._id,
      options: [
        { name: "Color", type: "color", values: ["Black", "Silver", "Blue"] },
        { name: "Storage", type: "text", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        {
          attributes: { Color: "Black", Storage: "256GB" },
          price: 1399,
          stock: 50,
          sold: 20,
          images: [
            {
              url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
            },
          ],
        },
        {
          attributes: { Color: "Black", Storage: "512GB" },
          price: 1499,
          stock: 40,
          sold: 15,
          images: [
            {
              url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
            },
          ],
        },
        {
          attributes: { Color: "Silver", Storage: "512GB" },
          price: 1499,
          stock: 30,
          sold: 12,
          images: [
            {
              url: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48",
            },
          ],
        },
        {
          attributes: { Color: "Blue", Storage: "1TB" },
          price: 1699,
          stock: 20,
          sold: 8,
          images: [
            {
              url: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48",
            },
          ],
        },
      ],
      ratingsAverage: 4.9,
      ratingsQuantity: 250,
      isFreeShipping: true,
    },

    {
      title: "Samsung Galaxy S24s Ultra",
      slug: slugify(`galaxy-s24-ultra-${Date.now() + 1}`, { lower: true }),
      description: "Samsung flagship with multiple storage & colors.",
      imageCover: {
        url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
      },
      images: [
        { url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f" },
      ],
      category: electronics._id,
      subcategory: [mobiles._id],
      brand: samsung._id,
      options: [
        { name: "Color", type: "color", values: ["Black", "Green", "Purple"] },
        { name: "Storage", type: "text", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        {
          attributes: { Color: "Black", Storage: "256GB" },
          price: 1199,
          stock: 60,
          sold: 25,
          images: [
            {
              url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
            },
          ],
        },
        {
          attributes: { Color: "Green", Storage: "512GB" },
          price: 1299,
          stock: 40,
          sold: 18,
          images: [
            {
              url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
            },
          ],
        },
        {
          attributes: { Color: "Purple", Storage: "1TB" },
          price: 1499,
          stock: 25,
          sold: 10,
          images: [
            {
              url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
            },
          ],
        },
      ],
      ratingsAverage: 4.8,
      ratingsQuantity: 200,
      isFreeShipping: true,
    },

    {
      title: "MacBook Pro 16a M3",
      slug: slugify(`macbook-pro-16-m3-${Date.now() + 2}`, { lower: true }),
      description: "Apple MacBook Pro 16-inch M3 with RAM & storage variants.",
      imageCover: {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
      },
      images: [
        { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853" },
      ],
      category: electronics._id,
      subcategory: [laptops._id],
      brand: apple._id,
      options: [
        { name: "RAM", type: "text", values: ["16GB", "32GB"] },
        { name: "Storage", type: "text", values: ["512GB", "1TB"] },
      ],
      variants: [
        {
          attributes: { RAM: "16GB", Storage: "512GB" },
          price: 2499,
          stock: 30,
          sold: 10,
          images: [
            {
              url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            },
          ],
        },
        {
          attributes: { RAM: "32GB", Storage: "1TB" },
          price: 2899,
          stock: 20,
          sold: 5,
          images: [
            {
              url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            },
          ],
        },
      ],
      ratingsAverage: 4.9,
      ratingsQuantity: 120,
      isFreeShipping: true,
    },

    {
      title: "Sony WH-1000XMs5 Headphones",
      slug: slugify(`sony-wh-1000xm5-${Date.now() + 3}`, { lower: true }),
      description: "Sony wireless headphones with color and model variants.",
      imageCover: {
        url: "https://images.unsplash.com/photo-1518441902113-fefc6e7c1c45",
      },
      images: [
        { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
      ],
      category: electronics._id,
      subcategory: [headphones._id],
      brand: sony._id,
      options: [
        { name: "Color", type: "color", values: ["Black", "Silver"] },
        { name: "Edition", type: "text", values: ["Standard", "Limited"] },
      ],
      variants: [
        {
          attributes: { Color: "Black", Edition: "Standard" },
          price: 399,
          stock: 70,
          sold: 35,
          images: [
            {
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            },
          ],
        },
        {
          attributes: { Color: "Black", Edition: "Limited" },
          price: 449,
          stock: 40,
          sold: 20,
          images: [
            {
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            },
          ],
        },
        {
          attributes: { Color: "Silver", Edition: "Standard" },
          price: 399,
          stock: 50,
          sold: 25,
          images: [
            {
              url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            },
          ],
        },
      ],
      ratingsAverage: 4.8,
      ratingsQuantity: 150,
      isFreeShipping: true,
    },
  ];

  await productModel.insertMany(products);
};

export const runSeed = async () => {
  await seedProducts();

  await mongoose.disconnect();
};
