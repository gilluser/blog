const methodOverride = require('method-override');
const express = require('express');

const ejs = require('ejs');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Post = require('./models/blog')
const ObjectId = mongoose.Types.ObjectId;


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
  next();
});
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose.connect('mongodb://127.0.0.1:27017/mycollection', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


let blogPosts = [
  {
    title: 'First Post',
    content: 'This is the content of the first post.',
    image: 'https://img.freepik.com/free-photo/worker-reading-news-with-tablet_1162-83.jpg?w=740&t=st=1702879653~exp=1702880253~hmac=fb1ca48f23fcbd46bba1569943b2bd06dff00c19eeeed0b044a32c6ed5eeebdb'
  },
  {
    title: 'Second Post',
    content: 'This is the content of the second post.',
    image:'https://plus.unsplash.com/premium_photo-1661475877403-ce2e772fea2e?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

app.get('/', async(req, res) => {


  try {
    const posts = await Post.find(); // Fetch all posts from the database
    res.render('blog', { posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//  for specific post
app.get('/blog/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.render('post', { post });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// for admin panel
app.get('/admin', async(req, res) => {
  
  
    try {
      const posts = await Post.find(); // Fetch all posts from the database
      res.render('admin', { posts: posts });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  
  });


// add post in admin panel
  app.post('/add-post', upload.single('image'), async (req, res) => {
    try {
      const { title, content, metatitle, metadescription, slug } = req.body;
      const image = req.file.buffer.toString('base64');
      
      // Update the database using MongoDB operations
      const createdPost = await Post.create({ title, content, image, metatitle, metadescription, slug });
  
      // Update the local blogPosts array
      blogPosts.push(createdPost);
  
      res.redirect('/admin');
    } catch (error) {
      console.error(error); // Log the error to the console
      res.status(500).json({ error: error.message });
    }
  });
  
  // update post in admin panel
  app.post('/update-post/:id', upload.single('image'), async(req, res) => {
    try{
     
      const id = req.params.id;
      const { title, content, metatitle, metadescription, slug} = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid post ID');
      }
  
      // Find the post by ID and update it
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { title, content, metatitle, metadescription, slug },
        { new: true }
      );
  
      if (!updatedPost) {
        return res.status(404).send('Post not found');
      }
  
      res.redirect('/admin');
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }

  });
  
//   app.get('/delete-post/:id', async(req, res) => {
//     const postId = req.params.id;

//   try {
//     const deletedPost = await Post.findByIdAndDelete(postId);

//     if (!deletedPost) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     return res.status(200).json({ message: 'Post deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// delete post in admin panel
app.delete('/delete-post/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
