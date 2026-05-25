import { identityDb } from "../config/db.js";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
  console.log("creating user");

  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash("Idorocodes", salt);
  console.log(password);

  const { data: user, error } = await identityDb
    .from("students")
    .insert({
      matric_number: "CSC/2023/1095",
      full_name: "John Amos Idoroyen",
      faculty: "Science",
      department: "Computer Science",
      level: 300,
      password_hash: password,
    })
    .select();

  if (!error) {
    res.send("User created!");
  }
};

export default createUser;
