const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.json());

const client = twilio("ACCOUNT_SID", "AUTH_TOKEN");

app.post("/send-sms", async (req, res) => {
  try {
    await client.messages.create({
      body: "🚨 Emergency Alert!",
      from: "+1XXXXXXXXXX",
      to: "+91XXXXXXXXXX"
    });

    res.send("SMS sent");
  } catch (err) {
    res.send(err);
  }
});

app.listen(5000, () => console.log("Server running"));