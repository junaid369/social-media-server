const { POST_COLLECTION} = require("../config/collection")
const db = require('../config/connection')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const moment = require('moment')
const ObjectId = require('mongodb').ObjectId


const { uploadFile } = require('./awsS3Controllers')

const fs =require("fs")



module.exports = {

    test: (req, res) => {

        res.json({ message: "test request" })

    },


    addPost: async (req, res) => {

        let file=req.file
        console.log(file,"your file");
        const result=await uploadFile(file)
        let {description,userId}=req.body
console.log(description);
console.log(userId);


        db.get().collection(POST_COLLECTION).insertOne({
         
            description:description,
            status:"active",
            postedDate:new Date() ,
            post:result.Location
        }).then(async(data)=>{
            const post = await db.get().collection(POST_COLLECTION).findOne({ "_id": data.insertedId })
            res.status(200).json({ message: "post added", post })
            console.log("success");
        }).catch((err) => {

                            res.status(403).json({ message: err })
            
                        })
    },
    getAllPost: async (req, res) => {
        try{
            
        
               console.log("hy in getallpost");
        
               const Post = await db.get().collection(POST_COLLECTION).find().toArray()
               console.log(Post);

               if(Post==null) return res.status(204).json({ message: "post collection are empty" })
               res.status(200).json({ Post })

        } catch(err){
            res.status(500).json({ err: err.message })

        }



    },
    

}