const {User,blogAdded} = require("../schema/schema")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const registerFunc = async (req, res) => {
    try {
      const { firstname, lastname, email, password } = req.body;
      console.log(firstname, lastname, email, password)
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword, // Store the hashed password
      });
      if (newUser) {
        return res.status(200).json({ success: true, message: "Registered successfully" });
      } else {
        return res.status(400).json({ success: false, message: "Unable to register" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Error", err });
    }
  };

  const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email, password);
  
      // Find the user in the database
      const loginU = await User.findOne({ email: email });
      if (!loginU) {
        return res.status(400).json({ message: "Unable to login" });
      }
  
      // Compare passwords using bcrypt
      const checkPassword = bcrypt.compareSync(password, loginU.password);
      if (checkPassword) {
        // Generate JWT token
        const token = jwt.sign({ id: loginU._id }, process.env.SECRET_KEY);
  
        // Set JWT token in a cookie
        res.cookie('jwt', token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
  
        return res.status(200).json({ success: true, message: "Successfully logged in", token: token });
      } else {
        return res.status(400).json({ success: false, message: "Unable to login, please check your password" });
      }
    } catch (err) {
      console.error("Error:", err); // Log the error for debugging purposes
      return res.status(500).json({ message: "Internal Server Error" }); // Provide a generic error message to the client
    }
  };
  

const addBlog = async(req,res)=>{
    try{
        const{title,summary,content,userId}= req.body
        const createBlog = await blogAdded.create({
            blogTitle:title,
            blogSummary:summary,
            blogContent:content,
            user:userId
        })
      if(createBlog){
            return res.status(200).json({success:true,messaege:"blog created sucessfully"})
        }else{
            return res.status(400).json({success:false,message:"unable to add a blog, please try again"})
        }

    }catch(err){
        res.status(500).json({message:"err",err})
    }
   
}

const allBlog = async(req,res)=>{
  try {
    const getBlogs =  await blogAdded.find({}).populate("user")
    res.status(200).json({success:true,getBlogs})
  } catch (error) {
    res.status(400).json({sucess:false ,messaege:"err",err})
  }
}
const editBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, summary, content } = req.body;


    // Update the blog
    const updatedBlog = await blogAdded.findByIdAndUpdate(blogId, {
      blogTitle: title,
      blogSummary: summary,
      blogContent: content, 
    }, { new: true });
    if (!updatedBlog) {
      return res.status(404).json({ success: false, message: "Blog not found or unable to edit" });
    }

    return res.status(200).json({ success: true, message: "Blog updated successfully", data: updatedBlog });
  } catch (error) {
    console.error("Error editing blog:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



const delBlog = async(req,res)=>{
  try {
    const {blogId} = req.params;

    const del = await blogAdded.deleteOne({_id:blogId});
    if(del){
      return res.status(200).json({success:true,messaege:"Deleted sucessfully"})
    }else{
      return res.status(404).json({success:false,messaege:"Unable to delete"})
    }
    } catch (error) {
      return res.status(400).json({success:false,messaege:"err",error})
  }
}

const seeDetails = async(req,res)=>{
  try {
    const {blogId} = req.params;
    
    const details = await blogAdded.findById({_id:blogId}).populate("user")
    
    if(details){
      return res.status(200).json({success:true,details})
    }else{
      return res.status(404).json({success:false,messaege:"unable to show data"})
    }
  } catch (error) {
    res.status(400).json({messaege:"err",error})
  }

}

const userBlog = async(req,res)=>{
  try {
    const token = req.headers.authorization.split(" ")[1];
    if(!token){
      return res.status(404).json({success:false,messaege:"token not found"})
    }
    const decode = jwt.verify(token,process.env.SECRET_KEY)
    console.log(decode)
    if(!decode){
      res.status(404).json({success:false,messaege:"unable to decode"})
    }
    const getblog = await blogAdded.find({user:decode.id})
    if(!getblog){
      return res.status(404).json({success:false, messaege:"Unable to show the blogs"})
    }else{
      return res.status(200).json({success:true, getblog})
    }
  } catch (error) {
    return res.status(400).json({success:false,messaege:"error",error})
  }
}

const userInfo = async (req, res) => {
  try {
    // console.log("hello")
    const token = req.headers.authorization.split(" ")[1]
    if(!token){
        return res.status(403).json({message:"Token is required"})
    }
    // console.log(token)
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(decode)
    if (!decode) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const getUser = await User.findById(decode.id);
    if (getUser) {
      return res.status(200).json({ success: true, message: "Success", user: getUser });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

module.exports = {registerFunc,loginUser,addBlog,allBlog,userInfo,editBlog,delBlog,seeDetails,userBlog}                  