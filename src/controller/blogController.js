const blogModel = require('../model/blogModel.js')
const authorModel = require('../model/authorModel.js')
const jwt = require('jsonwebtoken')

// creating blog by authorizing authorId.
const createBlog = async function (req, res) {
    try {
        let data = req.body

        if (req.body.title && req.body.body && req.body.tags && req.body.subcategory) {
            if (req.validate._id == req.body.authorId) {
                let user = await authorModel.findById({ _id: req.body.authorId })
                if (user) {
                    let savedBlog = await blogModel.create(data)
                    res.status(201).send({ status: true, msg: "succesful blog creation", data: savedBlog })
                } else {
                    res.status(400).send({ status: false, msg: "invalid Author Id" })
                }

            } else {
                res.status(400).send({ status: false, msg: "Not Authorized" })
            }

        } else {
            res.status(400).send({ status: false, msg: "Mandatory body missing" })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }

}

//get all blogs by using filters - title,tags,category & subcategory.
const getBlog = async function (req, res) {
    try {
        if (req.query.category || req.query.authorId || req.query.tags || req.query.subcategory) {
            let obj = {};
            if (req.query.category) {
                obj.category = req.query.category
            }
            if (req.query.authorId) {
                obj.authorId = req.query.authorId;
            }
            if (req.query.tags) {
                obj.tags = req.query.tags
            }
            if (req.query.subcategory) {
                obj.subcategory = req.query.subcategory
            }
            obj.isDeleted = false
            obj.isPublished = true
            let data = await blogModel.find(obj)
            if (data==false) {
                return res.status(404).send({ status: false, msg: "The filter value is Invalid" });
            } else {
                res.status(200).send({ status: true, message: "Successfully fetched all blogs", data: data })
            }
        } else {
            return res.status(404).send({ status: false, msg: "Mandatory filter not given" });
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }
}

//PUT /blogs/:blogId - Update the details of the blog by filtering them with these keys - title,category,subcategory,& tags.
async function updateDetails(req, res) {
    try {
        if (req.body.title && req.body.body && req.body.tags && req.body.subcategory) {
            if (req.validate._id == req.query.authorId) {
                const title = req.body.title
                const body = req.body.body
                const tags = req.body.tags
                const subcategory = req.body.subcategory
                let Update = {}
                Update.title = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { title: title }, { new: true })
                Update.body = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { body: body }, { new: true })
                Update.tags = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { tags: tags } }, { new: true })
                Update.subcategory = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { $push: { subcategory: subcategory } }, { new: true })
                Update.isPublished = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { isPublished: true }, { new: true })
                Update.publishedAt = await blogModel.findOneAndUpdate({ _id: req.params.blogId }, { publishedAt: Date() }, { new: true })
                let updatedBlog = await blogModel.find({ _id: req.params.blogId })

                res.status(200).send({ status: true, message: "Successfully updated blog details", data: updatedBlog })
            } else {
                return res.status(404).send({ status: false, msg: "Access denied !!!" })
            }
        } else {
            return res.status(404).send({ status: false, msg: "Mandatory body not given" })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }
}

//DELETE /blogs/:blogId - Mark is Deleted:true if the blogId exists and it is not deleted.
const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId

        if (req.params.blogId) {
            if (req.validate._id == req.query.authorId) {
                let data = await blogModel.find({ _id: id })
                if (!data.isDeleted) {
                    let Update = {}
                    Update.isDeleted = await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true })
                    Update.deletedAt = await blogModel.findOneAndUpdate({ _id: id }, { deletedAt: Date() }, { new: true })
                    res.status(200).send({ status: true, message: "successfully deleted blog" })
                } else {
                    return res.status(404).send({ status: false, msg: "Blog already deleted" });
                }
            } else {
                return res.status(404).send({ status: false, msg: "Access denied !!!" });
            }
        } else {
            res.status(404).send({ status: false, msg: "Blog Id not found" })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }
}

// DELETE /blogs?queryParams - delete blogs by using specific queries or filters.
const deleteSpecific = async function (req, res) {
    try {
        if (req.query.category || req.query.authorId || req.query.tags || req.query.subcategory) {
            if (req.validate._id == req.query.authorId) {

                let obj = {};
                if (req.query.category) {
                    obj.category = req.query.category
                }
                if (req.query.authorId) {
                    obj.authorId = req.query.authorId;
                }
                if (req.query.tags) {
                    obj.tags = req.query.tags
                }
                if (req.query.subcategory) {
                    obj.subcategory = req.query.subcategory
                }
                if (req.query.published) {
                    obj.isPublished = req.query.isPublished
                }
                let data = await blogModel.findOne(obj);
                if (data) {
                    if (data.isDeleted == false) {
                        data.isDeleted = true
                        data.deletedAt = Date()
                        data.save();
                        res.status(200).send({ status: true, message: "Deleted successfully", data: data });
                    } else {
                        return res.status(400).send({ status: false, message: "Blog has been already deleted" })
                    }
                } else {
                    return res.status(404).send({ status: false, msg: "The given data is Invalid" });
                }

            } else {
                res.status(404).send({ status: false, msg: "Access denied !!!" })
            }

        } else {
            return res.status(404).send({ status: false, msg: "Mandatory body missing" });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: "Something went wrong", Error: err });
    }
}

// LOGIN API- Authorizing while author login.

const loginAuthor = async function (req, res) {
    if (req.body && req.body.email && req.body.password) {
        let author = await authorModel.findOne({ email: req.body.email, password: req.body.password })
        if (author) {
            let payload = { _id: author._id, email: author.email }
            let generateToken = jwt.sign(payload, 'projectBlog')
            res.header('x-api-key', generateToken)
            res.status(200).send({ status: true, data: { authorId: author._id }, token: generateToken })
        } else {
            res.status(401).send({ status: false, message: "invalid Username or Password" })
        }
    } else {
        res.status(400).send({ status: false, message: "Request body must contain email and Password" })
    }
}

module.exports = {
    createBlog, getBlog, updateDetails, deleteBlog, deleteSpecific, loginAuthor
}
