const express =require('express')
const {login,getAllusers,edituser,getActiveUsers,getBlockedUsers} =require('../controllers/adminControllers')




const router=express.Router()

router.post("/login",login)
router.get("/getAllusers",getAllusers)
router.patch("/editUser",edituser)

router.get("/Activeuser",getActiveUsers)
router.get("/Blockedusers",getBlockedUsers)




module.exports=router