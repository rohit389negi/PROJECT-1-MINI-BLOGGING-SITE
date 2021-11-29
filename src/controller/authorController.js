const mongoose = require('mongoose');
const authorModel=require('../model/authorModel.js')

const createAuthor= async function(req,res){
    try{
        let data = req.body
        if(data){
            let saveauthor= await authorModel.create(data)
            res.status(200).send({status:true, data:saveauthor})
        }else {
            res.status(400).send({status:false, message: "Mendatory body missing"})
        }
    }catch(err){
        res.status(500).send({status: false , msg : err.message})
    }
   
    
    
}

module.exports={
    createAuthor
}