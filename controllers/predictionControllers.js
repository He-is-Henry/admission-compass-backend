const axios = require("axios");
const { calculateLasuGrades, calculateEksuGrades } = require("../utils/grades");

async function predictLASU(req, res) {
  const { grades, utme, faculty, department } = req.body;
  // Collect grades for each of of the 5 subjects
  // A1 = 10, B2 = 9, B3 = 8, C4 = 7, C5 = 6, C6 = 5
  if (!grades || !utme || !faculty || !department)
    res.status(400).json({ error: "All fields are required" });
  const { totalScore, olevelPassed } = calculateLasuGrades(grades);
  // Calculate screening score - add olevel points and divide jamb by 8
  const screeningScore = totalScore + utme / 8;
  //  olevel average points olevel total points / 5
  const olevelAverage = totalScore / 5;
  try {
    const response = await axios.post("http://localhost:5000/lasu", {
      features: [
        utme,
        screeningScore,
        faculty,
        department,
        olevelPassed,
        olevelAverage,
      ],
      // features = [utme_score, screening_score, faculty, department, olevel_passed, olevel_avg_points]
    });
    res.json(response.data.prediction);
    console.log("LASU Prediction:", response.data.prediction);
  } catch (err) {
    console.error("LASU Error:", err.response?.data || err.message);
  }
}
async function predictEKSU() {
  try {
    const { utme, grades, sittings, faculty, department } = req.body;
    if (!grades || !utme || !faculty || !department || !sittings)
      return res.status(400).json({ error: "All fields are required" });
    const { totalScore, olevelPassed } = calculateEksuGrades(grades);
    const response = await axios.post("http://localhost:5000/eksu", {
      // features = [utme_score, screening_score, olevel_valid, sittings, faculty, department]
      features: [utme, totalScore, olevelPassed, sittings, faculty, department],
    });

    res.json(response.data.prediction);
    console.log("EKSU Prediction:", response.data.prediction);
  } catch (err) {
    console.error("EKSU Error:", err.response?.data || err.message);
  }
}

module.exports = {
  predictEKSU,
  predictLASU,
};
