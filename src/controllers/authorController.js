//fname:{mandatory},lname:{mandatory},title:{mandatory,enum[Mr, Mrs, Miss]},email:{mandatory,valid email,unique}, 
// password:{mandatory}

const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')

const isValid = function(value){
    if(typeof value == 'undefined' || value == null) return false
    if(typeof value == 'string' && value.trim().length == 0) return false
    return true
}
const isValidTitle = function(value){
    return ['Mr', 'Miss', 'Mrs'].indexOf(value) !== -1
}
const isValidEmail = function(value){
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
}
const isValidRequestBody = function(value){
    return Object.keys(value).length > 0
}

//Author /authors
const createAuthor = async function(req,res){
    try{
        const requestBody = req.body
        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'request body not found'})
        }
        const  {fname, lname, title, email, password} = requestBody
        if(!isValid(fname)){
            return res.status(400).send({status: false, message: 'First name is required'})
        }
        if(!isValid(lname)){
            return res.status(400).send({status: false, message: 'Last name is required'})
        }
        if(!isValid(title)){
            return res.status(400).send({status: false, message: 'Title is required'})
        }
        if(!isValidTitle(title)){
            return res.status(400).send({status: false, message: 'Valid Title is required'})
        }
        if(!isValid(email)){
            return res.status(400).send({status: false, message: 'E-mail is required'})
        }
        if(!isValidEmail(email)){
            return res.status(400).send({status: false, message: 'Valid E-mail is required'})
        }
        const isEmailAlreadyUsed = await authorModel.findOne({email})
        if(isEmailAlreadyUsed){
            return res.status(404).send({status:false, message:`${email} is already used`})
        }
        if(!isValid(password)){
            return res.status(400).send({status: false, message: 'Password is required'})
        }
        const data = {fname, lname, title, email, password}
        const authorData = await authorModel.create(data)
        return res.status(201).send({status:true, message:'author account created successfully', data:authorData})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//Allow an author to login with their email and password. 
//On a successful login attempt return a JWT token contatining the authorId

//POST /login
const login = async function (req,res){
    try{
        const requestBody = req.body
        const {email, password} = requestBody
        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'request body not found'})
        }
        if(!isValid(email)){
            return res.status(400).send({status: false, message: 'E-mail is required'})
        }
        if(!isValidEmail(email)){
            return res.status(400).send({status: false, message: 'Valid E-mail is required'})
        }
        if(!isValid(password)){
            return res.status(400).send({status: false, message: 'Password is required'})
        }
        const loginAuthor = await authorModel.findOne({email, password})
        if(!loginAuthor){
            return res.status(404).send({status:false, message:'Author not found'})
        }
        const token = jwt.sign({authorId:loginAuthor._id}, 'secretkey')
        res.header('x-api-key', token)
        return res.status(200).send({status:true, message:'author successfully logged in', token:token})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = {createAuthor, login}
