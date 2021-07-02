require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs")
require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth")
// const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended : false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY)

app.get("/", (req, res) => {
    res.render("index")
});
app.get("/contact",auth, (req, res) => {
    // console.log(`cookie ${req.cookies.jwt}`)
    res.render("contact")
});
app.get("/logout",auth, async(req, res) => {
     try{
         req.user.tokens = req.user.tokens.filter((currElement)=>{
           return currElement.token  !== req.token;
         })
        //  logout from all devices
        // req.user.tokens =[];
          res.clearCookie("jwt")
          console.log("logout successfully")
          await req.user.save();
          res.render("login")
     }catch(error){
         res.status(500).send(error);
     }
   
});

app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/register", (req, res) => {
    res.render("register")
});
// create a new user in our data base
app.post("/register", async(req, res) => {
     try{
        //  console.log(req.body.firstname);
        //   res.end(req.body.firstname);
       
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword)
        {
           const registerEmployee = new Register({
               firstname: req.body.firstname,
               lastname: req.body.lastname,
               email: req.body.email,
               gender: req.body.gender,
               phone: req.body.phone,
               age: req.body.age,
               password:  req.body.password ,
               confirmpassword: req.body.confirmpassword
           })

           console.log("the success part" + registerEmployee)
           const token = await registerEmployee.generateAuthToken();
           console.log("the token part" + token)
        //    cookies
          res.cookie("jwt", token,{
              expires:new Date(Date.now() + 600000),
              httpOnly:true
          })
          console.log(cookie)

           const registered = await registerEmployee.save();
           console.log("the page part" + registered)
        
           res.status(201).render("index");
        //    console.log(registered);
        }
        else{
            res.send('password is not matching');
        }

      } catch (err){
          res.status(400).send(err); 
        console.log("error page");

      }
});
app.post("/login", async(req, res) => {
    try{
        const email = req.body.email;
     
        const password = req.body.password;
        // console.log(`email : ${email} and password : ${password}`)

        const useremail= await Register.findOne({email:email});
        const isMatch = bcrypt.compare(password,useremail.password)

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token)

        res.cookie("jwt", token,{
            expires:new Date(Date.now() + 600000),
            httpOnly:true,
            // secure:true
        })

       

      if(isMatch)
      {
          res.status(201).render("index")
      }
      else{
          res.send('Invalid  Details ')
      }
    }catch (err){
        res.status(400).send("Invalid email or password")
    }
    
});
    //    const bcrypt=require("bcryptjs");
    //    const securePassword = async(password)=>{
    //        const passwordHash = await bcrypt.hash(password,10)
    //        console.log(passwordHash)

    //        const passwordmatch = await bcrypt.compare(password, passwordHash)
    //        console.log(passwordmatch)
    //    }

    //    securePassword("1234")

    const jwt = require("jsonwebtoken");

    const createToken = async()=>{
        const token = await jwt.sign({_id:"60de9044af02b82b3cb4618c"}, "abcdefghijklmnopqrstuvwxyzabcdefghij",{
            expiresIn:"2 minutes"
        })
       

        console.log(token)
        const userVar =  await jwt.verify(token, "abcdefghijklmnopqrstuvwxyzabcdefghij")
        console.log(userVar);
    }
    createToken();

app.listen(port, () => {
    console.log(`server is runnin at http://localsost:${3000}`);
})