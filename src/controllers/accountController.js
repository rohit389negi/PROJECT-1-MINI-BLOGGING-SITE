const accountModel = require('../models/accountModel')
const jwt = require('jsonwebtoken')

const isValid = function(value){
    if(typeof value == 'undefined' || value == null) return false
    if(typeof value == 'string' && value.trim().length == 0) return false
    return true
}
const isValidRoleType = function(value){
    return ['admin', 'user', 'guest'].indexOf(value) !== -1
}
const isValidEmail = function(value){
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
}
const isValidRequestBody = function(value){
    return Object.keys(value).length > 0
}

const createAccount = async function(req,res){
    try{
        const requestBody = req.body
        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, message:'request body not found'})
        }
        const  {fname, lname, email, password, roleType} = requestBody
        
        if(!isValid(fname)){
            return res.status(400).send({status: false, message: 'First name is required'})
        }
        if(!isValid(lname)){
            return res.status(400).send({status: false, message: 'Last name is required'})
        }
        if(!isValid(roleType)){
            return res.status(400).send({status: false, message: 'RoleType is required'})
        }
        if(!isValidRoleType(roleType)){
            return res.status(400).send({status: false, message: 'Valid RoleType is required'})
        }
        if(!isValid(email)){
            return res.status(400).send({status: false, message: 'E-mail is required'})
        }
        if(!isValidEmail(email)){
            return res.status(400).send({status: false, message: 'Valid E-mail is required'})
        }
        const isEmailAlreadyUsed = await accountModel.findOne({email})
        if(isEmailAlreadyUsed){
            return res.status(404).send({status:false, message:`${email} is already used`})
        }
        if(!isValid(password)){
            return res.status(400).send({status: false, message: 'Password is required'})
        }
        const data = {fname, lname, roleType, email, password}
        
        if(req.roleType == 'admin'){
            const accountData = await accountModel.create(data)
            return res.status(201).send({status:true, message:'account created successfully', data:accountData})
        }
        else{
        return res.status(404).send({status:false, message:'Access denied'})
        }
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

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
        const loginAccount = await accountModel.findOne({email, password})
        
        if(!loginAccount){
            return res.status(404).send({status:false, message:'Account not found'})
        }
        
        const token = jwt.sign({roleType:loginAccount.roleType}, 'secretkey')
        res.header('x-api-key', token)
        return res.status(200).send({status:true, message:'successfully logged in', token:token})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

const getList = async function (req,res){
    try{
        if(req.roleType == 'admin' || req.roleType == 'user'){
        const get = await accountModel.find().select({fname:1, lname:1, roleType:1, _id:0})
            return res.status(200).send({status:true, message:'list', data:get})
        }
        else{
        return res.status(404).send({status:false, message:'Access denied'})
        }
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = {createAccount, login, getList}
