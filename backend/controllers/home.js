const homePath = (req, res) => {
  console.log(`Home path requested at ${new Date().toString()}`);

  res.json({
    sucess: true,
    message: "Secure Vote Running well!",
    code: 200,
  });
};



export default homePath;