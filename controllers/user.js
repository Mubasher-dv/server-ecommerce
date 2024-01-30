import { asyncError } from '../middleware/error.js';
import { User } from '../models/user.js'
import ErrorHandler from '../utils/error.js';
import { sendToken, cookiesOptions, getDataUri, sendEmail } from '../utils/features.js';
import cloudinary from 'cloudinary';

export const login = asyncError(async (req, res, next) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password")

    if (!user) return next(new ErrorHandler('Incorrect Email or Password', 400))

    if (!password) return next(new ErrorHandler("Please enter password", 400))

    // handle error
    const isMatched = await user.comparePassword(password)

    if (!isMatched) {
        return next(new ErrorHandler("Incorrect Password", 400))
    }

    sendToken(user, res, `Welcome Back, ${user.name}`, 200)
})

export const signUp = asyncError(async (req, res, next) => {

    const { name, email, password, address, city, country, pinCode } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User already exist", 400))
    }

    let avatar = undefined;

    if (req.file) {
        //req.file
        const file = getDataUri(req.file)

        //add cloudinary here
        const mycloud = await cloudinary.v2.uploader.upload(file.content)
        console.log(mycloud.secure_url)
        avatar = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        }
    }



    user = await User.create({
        name,
        email,
        password,
        address,
        avatar,
        city,
        country,
        pinCode
    });

    sendToken(user, res, "Registered Successfully", 201)
})

export const getMyProfile = asyncError(async (req, res, next) => {

    console.log(req.user._id)

    const user = await User.findById(req.user._id);
    console.log(user)

    res.status(200).json({
        success: true,
        user
    })
})

export const logOut = asyncError(async (req, res, next) => {


    res.status(200).cookie("token", "", {
        ...cookiesOptions,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "Logged Out Successfully"
    })
})
export const updateProfile = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const { name, email, address, city, country, pinCode } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (pinCode) user.pinCode = pinCode;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully"
    })
})

export const changePassword = asyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return next(new ErrorHandler("Please enter old password & new password", 400))


    const isMatched = await user.comparePassword(oldPassword);

    if (!isMatched) return next(new ErrorHandler('Incorrect Old Password', 400))

    user.password = newPassword;

    await user.save()

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully"
    })
})

export const updatePic = asyncError(async (req, res, next) => {

    console.log(req.user._id)

    const user = await User.findById(req.user._id);

    //req.file
    const file = getDataUri(req.file)

    //add cloudinary here
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    const mycloud = await cloudinary.v2.uploader.upload(file.content)
    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "avatar updated successfully"
    })
})

export const forgetPassword = asyncError(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({ email })


    if (!user) return next(new ErrorHandler("incorrect Email", 404))

    const randomNumber = Math.random() * (999999 - 100000) + 100000;
    const otp = Math.floor(randomNumber)
    const otpExpire = 15 * 60 * 1000;

    user.otp = otp;
    user.otp_expire = new Date(Date.now() + otpExpire)

    await user.save()
    console.log(otp)

    const message = `Your Otp for resetting password is ${otp}, Please ignore if you haven't requested this`

    try {
        await sendEmail(
            "OTP for resetting password",
            user.email,
            message
        )
    } catch (error) {
        user.otp = null;
        user.otp_expire = null
        await user.save()
        return next(new ErrorHandler(error))
    }

    res.status(200).json({
        success: true,
        message: `Email send successfully to ${user.email}`
    })
})

export const resetPassword = asyncError(async (req, res, next) => {

    const { otp, password } = req.body;

    const user = await User.findOne({
        otp,
        otp_expire: {
            $gt: Date.now()
        }
    });

    if (!user) return next(new ErrorHandler("Incorrect otp or has been expired", 400))

    if(!password) return next(new ErrorHandler("Enter password",400))

    user.password = password;
    user.otp = undefined;
    user.otp_expire = undefined;

    await user.save()

    res.status(200).json({
        success: true,
        message: `password changed successfuly, you can login now`
    })
})