const { check } = require("express-validator")

const Admin = require("../models").officer

const adminRegisterValidator =[
    check("name").isLength({min:1}).withMessage("name must be field"),
    check("username").isLength({min:1}).withMessage("username must be field"),
    check("email").isEmail().withMessage("use valid email").custom((value)=>{
        return Admin.findOne({where:{email:value}}).then((user)=>{
            if(user) return Promise.reject("email has been used")
        })
    }),
    check("password").isLength({min:8}).withMessage("minimal 8 characters"),
]

module.exports = {adminRegisterValidator}