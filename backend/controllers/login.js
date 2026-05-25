 import { identityDb } from "../config/db.js"; 
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

const login = async (req, res) => {
  console.log(`Login path requested at ${new Date().toString()}`);

  try {
    const { matric_number, password } = req.body;

   
    if (!matric_number || !password) {
      return res.status(400).json({
        success: false,
        message: "Matric Number OR Password not supplied!",
      });
    }

    if (matric_number.length < 13) {
      return res.status(400).json({
        success: false,
        message: "Incomplete Matric Number!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password should be 6 characters or more!",
      });
    }

    
    const { data: user, error } = await identityDb
      .from("students")
      .select("*")
      .eq("matric_number", matric_number)
      .maybeSingle(); 
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ success: false, error: "Database reading fault." });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist in the database!",
      });
    }

   
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid Matric Number or Password." 
      });
    }

    const userToken = generateToken(user);
    return res.status(200).json({
      token :userToken,
      success: true,
      message: "Login successful!",
      userId: user,
    });

  } catch (error) {
    console.error("Runtime execution error:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export default login;