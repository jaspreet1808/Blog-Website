import mongoose from "mongoose";

export const DBConnection = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            dbName: "MERN_STACK_BLOGGING_WEBSITE",
        })
        .then(() => {
            console.log("Connected to database!");
        })
        .catch((err) => {
            console.log('Some error occured while connecting database: ${err}');
        });
};