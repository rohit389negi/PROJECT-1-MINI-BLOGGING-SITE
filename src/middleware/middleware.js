const authorModel = require('../model/authorModel.js')
const blogModel = require('../model/blogModel.js')

const blogId = async function (req, res, next) {
    let data = req.params.blogId
    const user = await blogModel.findOne({ _id: data })
    if (user) {
        let check = await blogModel.findOne({isDeleted: false})
        console.log(check)
        if (check) {
            req.body.isPublished = true
            req.body.publishedAt = Date()
            req.body.blogId = data
            next()
        } else {
           return res.status(401).send({ message: "Deleted blog" })
        }
       
    } else {
        res.status(400).send({ status: false, message: "Id not valid" })
    }
}

module.exports = {
    blogId
}