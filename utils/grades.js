const calculateLasuGrades = (grades) => {
  const lasuMap = {
    A1: 10,
    B2: 9,
    C3: 8,
    C4: 7,
    C5: 6,
    C6: 5,
    D7: 4,
    E8: 3,
    F9: 2,
  };

  let totalScore = 0;
  let olevelPassed = true;
  grades.map((grade) => {
    totalScore += lasuMap[grade];
    if (grade < 5) olevelPassed = false;
  });

  return {
    totalScore,
    olevelPassed,
  };
};
const calculateEksuGrades = (grades) => {
  const eksuMap = {
    A1: 8,
    B2: 7,
    C3: 6,
    C4: 5,
    C5: 4,
    C6: 3,
    D7: 2,
    E8: 1,
    F9: 0,
  };

  let totalScore = 0;
  let olevelPassed = true;
  grades.map((grade) => {
    totalScore += eksuMap[grade];
    if (grade < 5) olevelPassed = false;
  });

  return {
    totalScore,
    olevelPassed,
  };
};

module.exports = {
  calculateEksuGrades,
  calculateLasuGrades,
};
