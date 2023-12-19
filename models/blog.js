const mongoose = require('mongoose');

// Define the schema for the blog post
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  metatitle: { type: String, required: true },
  metadescription: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);



module.exports = Post;