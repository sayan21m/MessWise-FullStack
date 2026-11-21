import request from "supertest";
import app from "../src/app.js";

const mail = "sayangarai04@gmail.com";
const password = "messWise@123";

const registerPayload = {
    first_name: "Sayan",
    last_name: "Garai",
    mail: mail,
    password,
};

const response = await request(app).post("/api/v1/register").send(registerPayload);

const loginResponse = await request(app).post("/api/v1/login").send({
  mail,
  password,
});

let accessToken = loginResponse.body.accessToken;
console.log(accessToken);

// let invitition_response = await request(app)
//   .post("/api/v1/mess/cmwpww3i900001rit362gyl6w/invitation")
//   .send({
//     invited_email: "rahul@messwise.com",
//   })
//   .set("Authorization", `Bearer ${accessToken}`);

// console.log(JSON.parse(invitition_response.text));

// const uniqueMail = `mili@messwise.test`;

// const registerPayload = {
//   first_name: "Soumili",
//   last_name: "Hazra",
//   mail: uniqueMail,
//   password,
// };

// const response = await request(app).post("/api/v1/register").send(registerPayload);

// let new_invitition_response = await request(app)
//   .post("/api/v1/mess/cmwpww3i900001rit362gyl6w/invitation")
//   .send({
//     invited_email: "mili@messwise.test",
//   })
//   .set("Authorization", `Bearer ${accessToken}`);

// console.log(JSON.parse(new_invitition_response.text));
