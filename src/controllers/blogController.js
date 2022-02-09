// title: {mandatory}, body: {mandatory}, authorId: {mandatory, refs to author model}, 
// tags: {array of string},examples: [technology, entertainment, life style, food, fashion]}, 
// category: {string, mandatory,
// subcategory: {array of string,examples[technology-[web development, mobile development, AI, ML etc]] }, 
// deletedAt: {when the document is deleted}, 
// isDeleted: {boolean, default: false}, 
// publishedAt: {when the blog is published}, 
// isPublished: {boolean, default: false}}

const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const isValid = function(value){
    if(typeof value == 'undefined' || value == null) return false
    if(typeof value == 'string' && value.trim().length == 0) return false
    return true
}
const isValidRequestBody = function(value){
    return Object.keys(value).length > 0
}
const isValidObjectId = function(value){
    return ObjectId(value)
}

//Make sure the authorId is a valid authorId by checking the author exist in the authors collection.
// POST /blogs
const createBlog = async function(res,res){
    try{
        const requestBody = req.body
        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status: false, message: 'request body not found'})
        }
        const {title, body, authorId, tags, category, subcategory} = requestBody
        if(!isValid(title)){
            return res.status(400).send({status: false, message: 'Blog Title is required'})
        }
        if(!isValid(body)){
            return res.status(400).send({status: false, message: 'Blog body is required'})
        }
        if(!isValid(authorId)){
            return res.status(400).send({status: false, message: 'AuthorId is required'})
        }
        if(!isValidObjectId(authorId)){
            return res.status(400).send({status: false, message: `${authorId} is not a valid author id`})
        }
        if(!isValid(category)){
            return res.status(400).send({status: false, message: 'Blog category is required'})
        }
        const authorFound = await authorModel.findOne({_id:authorId})
        if(!authorFound){
            return res.status(400).send({status: false, message: `Author not found`})
        }
        const data = {title, body, authorId, category}
        if(tags) {
            if(Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === "[object String]") {
                blogData['tags'] = [ tags ]
            }
        }
        if(subcategory) {
            if(Array.isArray(subcategory)) {
                data['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === "[object String]") {
                data['subcategory'] = [ subcategory ]
            }
        }
        const blog = await blogModel.create(data)
        return res.status(201).send({status:true, message:'Blog created successfully', data:blog})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// Returns all blogs in the collection that aren't deleted and are published
// Filter blogs list by applying filters. Query param can have any combination of below filters.
// 1.By author Id
// 2.By category
// 3.List of blogs that have a specific tag
// 4.List of blogs that have a specific subcategory example of a query

//GET /blogs
const getBlogs = async function(req, res){
    try{
        const filterBlogs = {isDeleted:false, isPublished: true}
        const requestQuery = req.query
        const {authorId, category, tags, subcategory} = requestQuery
        if(isValid(authorId) && isValidObjectId(authorId)){
            filterBlogs.authorId = authorId
        }  
        if(isValid(category)){
            filterBlogs.category = category
        }
        if(isValid(tags)){
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterBlogs.tags = {$all: tagsArr}
        }
        if(isValid(subcategory)){
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterBlogs.subcategory = {$all: subcatArr}
        }
        const blogData = await blogModel.find(filterBlogs)
        if(blogData.length===0) {
            return res.status(404).send({status: false, message: 'No blog found'})
        }
        return res.status(200).send({status:true, message:'Blog found', data:blogData})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

// Updates a blog by changing its title, body, adding tags, adding a subcategory. 
// Updates a blog by changing its publish status i.e. adds publishedAt date and set published to true
// Check if the blogId exists (must have isDeleted false).

//PUT /blogs/:blogId
const updateBlog = async function (req,res){
    try{
        const requestBody = req.body
        const blogId = req.params.blogId
        if(!isValidRequestBody(requestBody)){
            return
        }
        if(!isValidObjectId(blogId)){
            return res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
        }
        if(!isValidObjectId(req.authorId)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
            return
        }
        const blogFound = await blogModel.findOne({_id:blogId, isDeleted:false})
        if(!blogFound){
            return
        }
        if(blogFound.authorId.toString() !== req.authorId) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
            return
        }
        const {title, body, tags, subcategory} = requestBody
    //    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        return res.status(200).send({status:true, message:'blog updated successfully', })   
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//Check if the blogId exists and is not deleted. If it does, mark it deleted
//DELETE /blogs/:blogId
const deleteBlog = async function(req,res){
    try{
        const blogId = req.params.blogId
        if(!isValidObjectId(blogId)){
            return res.status(400).send({status: false, message: `${blogId} is not a valid blog id`})
        }
        if(!isValidObjectId(req.authorId)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
            return
        }
        const blog = await blogModel.findOneAndUpdate({_id:blogId, isDeleted:false}, {isDeleted:true}, {new:true})
        if(!blog){
            return res.status(404).send({status:false, message:'blog not found'})
        }
        if(blog.authorId.toString() !== req.authorId) {
            res.status(401).send({status: false, message: `Unauthorized access! Owner info doesn't match`});
            return
        }
        return res.status(200).send({status:true, message:'Blog deleted successfully'})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//Delete blog documents by category, authorid, tag name, subcategory name, unpublished
//DELETE /blogs?queryParams
const deleteBlogByQuery = async function (req,res){
    try{
        const requestQuery = req.query
        const {category, authorId, tags, subcategory, isPublished} = requestQuery
        filterBlogs = {isDeleted:false}
        if(!isValidObjectId(req.authorId)) {
            res.status(400).send({status: false, message: `${authorIdFromToken} is not a valid token id`})
            return
        }
        if(isValid(authorId) && isValidObjectId(authorId)) {
            filterBlogs.authorId = authorId
        }
        if(isValid(category)) {
            filterBlogs.category = category
        }
        if(isValid(isPublished)) {
            filterBlogs.isPublished = isPublished
        }
        if(isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterBlogs.tags = {$all: tagsArr}
        }
        if(isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterBlogs.subcategory = {$all: subcatArr}
        }
        const blogs = await blogModel.find(filterBlogs);
        if(blogs.length===0) {
            res.status(404).send({status: false, message: 'No matching blogs found'})
            return
        }
        await blogModel.updateMany({_id: {$in: idsOfBlogsToDelete}}, {$set: {isDeleted: true, deletedAt: new Date()}})
        return res.status(200).send({status: true, message: 'Blog deleted successfully'});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}

module.exports = {createBlog, getBlogs, updateBlog, deleteBlog, deleteBlogByQuery}
