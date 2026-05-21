import express from "express"
import morgan from "morgan";
import router from "./routes/route.js";
const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(router);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
