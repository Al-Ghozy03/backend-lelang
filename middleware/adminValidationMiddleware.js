const { validationResult } = require("express-validator")

const middlewareAdminRegister = async(req,res,next)=>{
    const error = validationResult(req)
    if(!error.isEmpty()) return res.status(422).json({
        status:"failed",
        error:error.array()
    })
    next()
}

module.exports = {middlewareAdminRegister}