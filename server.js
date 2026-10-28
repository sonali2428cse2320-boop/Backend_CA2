
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/libraryDB')
  .then(() => {
    console.log('MongoDB Connected');

    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => console.log('MongoDB Error:', err));

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true }
});

const Book = mongoose.model('Book', bookSchema);

// 1. Add a new book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, category } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const book = await Book.create({
      title,
      author,
      category
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get books with pagination
app.get('/api/books', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit) || 10)
    );

    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update book availability
app.patch('/api/books/:id', async (req, res) => {
  try {
    if (typeof req.body.available !== 'boolean') {
      return res.status(400).json({
        message: 'Available must be true or false'
      });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});