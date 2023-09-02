const mongoose = require('mongoose');

//Verification Token Schema 
const VerificationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    },
    {
        timestamps: true
    }
);
//Verification Token model
const VerificationToken = mongoose.model('VerificationToken', VerificationTokenSchema);
module.exports=VerificationToken;
