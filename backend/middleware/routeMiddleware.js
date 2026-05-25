
import express from "express"

const resource404 = (req,res,next) =>{

    res.json({
        success:false,
        code : 404,
        message:"This resource or page was not found!"
    });

    next()
}


export default resource404