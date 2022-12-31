const User = require('../models/User')
const Note = require("../models/Note");
const asyncHandler = require('express-async-handler')
//using bcrypt to encrypt passowrds
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async (req, res) =>{
    const users = await User.find().select('-passowrd').lean()
    if(!users?.length)
        return res.status(400).json({message: 'No Users Found'})
    res.json(users)
})

const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, roles} = req.body;

    //confirming data
    if (!username || !password || !Array.isArray(roles) || !roles.length)
        return res.status(400).json({message: 'All fields are required'})
    
    //checking for duplicate
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate)
        return res.status(409).json({message: "Duplicate username"})

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userObject = {username, "password": hashedPassword, roles}

    const user = await User.create(userObject);
    if(user)
        return res.status(201).json({message: `New user ${username} created`})
    else res.status(400).json({message: 'Invalid user data received'})
});

const updateUser = asyncHandler(async (req, res) => {
    const {id, username, roles, active, password} = req.body

    //confirm data
    if (!id || !username|| !!Array.isArray(roles || roles.length || typeof active != 'boolean'))
       res.status(400).json({ message: "All fields are required" });
    
    const user = await User.findById(id).exec();
    if (!user)
        res.status(400).json({message: "User not found"})

    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id)
        res.status(409).json({message: "Duplicate username"})

    user.username = username;
    user.roles = roles;
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save();
    res.json({message: `${updatedUser.username} updated`})
});

const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body;
    if(!id){
        return res.status(400).json({message: 'User has assigned notes'})
    }
    const notes = await Note.findOne({user: id}).lean().exec()
    if(notes?.length)
        return res.status(400).json({message: 'user has assigned notes'})

    const user = await User.findById(id).exec()

    if(!user)
        return res.status(400).json({message: "User not found"})
    
    const result = await user.deleteOne()
    const reply = `User ${result.username} with ID ${result.id} deleted`;
    res.json(reply)
    
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}