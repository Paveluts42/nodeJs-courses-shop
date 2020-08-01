const express = require("express");
const path = require("path");
const csurf = require("csurf");
const flash = require("connect-flash");
const exphbs = require("express-handlebars");
const helmet = require("helmet");
const compression = require("compression");
const homeRoutes = require("./routes/home");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const variableMiddle = require("./middleware/variables");
const cardRoutes = require("./routes/card");
const addRoutes = require("./routes/add");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const coursesRoutes = require("./routes/courses");
const keys = require("./keys");
const errorHandler = require("./middleware/error");
const filleMidleware = require("./middleware/file");

const userMiddle = require("./middleware/user");
const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-helpers"),
});
const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(filleMidleware.single("avatar"));
app.use(csurf());
app.use(flash());
app.use(variableMiddle);
app.use(userMiddle);
app.use(helmet());
app.use(compression());

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/auth", authRoutes);
app.use("/courses", coursesRoutes);
app.use("/orders", ordersRoutes);
app.use("/card", cardRoutes);
app.use("/profile", profileRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 3000;
async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
