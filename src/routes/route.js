const express = require('express');
const router = express.Router();

const authorController=require('../controllers/authorController')
const blogController=require('../controllers/blogController')
const middleware=require('../middlewares/authorisation')

router.post('/authors', authorController.createAuthor )
router.post('/login', authorController.login)
router.post('/blogs', middleware.authorisation, blogController.createBlog )
router.get('/filterblogs', middleware.authorisation, blogController.getBlog  )
router.put('/blogs/:blogId', middleware.authorisation, blogController.updateBlog)
router.delete('/blogs/:blogId', middleware.authorisation, blogController.deleteBlogByID)
router.delete('/blogs', middleware.authorisation, blogController.deleteBlogByParams)

module.exports = router;   