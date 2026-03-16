package com.hospital.controller;

import com.hospital.model.Appointment;
import com.hospital.model.DoctorProfile;
import com.hospital.repository.AppointmentRepository;
import com.hospital.service.AppointmentNotificationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HomeController {

    private static final List<DoctorProfile> DOCTORS = List.of(
        new DoctorProfile("DR. BISWAJIT MAJUMDAR", "CARDIOLOGY", "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)", "", "BY APPOINTMENT", "-"),
        new DoctorProfile("DR. JAYANTA PAL", "CARDIOLOGY", "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)", "", "3PM TO 5PM", "WEDNESDAY"),
        new DoctorProfile("DR. SOUMITRA MONDAL", "CHEST SPECIALIST", "M.B.B.S, M.D, C.C.E.B.D,M", "", "3PM TO 5PM", "TUESDAY"),
        new DoctorProfile("DR. SOHAIL AHMED HOSSAIN", "DENTAL SURGEON", "B.D.S. (HONS)", "", "10AM TO 1PM", "EVERY DAY"),
        new DoctorProfile("DR. MALAY HALDAR", "DERMATOLOGIST, SEXOLOGIST", "M.B.B.S, D.G.D", "", "MON(2PM TO 5PM),FRI(3PM TO 6PM)", "MONDAY, FRIDAY"),
        new DoctorProfile("DR. PROF. SOHAG KUNDU", "E.N.T", "M.B.B.S, M.S", "", "2PM TO 3:30PM", "MONDAY"),
        new DoctorProfile("DR. RAJAT CHAKRABORTY", "EYE SPECIALIST (SURGEON)", "M.B.B.S, M.S (EYE)", "", "10AM TO 1PM", "WEDNESDAY"),
        new DoctorProfile("DR. BINDRA BANERJEE", "GASTROENTEROLOGY", "M.B.B.S. D.N.B(KOLKATA), RGUHS", "", "BY APPOINTMENT", "-"),
        new DoctorProfile("PROF. DR. KRISHNA SEN", "GENERAL MEDICINE", "M.B.B.S, M.D (MEDICINE)", "", "12:30PM TO 3:30PM", "SUNDAY"),
        new DoctorProfile("DR. ARDHENDU SAHANA", "GENERAL MEDICINE", "M.B.B.S, M.D, C.C.E.B.M, C.C.M.T.V", "", "9AM TO 1PM", "MONDAY"),
        new DoctorProfile("DR. ARNAB KUMAR GAYEN", "GENERAL MEDICINE", "M.B.B.S., M.D.", "", "SAT (10:00 AM TO 12:00 PM), SUN(9:00 AM TO 11:00 AM)", "SATURDAY, SUNDAY"),
        new DoctorProfile("DR. SUBHADIP RAPTAN", "GENERAL SURGEON", "M.B.B.S, M.S, GENERAL AND LAPAROSCOPIC SURGEON", "", "10:00 AM TO 1:00 PM", "EVERYDAY"),
        new DoctorProfile("DR. SUJOY PAUL", "GENERAL SURGEON", "M.B.B.S, M.S", "", "9:30AM TO 3:30PM", "FRIDAY"),
        new DoctorProfile("DR. SAGNIK NANDI", "GENERAL SURGEON", "M.B.B.S, M.S", "", "1PM TO 2:30PM(BOTH DAY)", "MONDAY, FRIDAY"),
        new DoctorProfile("DR. SISHIR DAS", "GENERAL SURGEON", "M.B.B.S, M.S, F.M.A.S", "", "9AM TO 10:30AM", "TUESDAY"),
        new DoctorProfile("DR SOURADIP SADHU", "GYNECOLOGIST SURGEON", "M.B.B.S, D.N.B(OBGYN)", "", "1PM TO 3PM", "FRIDAY"),
        new DoctorProfile("DR. CHINMOY GHOSH", "MEDICINE", "M.B.B.S, M.D.", "", "8:30AM TO 10:30AM", "WEDNESDAY"),
        new DoctorProfile("DR. LALSING PADAVI", "MEDICINE", "M.B.B.S, M.D", "", "9:30 AM TO 11:30AM", "TUESDAY"),
        new DoctorProfile("DR. SAIKAT SAHA", "NEUROLOGIST", "M.B.B.S, M.S, M.Ch", "", "2PM TO 4PM", "LAST SUNDAY OF EVERY MONTH"),
        new DoctorProfile("DR. MD. SAHID ALAM", "NEUROLOGIST", "M.B.B.S, M.S, M.Ch", "", "9AM TO 11AM", "EVERY MONTH FIRST 3 SATURDAY"),
        new DoctorProfile("DR. SANKHADEB ACHERJEE", "ORTHOPEDIC", "M.B.B.S, M.S(ORTHO)", "", "MON(1PM TO 2:30PM),TUE(4PM TO 6PM),THU(11:30AM TO 1:30PM),SAT(4PM TO 6PM)", "MONDAY,TUESDAY,THURSDAY,SATURDAY"),
        new DoctorProfile("DR. SUMIT JAIN SETHIA", "ORTHOPEDIC", "M.B.B.S, M.S(ORTHO), M.R.C.S.A (UK)", "", "8:30 AM TO 11:30 AM", "MONDAY"),
        new DoctorProfile("DR. ARGHADEEP BISWAS", "ORTHOPEDIC", "M.B.B.S, M.S (ORTHO)", "", "11:00 AM TO 1:00 PM", "FRIDAY"),
        new DoctorProfile("DR. AMITOSH KUMAR PANDEY", "ORTHOPEDIC", "M.B.B.S, M.S (ORTHO)", "", "8:00 AM TO 1:00 PM", "FRIDAY,SATURDAY,SUNDAY"),
        new DoctorProfile("DR. KUSTAB GARAI", "ORTHOPEDIC", "M.B.B.S, M.S (ORTHO)", "", "9:00 AM TO 11:00 AM", "SUNDAY"),
        new DoctorProfile("DR. SHYAMAL BANERJEE", "PEDIATRIC", "M.B.B.S, D.Ch. M.D,(PED)", "", "2PM TO 3:30PM", "FIRST AND THIRD SUNDAY OF EVERY MONTH"),
        new DoctorProfile("DR. BINAY KUMAR PODDAR", "PEDIATRIC", "M.B.B.S, M.D (PED)", "", "2PM TO 4PM", "WEDNESDAY"),
        new DoctorProfile("DR. NANDITA BHATTACHARYA", "PEDIATRIC AND NEONATOLOGIST", "M.B.B.S, D.Ch", "", "SAT (10AM TO 12PM), WED(9:00 AM TO 10:30 AM)", "SATURDAY,WEDNESDAY"),
        new DoctorProfile("PROF. DR. SUNNY CHATTERJEE", "PSYCHIATRIST", "M.B.B.S, M.D (PSYCH)", "", "2PM TO 5:30PM", "SUNDAY"),
        new DoctorProfile("DR. AMBUJ KR. PANDEY", "PSYCHIATRY", "M.B.B.S, M.D", "", "9:30 AM TO 11:30AM", "FRIDAY"),
        new DoctorProfile("DR. TAPAN KUMAR MONDAL(Sr.)", "UROLOGIST", "M.B.B.S, M.S, F.R.C.S(UK), F.R.C.S (EDIN)", "", "8AM TO 11AM", "WEDNESDAY"),
        new DoctorProfile("DR. SUSANTA KUMAR DAS", "UROSURGEON", "M.B.B.S, M.S, D.N.B, M.CH(URO)", "", "4PM TO 5PM", "SUNDAY")
    );

    private final AppointmentRepository appointmentRepository;
    private final AppointmentNotificationService appointmentNotificationService;

    public HomeController(AppointmentRepository appointmentRepository,
                          AppointmentNotificationService appointmentNotificationService) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentNotificationService = appointmentNotificationService;
    }

    @ModelAttribute("doctors")
    public List<DoctorProfile> doctors() {
        return DOCTORS;
    }

    @ModelAttribute("departments")
    public List<String> departments() {
        return DOCTORS.stream()
            .map(DoctorProfile::getDepartment)
            .distinct()
            .collect(Collectors.toList());
    }

    @ModelAttribute("appointmentNumbers")
    public List<String> appointmentNumbers() {
        return List.of("9732029834", "9641809010", "8116198498");
    }

    @ModelAttribute("appointmentNumbersText")
    public String appointmentNumbersText() {
        return String.join(", ", appointmentNumbers());
    }

    @GetMapping("/")
    public String home(Model model) {
        if (!model.containsAttribute("appointment")) {
            model.addAttribute("appointment", new Appointment());
        }
        return "index";
    }

    @PostMapping("/book-appointment")
    public String bookAppointment(@Valid @ModelAttribute("appointment") Appointment appointment,
                                  BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "index";
        }

        appointmentRepository.save(appointment);
        appointmentNotificationService.sendAppointmentEmail(appointment);
        return "confirmation";
    }
}
