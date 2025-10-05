const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pNumber: {type: Number, required: true, unique:true},
    password: { type: String, required: true },
    department: { type: String, required: true },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
