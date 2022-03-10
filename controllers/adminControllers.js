const { ADMIN_COLLECTION ,USER_COLLECTION} = require("../config/collection")
const db = require('../config/connection')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const moment = require('moment')
const ObjectId = require('mongodb').ObjectId




module.exports = {


    login: async (req, res) => {
        console.log("hy in admin");

        const { email, password } = req.body

        console.log(req.body);

        try {

            let admin = await db.get().collection(ADMIN_COLLECTION).findOne({ email: email })
            console.log(admin);
            if (admin) {
                console.log(password);

                console.log(admin.password);

                if (admin.password == password) {

                    console.log("success");

                    let token = await jwt.sign({ email: admin.email, id: admin._id, isAdmin: true }, "AdminSecret", { expiresIn: "1h" })

                    return res.status(200).json({ admin, token })

                } else {
                    console.log("password is incorrect");
                    res.status(400).json({ message: "invalid Password" })

                }

            }
            else {
                console.log("email is not exs=ist");
                res.status(400).json({ message: "invalid Email" })
            }

        } catch (err) {

            res.status(500).json({ err: err.message })

        }
    },

    getAllusers: async (req, res) => {

        console.log("in get all users");
        try {
            const users = await db.get().collection(USER_COLLECTION).find().toArray()
            console.log(users);

            if (users === null) return res.status(204).json({ message: "user collection are empty" })

            res.status(200).json({ users })

        } catch (err) {
            res.status(500).json({ err: err.message })

        }

    },
  
    edituser: async (req, res) => {
        console.log("in edit user");

        const { userId, status } = req.body
        console.log(req.body);

        try {

            await db.get().collection(USER_COLLECTION).updateOne({ "_id": ObjectId(userId) }, { $set: { isActive: status } }).then(async (data) => {

                const users = await db.get().collection(USER_COLLECTION).find().toArray()

                res.status(200).json({ users })


            }).catch((err) => {

                res.status(500).json({ err: err.message })


            })

        } catch (err) {

            res.status(500).json({ err: err.message })


        }



    },
    getActiveUsers: async (req, res) => {

        console.log("in Active all users");
        try {
            const users = await db.get().collection(USER_COLLECTION).find({isActive:true}).toArray()
            console.log(users);

            if (users === null) return res.status(204).json({ message: "user collection are empty" })

            res.status(200).json({ users })

        } catch (err) {
            res.status(500).json({ err: err.message })

        }

    },
    getBlockedUsers: async (req, res) => {

        console.log("in Active all users");
        try {
            const users = await db.get().collection(USER_COLLECTION).find({isActive:false}).toArray()
            console.log(users);

            if (users === null) return res.status(204).json({ message: "user collection are empty" })

            res.status(200).json({ users })

        } catch (err) {
            res.status(500).json({ err: err.message })

        }

    },


  
}







