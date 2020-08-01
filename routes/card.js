const { Router } = require("express");
const Course = require("../models/course");
const router = Router();
const auth = require("../middleware/auth");

function mapCourses(cart) {
  return cart.items.map((i) => ({
    ...i.courseId._doc,
    id: i.courseId.id,
    count: i.count,
  }));
}
function computedPrice(courses) {
  return courses.reduce((total, course) => {
    return (total += course.price * course.count);
  }, 0);
}

router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCard(course);
  res.redirect("/card");
});

router.delete("/remove/:id", auth, async (req, res) => {
  await req.user.removeFromCard(req.params.id);
  const user = await req.user.populate("card.items.courseId").execPopulate();
  const courses = mapCourses(user.card);
  const cart = {
    courses,
    price: computedPrice(courses),
  };
  res.status(200).json(cart);
});

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("card.items.courseId").execPopulate();
  const courses = mapCourses(user.card);
  res.render("card", {
    title: "Корзина",
    isCard: true,
    courses,
    price: computedPrice(courses),
  });
});
module.exports = router;
