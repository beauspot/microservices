import request from "supertest";
import mongoose from "mongoose";
import AppConfig from "../../api/helpers/config/AppConfig";
import { CustomerController } from "../../api/controllers/customerControllers";
import { CustomerServiceClass } from "../../api/services/customer.service";
import app from "../../app";

const CustomerInstance = new CustomerServiceClass();

const API_PREFIX = AppConfig.API_PREFIX;
jest.mock("../../api/services/customerService");

const userID = new mongoose.Types.ObjectId().toString();

const userPayload = {
  _id: userID,
  firstName: "userfirstname",
  lastName: "userlastname",
  email: "usermail@mail.com",
  mobileNumber: "+234-090-256-679",
  password: "password",
  confirmPassword: "password",
};
const userInput = {
  _id: userID,
  firstName: "userfirstname",
  lastName: "userlastname",
  email: "usermail@mail.com",
  mobileNumber: "+234-090-256-679",
  password: "password",
  confirmPassword: "password",
};
