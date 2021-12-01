const authorModel = require('../model/authorModel.js')
const blogModel = require('../model/blogModel.js')
const jwt = require('jsonwebtoken')

const blogId = async function (req, res, next) {
    try{
        let data = req.params.blogId
        const user = await blogModel.findOne({ _id: data })
        if (user) {
            let check = await blogModel.findOne({ isDeleted: false }) 
            let checkDelete=check.isDeleted
            if (checkDelete===true) {
                return res.status(401).send({ message: "Deleted blog" })
            } else {           
                req.body.blogId = data
    
                next()
            } 
    
        } else {
            res.status(400).send({ status: false, message: "Id not valid" })
        }

    }catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
   
}

const loginCheck = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key']
        if (token) {
            let validate = jwt.verify(token, 'projectBlog')
            if (validate) {
                req.validate = validate
                next()
            } else {
                res.status(401).send({ status: false, message: "Invalid Token" })
            }
        } else {
            res.status(401).send({ status: false, message: "Mendatary authentication is Missing" })
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
      
}


module.exports = {
    blogId,loginCheck
}