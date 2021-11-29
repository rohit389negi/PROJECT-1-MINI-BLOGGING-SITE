const express = require('express');

const router = express.Router();
const authorController=require('../controller/authorController')
const blogController=require('../controller/blogController')
const middleware=require('../middleware/middleware')
router.get('/test-me', function (req, res) {
    res.send('My first ever api!')
});


// create Author API
router.post('/authors',authorController.createAuthor )
// Create Blog API
router.post('/blogs', blogController.createBlog )
// get blog API
router.get('/blogs', blogController.getBlog  )
module.exports = router;