const express=require("express");
const path=require("path");
const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const users=[];
const withdrawals=[];

app.post("/api/register",(req,res)=>{
  const {name,mobile,password}=req.body||{};
  if(!name||!mobile||!password) return res.status(400).json({error:"All fields are required"});
  if(users.some(u=>u.mobile===mobile)) return res.status(409).json({error:"Mobile already registered"});
  const user={id:users.length+1,name,mobile,password,balance:0};
  users.push(user);
  res.json({ok:true,user:{id:user.id,name:user.name,mobile:user.mobile,balance:user.balance}});
});

app.post("/api/login",(req,res)=>{
  const {mobile,password}=req.body||{};
  const user=users.find(u=>u.mobile===mobile&&u.password===password);
  if(!user) return res.status(401).json({error:"Invalid login"});
  res.json({ok:true,user:{id:user.id,name:user.name,mobile:user.mobile,balance:user.balance}});
});

app.post("/api/withdraw",(req,res)=>{
  const {userId,amount,upi}=req.body||{};
  const user=users.find(u=>u.id===Number(userId));
  if(!user) return res.status(404).json({error:"User not found"});
  if(!upi||!amount||Number(amount)<=0) return res.status(400).json({error:"Valid UPI and amount required"});
  if(Number(amount)>user.balance) return res.status(400).json({error:"Insufficient balance"});
  const w={id:withdrawals.length+1,userId:user.id,amount:Number(amount),upi,status:"pending",createdAt:new Date().toISOString()};
  withdrawals.push(w);
  user.balance-=Number(amount);
  res.json({ok:true,withdrawal:w,balance:user.balance});
});

app.get("/api/admin/users",(req,res)=>res.json(users.map(({password,...u})=>u)));
app.get("/api/admin/withdrawals",(req,res)=>res.json(withdrawals));

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(process.env.PORT||3000,()=>console.log("EVI Electric server running"));
