import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, phone, email, pin, role, isActive, balance } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "phone or email already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(pin, 10);

    // Create new user with hashed password
    const newUser = new User({
      name,
      phone,
      email,
      pin: hashedPassword,
      role,
      isActive,
      balance,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Respond with success message
    res.status(201).json({ _id: newUser._id });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const phone = username;
    const email = username;

    console.log(username,password);
    

    const user = await User.findOne({ $or: [{ phone }, { email }] }); // Find user by username
    console.log(user);

    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.pin);
    // console.log(passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Respond with user data
    res.status(200).json({
      _id: user._id,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming the ID is passed as a URL parameter
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profilePic: user.profilePic,
      balance: user.balance,
    });
  } catch (error) {
    console.log("Error in getUserById controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 100, role, search } = req.query;

    // Construct query object based on role and search criteria
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } }, // Case-insensitive search
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Paginate users based on query
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const users = await User.find(query)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -otp -otpExpires"
      )
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .exec();

    // Get total count of users for pagination
    const count = await User.countDocuments(query);

    // Send response
    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getNewUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: "pending" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCountUser = async (req, res) => {
  try {
    // Count the documents in the User collection
    const count = await User.countDocuments();
    // Send the count as the response
    res.send({ count });
  } catch (error) {
    // Handle any errors that occur during the count operation
    console.error("Error counting user documents:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Define the UpdateActiveStatus function
export const UpdateActiveStatus = async (req, res) => {
  const { id } = req.params;
  const {balance} = req.body

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: "active", balance },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profilePic } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller to update first name and last name
export const updateName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Name updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
