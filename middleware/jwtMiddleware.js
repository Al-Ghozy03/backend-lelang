const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Officer = require("../models").officer;
const User = require("../models").user;

async function jwtMiddle(req, res, next) {
  const { authorization } = req.headers;
  if (authorization == undefined) return res.sendStatus(401);
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SIGN, async (err, decode) => {
    if (err) {
      return res.status(401).json({
        message: "invalid token",
        data: err,
      });
    } else {
      const user = await User.findOne({ where: { email: decode.email } });
      const officer = await Officer.findOne({ where: { email: decode.email } });
      if (!user && !officer)
        return res.json({
          message: "user sudah dihapus",
        });
      req.id = decode?.id;
      req.email = decode?.email;
      console.log(req.email);
      next();
    }
  });
}

async function authme(req, res) {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_SIGN, async (err, decode) => {
      if (err) {
        return res.status(401).json({
          message: "fail",
          data: err,
        });
      } else {
        const newToken = jwt.sign(
          { email: decode?.email },
          process.env.JWT_ACCESS_TOKEN
        );
        res.json({
          data: newToken,
        });
      }
    });
  } catch (er) {}
}

module.exports = { jwtMiddle };
