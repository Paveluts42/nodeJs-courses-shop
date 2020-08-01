const keys = require("../keys");

module.exports = function (to) {
  return {
    to,
    from: keys.FROM_EMAIL,
    subject: "Регистрация на сайте",
    html: `
    <h1>Добро пожаловать в наш магазин </h1>
    <p>Вы успешно создали аккаунт с Email: ${to}</p>
    <hr/>
    <a href='${keys.BASE_URL}'>Магазин курсов</a>
    `,
  };
};
