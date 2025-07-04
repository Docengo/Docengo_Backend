const validator = require("validator");

const validateSignUpData = (req) => {

    const {fullName, emailId, password, stream, className, city, mobileNumber} = req.body;
    const allowedStreams = ["JEE", "NEET", "Other"];
    const allowedClasses = ["IX", "X", "XI", "XII", "Dropper"];

    if(!fullName){
        throw new Error("Please enter the name");
    }
    else if(fullName.length < 6 ){
        throw new Error("Full name should be atleast of 6 characters");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email id is not valid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Enter a strong password");
    }
        
     else if (!stream || !allowedStreams.includes(stream)) {
        throw new Error(`Stream must be one of: ${allowedStreams.join(", ")}`);
    }
    else if(!className || !allowedClasses.includes(className)){
        throw new Error(`Class must be one of: ${allowedClasses.join(", ")}`);
    }

    // City
    else if (!city || typeof city !== "string" || city.trim().length < 2) {
        throw new Error("Please enter a valid city name");
    }

    // Mobile Number
    else if (!validator.isMobilePhone(mobileNumber, 'en-IN')) {
        throw new Error("Mobile number is not valid");
    }
    
}



module.exports = {
    validateSignUpData
}