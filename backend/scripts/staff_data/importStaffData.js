import fs from "fs";
import csv from "csv-parser";
import Staff from "../../api/models/staffModel.js";
import connectDB from "../../config/db.config.js";

// Connect to MongoDB
connectDB();

const csvFilePath = "./scripts/staff_data/employeenew.csv";

const importCSV = async () => {
  const results = [];

  // Define the correct headers manually
  const headers = [
    "Staff_ID",
    "Staff_FName",
    "Staff_LName",
    "Dept",
    "Position",
    "Country",
    "Email",
    "Reporting_Manager",
    "Role",
  ];

  // Read and parse the CSV file with manual headers mapping
  fs.createReadStream(csvFilePath)
    .pipe(csv({ headers: headers, skipLines: 1 })) // Skips the first line since it's the header
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      try {
        // Insert data into MongoDB
        for (const row of results) {
          await Staff.create({
            staff_id: row.Staff_ID?.trim() || "Unknown",
            staff_fname: row.Staff_FName?.trim() || "Unknown",
            staff_lname: row.Staff_LName?.trim() || "Unknown",
            dept: row.Dept?.trim() || "Unknown",
            position: row.Position?.trim() || "Unknown",
            country: row.Country?.trim() || "Unknown",
            email: row.Email?.trim() || "Unknown",
            reporting_manager: row.Reporting_Manager?.trim() || "Unknown",
            role: row.Role?.trim() || "Unknown",
          });
        }
        console.log("CSV data imported successfully.");
      } catch (error) {
        console.error("Error importing CSV data:", error.message);
      }
    });
};

importCSV();
