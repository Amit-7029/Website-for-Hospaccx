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
        new DoctorProfile("DR. BISWAJIT MAJUMDAR", "CARDIOLOGY", "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)", "600", "BY APPOINTMENT", "-"),
        new DoctorProfile("DR. JAYANTA PAL", "CARDIOLOGY", "M.B.B.S, M.D (MEDICINE), D.M (CARDIO)", "600", "3PM TO 5PM", "WEDNESDAY"),
        new DoctorProfile("DR. SOUMITRA MONDAL", "CHEST SPECIALIST", "M.B.B.S, M.D, C.C.E.B.D,M", "400", "3PM TO 5PM", "TUESDAY"),
        new DoctorProfile("DR. SOHAIL AHMED HOSSAIN", "DENTAL SURGEON", "B.D.S. (HONS)", "300", "10AM TO 1PM", "EVERY DAY"),
        new DoctorProfile("DR. MALAY HALDAR", "DERMATOLOGIST, SEXOLOGIST", "M.B.B.S, D.G.D", "500", "MON(2PM TO 5PM), FRI(3PM TO 6PM)", "MONDAY, FRIDAY"),
        new DoctorProfile("DR. PROF. SOHAG KUNDU", "E.N.T", "M.B.B.S, M.S", "500", "2PM TO 3:30PM", "MONDAY"),
        new DoctorProfile("DR. DEBABRATA HALDAR", "E.N.T", "M.B.B.S, D.L.O", "500", "1PM TO 2:30PM", "FRIDAY"),
        new DoctorProfile("DR. RAJAT CHAKRABORTY", "EYE SPECIALIST (SURGEON)", "M.B.B.S, M.S (EYE)", "400", "10AM TO 1PM", "WEDNESDAY"),
        new DoctorProfile("DR. BINDRA BANERJEE", "GASTROENTEROLOGY", "M.B.B.S. D.N.B(KOLKATA), RGUHS", "700", "BY APPOINTMENT", "-"),
        new DoctorProfile("DR. ANKAN SAHA", "GASTROENTEROLOGY", "M.B.B.S, M.D, D.M", "700", "BY APPOINTMENT", "-"),
        new DoctorProfile("PROF. DR. KRISHNA SEN", "GENERAL MEDICINE", "M.B.B.S, M.D (MEDICINE)", "500", "12:30PM TO 3:30PM", "SUNDAY"),
        new DoctorProfile("DR. ARDHENDU SAHANA", "GENERAL MEDICINE", "M.B.B.S, M.D, C.C.E.B.M, C.C.M.T.V", "500", "9AM TO 1PM", "MONDAY"),
        new DoctorProfile("DR. ARNAB KUMAR GAYEN", "GENERAL MEDICINE", "M.B.B.S, M.D", "450", "SAT (10AM TO 12PM), SUN(9AM TO 11AM)", "SATURDAY, SUNDAY"),
        new DoctorProfile("DR. SUBHADIP RAPTAN", "GENERAL SURGEON", "M.B.B.S, M.S, GENERAL AND LAPAROSCOPIC SURGEON", "500", "10AM TO 1PM", "EVERY DAY"),
        new DoctorProfile("DR. SUJOY PAUL", "GENERAL SURGEON", "M.B.B.S, M.S", "500", "9:30AM TO 3:30PM", "FRIDAY"),
        new DoctorProfile("DR. SAGNIK NANDI", "GENERAL SURGEON", "M.B.B.S, M.S", "400", "1PM TO 2:30PM", "MONDAY, FRIDAY"),
        new DoctorProfile("DR. SISHIR DAS", "GENERAL SURGEON", "M.B.B.S, M.S, F.M.A.S", "400", "9AM TO 10:30AM", "TUESDAY"),
        new DoctorProfile("DR. SOURADIP SADHU", "GYNECOLOGIST SURGEON", "M.B.B.S, D.N.B (OBGYN)", "400", "1PM TO 3PM", "FRIDAY"),
        new DoctorProfile("DR. CHINMOY GHOSH", "MEDICINE", "M.B.B.S, M.D", "400", "8:30AM TO 10:30AM", "WEDNESDAY"),
        new DoctorProfile("DR. SAIKAT SAHA", "NEUROLOGIST", "M.B.B.S, M.S, M.Ch", "700", "2PM TO 4PM", "LAST SUNDAY OF EVERY MONTH"),
        new DoctorProfile("DR. MD. SAHID ALAM", "NEUROLOGIST", "M.B.B.S, M.S, M.Ch", "700", "9AM TO 11AM", "EVERY MONTH FIRST 3 SATURDAY"),
        new DoctorProfile("DR. INDRANIL DUTTA", "NEUROLOGIST", "DM MEDICINE, D.M(NEURO)", "700", "3PM TO 5PM", "FIRST SUNDAY OF EVERY MONTH"),
        new DoctorProfile("DR. GOURANGA MAITY", "OPTOMETRY", "OPTOMETRY", "200", "9AM TO 4PM", "SUNDAY, MONDAY, TUESDAY, WEDNESDAY"),
        new DoctorProfile("DR. SANKHADEB ACHERJEE", "ORTHOPEDIC", "M.B.B.S, M.S(ORTHO)", "400", "MON(1PM TO 2:30PM), TUE(4PM TO 6PM), THU(11:30AM TO 1:30PM), SAT(4PM TO 6PM)", "MONDAY, TUESDAY, THURSDAY, SATURDAY"),
        new DoctorProfile("DR. SUMIT JAIN SETHIA", "ORTHOPEDIC", "M.B.B.S, M.S(ORTHO), M.R.C.S.A (UK)", "400", "8:30AM TO 11:30AM", "MONDAY"),
        new DoctorProfile("DR. ARGHADEEP BISWAS", "ORTHOPEDIC", "M.B.B.S, M.S (ORTHO)", "400", "11AM TO 1PM", "FRIDAY"),
        new DoctorProfile("DR. KUSTAB GARAI", "ORTHOPEDIC", "M.B.B.S, M.S (ORTHO)", "450", "9AM TO 11AM", "SUNDAY"),
        new DoctorProfile("DR. SHYAMAL BANERJEE", "PEDIATRIC", "M.B.B.S, D.Ch, M.D (PED)", "800", "2PM TO 3:30PM", "FIRST AND THIRD SUNDAY OF EVERY MONTH"),
        new DoctorProfile("DR. BINAY KUMAR PODDAR", "PEDIATRIC", "M.B.B.S, M.D (PED)", "500", "2PM TO 4PM", "WEDNESDAY"),
        new DoctorProfile("DR. NANDITA BHATTACHARYA", "PEDIATRIC AND NEONATOLOGIST", "M.B.B.S, D.Ch", "400", "SAT (10AM TO 12PM), WED(9AM TO 10:30AM)", "SATURDAY, WEDNESDAY"),
        new DoctorProfile("PROF. DR. SUNNY CHATTERJEE", "PSYCHIATRIST", "M.B.B.S, M.D (PSYCH)", "500", "2PM TO 5:30PM", "SUNDAY"),
        new DoctorProfile("DR. TAPAN KUMAR MONDAL(Sr.)", "UROLOGIST", "M.B.B.S, M.S, F.R.C.S(UK), F.R.C.S (EDIN)", "700", "8AM TO 11AM", "WEDNESDAY"),
        new DoctorProfile("DR. LALSING PADAVI", "MEDICINE", "M.B.B.S, M.D", "400", "9:30AM TO 11:30AM", "TUESDAY"),
        new DoctorProfile("DR. AMBUJ KR. PANDEY", "PSYCHIATRY", "M.B.B.S, M.D", "500", "9:30AM TO 11:30AM", "FRIDAY"),
        new DoctorProfile("DR. SUSANTA KUMAR DAS", "UROSURGEON", "M.B.B.S, M.S, D.N.B, M.CH(URO)", "600", "4PM TO 5PM", "SUNDAY")
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
