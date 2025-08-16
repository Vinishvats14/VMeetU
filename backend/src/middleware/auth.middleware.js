import jwt from "jsonwebtoken";
import User from "../models/User.js";


// middleware protect ki jarurat kyu padi ? kyuki humme vo kam karne h jo login k baad k kar sakte h jaise baate ya aoni profile banana ya fr kuch bhi to protect 
// protect middleware bs validate karta h jo uske pass jwt token ya access token h vo valid h ya nhi kyuki inhi k basis par banda authorised maana jayega jahaa jhaa access token aa raha h na usse jwt token likhlo samjhne k liye 
export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];  /// yeh cokkie se tabhi le sakte h jab server,js m cookie parser hoga to vha middleware use karo app.use karke

        if(!token){
            return res.status(401).json({message : "Unauthorized, no token provided"});
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the token using the secret key iske paas dekh sign k liye access secret key h to yeh token ko usse match karega 
        if(!decoded){
            return res.status(401).json({message: "Unauthorized, invalid token"});
        }

        const user = await User.findOne({_id: decoded._id}).select("-password"); //. yeh jo humne phle jwt token banaya tha usme payload tha aur signature bhi tha but userid k andar tha payload (kisi ka data) to isse payload pta chlega aur vo bhi decoded

        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        
        req.user = user ;
        next(); // Call the next middleware or route handler
    }catch(error){
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}