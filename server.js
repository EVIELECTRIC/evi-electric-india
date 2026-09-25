const express = require("express");
const path = require("path");
const fs = require("fs"); // फ़ाइल सिस्टम मॉड्यूल जोड़ा
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// डेटा फ़ाइलों के पाथ सेट किए
const USERS_FILE = path.join(__dirname, "users.json");
const WITHDRAWALS_FILE = path.join(__dirname, "withdrawals.json");

// फ़ाइल से डेटा पढ़ने का फंक्शन
const readData = (filePath) => {
try {
if (!fs.existsSync(filePath)) return [];
const data = fs.readFileSync(filePath, "utf8");
return JSON.parse(data || "[]");
} catch (err) {
return [];
}
};

// फ़ाइल में डेटा सेव करने का फंक्शन
const writeData = (filePath, data) => {
try {
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
} catch (err) {
console.error("Error writing file:", err);
}
};

// 1. Register API
app.post("/api/register", (req, res) => {
const { name, mobile, password } = req.body || {};
if (!name || !mobile || !password) return res.status(400).json({ error: "All fields are required" });

const users = readData(USERS_FILE);
const userExists = users.some(u => u.mobile === mobile);
if (userExists) return res.status(409).json({ error: "Mobile already registered" });

const newUser = { id: users.length + 1, name, mobile, password, balance: 0 };
users.push(newUser);
writeData(USERS_FILE, users);

res.json({ ok: true, user: { id: newUser.id, name, mobile, balance: 0 } });
});

// 2. Login API
app.post("/api/login", (req, res) => {
const { mobile, password } = req.body || {};
const users = readData(USERS_FILE);
const user = users.find(u => u.mobile === mobile && u.password === password);

if (!user) return res.status(401).json({ error: "Invalid login" });
res.json({ ok: true, user: { id: user.id, name: user.name, mobile: user.mobile, balance: user.balance } });
});

// 3. Withdraw API
app.post("/api/withdraw", (req, res) => {
const { userId, amount, upi } = req.body || {};
const users = readData(USERS_FILE);
const
