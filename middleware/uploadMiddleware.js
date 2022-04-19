const multer = require("multer");
const path = require("path")
const { nanoid } = require("nanoid");
const fs = require("fs")

const diskStorage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null,  "./public");
    },
    filename: (req, file, cb) => {
      cb(null, nanoid() + path.extname(file.originalname));
    },
  });
  const upload = multer({
    storage:diskStorage,
  }).single("photoProfile")

  const uploadSingle = (req,res,next)=>{
      return upload(req,res,(err)=>{
          if(err)return res.status(442).json({
              message:"gagal",
              message:err.message
          })
          next()
      })
  }

  module.exports = {uploadSingle}
