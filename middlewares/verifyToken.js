const jwt = require ('jsonwebtoken');

//verify Token 
  const verifyToken = (req, res, next) => {
    const authToken = req.headers.authorization;
    if (authToken) {
      const token = authToken.split(' ')[1];//mettre ds token juste le jeton qui dindice 1 et non pas le mot Bearer 
    try {
         const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);//dechiffrement de token 
         req.user = decodedPayload;
         next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token is not valid access denied' });   
    }
    } else { 
    
    return res.status(401).json({ msg: 'No token, access  denied' });
    }
}
//verify Token & admin 
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req,res,()=>{
    if (req.user.isAdmin){
    next();
    }
   else {
    return res.status(403).json({ msg: ' You are not authorized to access, only admin can access' });
  }
  
});
    
  };
  //verify Token & only User Himself 
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req,res,()=>{
    if (req.user.id===req.params.id){
    next();
    }
   else {
    return res.status(403).json({ msg: ' You are not authorized to access, only user himself' });
  }
  
});
    
  };

    //verify Token & Authorization ( only Admin and User Himself )
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req,res,()=>{
    if (req.user.id===req.params.id||req.user.isAdmin){
    next();
    }
   else {
    return res.status(403).json({ msg: ' You are not authorized , only user himself or Admin are authorized' });
  }
  
});
    
  };


module.exports = {verifyToken,verifyTokenAndAdmin,verifyTokenAndOnlyUser,verifyTokenAndAuthorization};

    //jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
     // if (err) {
        
     // }req.userId = decoded.id;next();
    