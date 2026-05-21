const express = require("express");

const app = express();

const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/send", (req, res) => {
  res.json({
    message: "Server is sending",
    code: 344,
  });
});

app.post("/api/v1/login", (req, res) => {
  const { matric_number, password } = req.body;

  if (!matric_number || !password) {
    return res.json({
      code: 401,
      message: "Matric Number OR Password not supplied!",
    });
  }

  if (matric_number.length < 14) {
    return res.json({
      code: 401,
      message: "Incomplete Matric Number!",
    });
  }

  if (password.length < 6) {
    return res.json({
      code: 401,
      message: "Password should be more than 6!",
    });
  }

});

app.listen(PORT, () => console.log(`Server started on http://localhost:8080`));
