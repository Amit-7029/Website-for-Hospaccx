const rawDoctors = [
  {
    name: "DR. BISWAJIT MAJUMDAR",
    department: "CARDIOLOGY",
    qualification: "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)",
    timing: "BY APPOINTMENT",
    opdDays: "-",
    gender: "male"
  },
  {
    name: "DR. JAYANTA PAL",
    department: "CARDIOLOGY",
    qualification: "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)",
    timing: "3PM TO 5PM",
    opdDays: "WEDNESDAY",
    gender: "male"
  },
  {
    name: "DR. SOUMITRA MONDAL",
    department: "CHEST SPECIALIST",
    qualification: "M.B.B.S, M.D, C.C.E.B.D,M",
    timing: "3PM TO 5PM",
    opdDays: "TUESDAY",
    gender: "male"
  },
  {
    name: "DR. SOHAIL AHMED HOSSAIN",
    department: "DENTAL SURGEON",
    qualification: "B.D.S. (HONS)",
    timing: "10AM TO 1PM",
    opdDays: "EVERY DAY",
    gender: "male"
  },
  {
    name: "DR. MALAY HALDAR",
    department: "DERMATOLOGIST, SEXOLOGIST",
    qualification: "M.B.B.S, D.G.D",
    timing: "MON(2PM TO 5PM), FRI(3PM TO 6PM)",
    opdDays: "MONDAY, FRIDAY",
    gender: "male"
  },
  {
    name: "DR. PROF. SOHAG KUNDU",
    department: "E.N.T",
    qualification: "M.B.B.S, M.S",
    timing: "2PM TO 3:30PM",
    opdDays: "MONDAY",
    gender: "male"
  },
  {
    name: "DR. RAJAT CHAKRABORTY",
    department: "EYE SPECIALIST (SURGEON)",
    qualification: "M.B.B.S, M.S (EYE)",
    timing: "10AM TO 1PM",
    opdDays: "WEDNESDAY",
    gender: "male"
  },
  {
    name: "DR. BINDRA BANERJEE",
    department: "GASTROENTEROLOGY",
    qualification: "M.B.B.S. D.N.B(KOLKATA), RGUHS",
    timing: "BY APPOINTMENT",
    opdDays: "-",
    gender: "male"
  },
  {
    name: "PROF. DR. KRISHNA SEN",
    department: "GENERAL MEDICINE",
    qualification: "M.B.B.S, M.D (MEDICINE)",
    timing: "12:30PM TO 3:30PM",
    opdDays: "SUNDAY",
    gender: "male"
  },
  {
    name: "DR. ARDHENDU SAHANA",
    department: "GENERAL MEDICINE",
    qualification: "M.B.B.S, M.D, C.C.E.B.M, C.C.M.T.V",
    timing: "9AM TO 1PM",
    opdDays: "MONDAY",
    gender: "male"
  },
  {
    name: "DR. ARNAB KUMAR GAYEN",
    department: "GENERAL MEDICINE",
    qualification: "M.B.B.S., M.D.",
    timing: "SAT (10:00 AM TO 12:00 PM), SUN(9:00 AM TO 11:00 AM)",
    opdDays: "SATURDAY, SUNDAY",
    gender: "male"
  },
  {
    name: "DR. SUBHADIP RAPTAN",
    department: "GENERAL SURGEON",
    qualification: "M.B.B.S, M.S, GENERAL AND LAPAROSCOPIC SURGEON",
    timing: "10:00 AM TO 1:00 PM",
    opdDays: "EVERYDAY",
    gender: "male"
  },
  {
    name: "DR. SUJOY PAUL",
    department: "GENERAL SURGEON",
    qualification: "M.B.B.S, M.S",
    timing: "9:30AM TO 3:30PM",
    opdDays: "FRIDAY",
    gender: "male"
  },
  {
    name: "DR. SAGNIK NANDI",
    department: "GENERAL SURGEON",
    qualification: "M.B.B.S, M.S",
    timing: "1PM TO 2:30PM(BOTH DAY)",
    opdDays: "MONDAY, FRIDAY",
    gender: "male"
  },
  {
    name: "DR. SISHIR DAS",
    department: "GENERAL SURGEON",
    qualification: "M.B.B.S, M.S, F.M.A.S",
    timing: "9AM TO 10:30AM",
    opdDays: "TUESDAY",
    gender: "male"
  },
  {
    name: "DR SOURADIP SADHU",
    department: "GYNECOLOGY",
    specialization: "Gynecology Surgeon",
    qualification: "M.B.B.S, D.N.B(OBGYN)",
    timing: "1PM TO 3PM",
    opdDays: "FRIDAY",
    gender: "male",
    services: [
      "Gynecology consultation",
      "Women's health guidance",
      "Routine gynecological support"
    ]
  },
  {
    id: "dr-nirmita-saha",
    name: "Dr. Nirmita Saha",
    department: "GYNECOLOGY",
    specialization: "Gynecology Specialist",
    qualification: "M.B.B.S., M.S. (Obs & Gynae)",
    timing: "SUNDAY (FROM 4:00 PM), THURSDAY (FROM 10:00 AM)",
    opdDays: "SUNDAY, THURSDAY",
    gender: "female",
    availability: [
      { day: "SUNDAY", from: "4:00 PM" },
      { day: "THURSDAY", from: "10:00 AM" }
    ],
    services: [
      "Pregnancy and maternity care",
      "Infertility treatment",
      "Hormonal issues in women",
      "All gynecological problems"
    ],
    image: "/images/doctor-female.jpeg"
  },
  {
    name: "DR. CHINMOY GHOSH",
    department: "MEDICINE",
    qualification: "M.B.B.S, M.D.",
    timing: "8:30AM TO 10:30AM",
    opdDays: "WEDNESDAY",
    gender: "male"
  },
  {
    name: "DR. LALSING PADAVI",
    department: "MEDICINE",
    qualification: "M.B.B.S, M.D",
    timing: "9:30 AM TO 11:30AM",
    opdDays: "TUESDAY",
    gender: "male"
  },
  {
    name: "DR. SAIKAT SAHA",
    department: "NEUROLOGIST",
    qualification: "M.B.B.S, M.S, M.Ch",
    timing: "2PM TO 4PM",
    opdDays: "LAST SUNDAY OF EVERY MONTH",
    gender: "male"
  },
  {
    name: "DR. MD. SAHID ALAM",
    department: "NEUROLOGIST",
    qualification: "M.B.B.S, M.S, M.Ch",
    timing: "9AM TO 11AM",
    opdDays: "EVERY MONTH FIRST 3 SATURDAY",
    gender: "male"
  },
  {
    name: "DR. SANKHADEB ACHERJEE",
    department: "ORTHOPEDIC",
    qualification: "M.B.B.S, M.S(ORTHO)",
    timing: "MON(1PM TO 2:30PM), TUE(4PM TO 6PM), THU(11:30AM TO 1:30PM), SAT(4PM TO 6PM)",
    opdDays: "MONDAY, TUESDAY, THURSDAY, SATURDAY",
    gender: "male"
  },
  {
    name: "DR. SUMIT JAIN SETHIA",
    department: "ORTHOPEDIC",
    qualification: "M.B.B.S, M.S(ORTHO), M.R.C.S.A (UK)",
    timing: "8:30 AM TO 11:30 AM",
    opdDays: "MONDAY",
    gender: "male"
  },
  {
    name: "DR. ARGHADEEP BISWAS",
    department: "ORTHOPEDIC",
    qualification: "M.B.B.S, M.S (ORTHO)",
    timing: "11:00 AM TO 1:00 PM",
    opdDays: "FRIDAY",
    gender: "male"
  },
  {
    name: "DR. AMITOSH KUMAR PANDEY",
    department: "ORTHOPEDIC",
    qualification: "M.B.B.S, M.S (ORTHO)",
    timing: "8:00 AM TO 1:00 PM",
    opdDays: "FRIDAY, SATURDAY, SUNDAY",
    gender: "male"
  },
  {
    name: "DR. KUSTAB GARAI",
    department: "ORTHOPEDIC",
    qualification: "M.B.B.S, M.S (ORTHO)",
    timing: "9:00 AM TO 11:00 AM",
    opdDays: "SUNDAY",
    gender: "male"
  },
  {
    name: "DR. SHYAMAL BANERJEE",
    department: "PEDIATRIC",
    qualification: "M.B.B.S, D.Ch. M.D,(PED)",
    timing: "2PM TO 3:30PM",
    opdDays: "FIRST AND THIRD SUNDAY OF EVERY MONTH",
    gender: "male"
  },
  {
    name: "DR. BINAY KUMAR PODDAR",
    department: "PEDIATRIC",
    qualification: "M.B.B.S, M.D (PED)",
    timing: "2PM TO 4PM",
    opdDays: "WEDNESDAY",
    gender: "male"
  },
  {
    name: "DR. NANDITA BHATTACHARYA",
    department: "PEDIATRIC AND NEONATOLOGIST",
    qualification: "M.B.B.S, D.Ch",
    timing: "SAT (10AM TO 12PM), WED(9:00 AM TO 10:30 AM)",
    opdDays: "SATURDAY, WEDNESDAY",
    gender: "female"
  },
  {
    name: "PROF. DR. SUNNY CHATTERJEE",
    department: "PSYCHIATRIST",
    qualification: "M.B.B.S, M.D (PSYCH)",
    timing: "2PM TO 5:30PM",
    opdDays: "SUNDAY",
    gender: "male"
  },
  {
    name: "DR. AMBUJ KR. PANDEY",
    department: "PSYCHIATRY",
    qualification: "M.B.B.S, M.D",
    timing: "9:30 AM TO 11:30AM",
    opdDays: "FRIDAY",
    gender: "male"
  },
  {
    name: "DR. TAPAN KUMAR MONDAL(Sr.)",
    department: "UROLOGIST",
    qualification: "M.B.B.S, M.S, F.R.C.S(UK), F.R.C.S (EDIN)",
    timing: "8AM TO 11AM",
    opdDays: "WEDNESDAY",
    gender: "male"
  },
  {
    name: "DR. SUSANTA KUMAR DAS",
    department: "UROSURGEON",
    qualification: "M.B.B.S, M.S, D.N.B, M.CH(URO)",
    timing: "4PM TO 5PM",
    opdDays: "SUNDAY",
    gender: "male"
  }
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeAvailability(doctor) {
  if (doctor.availability?.length) {
    return doctor.availability;
  }

  if (doctor.opdDays === "-" || doctor.timing.toUpperCase().includes("BY APPOINTMENT")) {
    return [{ day: "BY APPOINTMENT", from: "Please contact reception" }];
  }

  return doctor.opdDays
    .split(",")
    .map((day) => day.trim())
    .filter(Boolean)
    .map((day) => ({ day, from: doctor.timing }));
}

function normalizeServices(doctor) {
  if (doctor.services?.length) {
    return doctor.services;
  }

  return [
    `${doctor.department} consultation`,
    "Specialist diagnosis and follow-up support",
    "Appointment-based OPD care"
  ];
}

function normalizeDoctor(doctor) {
  const gender = doctor.gender === "female" ? "female" : "male";

  return {
    id: doctor.id ?? slugify(doctor.name),
    name: doctor.name,
    department: doctor.department,
    specialization: doctor.specialization ?? doctor.department,
    qualification: doctor.qualification,
    timing: doctor.timing,
    opdDays: doctor.opdDays,
    gender,
    image: doctor.image ?? (gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg"),
    posterImage: doctor.posterImage ?? null,
    availability: normalizeAvailability(doctor),
    services: normalizeServices(doctor)
  };
}

export const doctors = rawDoctors.map((doctor, index) =>
  normalizeDoctor({
    ...doctor,
    posterImage: index < 31 ? `/images/DR ${index + 1}.jpeg` : doctor.posterImage ?? null
  })
);
export const departments = [...new Set(doctors.map((doctor) => doctor.department))].sort();
export { normalizeDoctor, slugify };
