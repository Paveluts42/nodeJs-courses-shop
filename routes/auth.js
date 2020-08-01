const { Router } = require("express");
const bcrypt = require("bcryptjs");
const router = Router();
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const keys = require("../keys");
const registerMail = require("../emails/registration");
const { registerValidators, loginValidators } = require("../utils/validators");
const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.gridKey },
  })
);

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    errorRegister: req.flash("errorRegister"),
    errorLogin: req.flash("errorLogin"),
  });
});
router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});
router.post("/login", loginValidators, async (req, res) => {
  try {
    const { email, password } = req.body;
    const condidate = await User.findOne({ email });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("errorLogin", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }
    if (condidate) {
      const isSame = await bcrypt.compare(password, condidate.password);
      if (isSame) {
        req.session.user = condidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.redirect("/");
        });
      } else {
        req.flash("errorLogin", "Неверные данные");

        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("errorLogin", "Такого пользователя нет ");

      res.redirect("/auth/login#login");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("errorRegister", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
    });

    await user.save();
    res.redirect("/auth/login#login");
    await transporter.sendMail(registerMail(email));
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
