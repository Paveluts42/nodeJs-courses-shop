const { Router } = require("express");
const Course = require("../models/course");
const { validationResult } = require("express-validator");
const { courseValidators } = require("../utils/validators");
const auth = require("../middleware/auth");

const router = Router();

function isOvner(course, req) {
  return course.userId.toString() !== req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("userId", "email name")
      .select("price title img");
    res.render("courses", {
      title: "Курсы",
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (e) {
    console.log(e);
  }
});
router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  try {
    const course = await Course.findById(req.params.id);
    if (isOvner(course, req)) {
      return res.redirect("/courses");
    }
    res.render("curseEdit", {
      title: `Редактировать ${course.title}`,
      course,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/edit", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${req.body.id}/edit?allow=true`);
  }
  try {
    const course = await Course.findById(req.body.id);

    if (isOvner(course, req)) {
      return res.redirect("/courses");
    }
    await Course.findByIdAndUpdate(req.body.id, req.body);
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id);
    if (isOvner(course, req)) {
      return res.redirect("/courses");
    }
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render("course", {
      layout: "empty",
      title: `Курс ${course.title}`,
      course,
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
