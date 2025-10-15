const mongoose = require('mongoose');
const Product = require('./models/Product');
const { MONGO_URI } = require('./config');

const products = [
  {
    name: "Pista Biscuit",
    category: "Flavored Biscuits",
    price: 50,
    description: "Crunchy pista-flavored biscuits",
    imageUrl: "https://i.imgur.com/HGXKX9A.jpg"
  },
  {
    name: "Badam Biscuit",
    category: "Flavored Biscuits",
    price: 55,
    description: "Delicious almond flavored biscuits",
    imageUrl: "https://i.imgur.com/pZOXeoh.jpg"
  },
  {
    name: "Coconut Biscuit",
    category: "Flavored Biscuits",
    price: 45,
    description: "Tasty coconut flavored biscuits",
    imageUrl: "https://i.imgur.com/3qNfscj.jpg"
  },
  {
    name: "Strawberry Biscuit",
    category: "Flavored Biscuits",
    price: 60,
    description: "Sweet strawberry flavored biscuits",
    imageUrl: "https://i.imgur.com/Va0lfml.jpg"
  },
  {
    name: "Butter Murukku",
    category: "Murukku",
    price: 70,
    description: "Classic crispy butter murukku",
    imageUrl: "https://i.imgur.com/SQxYSef.jpg"
  },
  {
    name: "Garlic Murukku",
    category: "Murukku",
    price: 75,
    description: "Garlic infused crunchy murukku",
    imageUrl: "https://i.imgur.com/Mo9HEPU.jpg"
  },
  {
    name: "Achu Murukku",
    category: "Murukku",
    price: 65,
    description: "Traditional arch shaped murukku",
    imageUrl: "https://i.imgur.com/CNkNwXo.jpg"
  },
  {
    name: "Kai Murukku",
    category: "Murukku",
    price: 70,
    description: "Handmade kai murukku with perfect crunch",
    imageUrl: "https://i.imgur.com/5RUxuTV.jpg"
  }
];

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
  console.log('MongoDB connected');

  // Clear existing products
  await Product.deleteMany({});
  console.log('Existing products cleared.');

  // Insert new products
  await Product.insertMany(products);
  console.log('Products seeded.');

  process.exit();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
