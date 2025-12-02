import NotificationModel from "../Models/NotificationModel.js";
import { verifyToken } from "../Utils/Verification.js";


export const getUserNotification = (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if(!token) return res.status (401).json({error: "UnAuthorized"})

        const decoded = verifyToken(token);
        const user_id = decoded.userId;

        NotificationModel.getUserNotification(user_id, (err, notifications) => {
            if(err) return res.status(500).json({error: "Database error"});

            res.json({notifications});
        });


    }
    catch(err) {
        res.status(500).json({error: "Internal server error"});
    }
}