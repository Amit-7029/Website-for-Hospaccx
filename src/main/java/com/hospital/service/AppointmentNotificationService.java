package com.hospital.service;

import com.hospital.model.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AppointmentNotificationService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentNotificationService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String toAddress;
    private final String mailPassword;

    public AppointmentNotificationService(JavaMailSender mailSender,
                                          @Value("${spring.mail.username:}") String fromAddress,
                                          @Value("${clinic.notification.to:}") String toAddress,
                                          @Value("${spring.mail.password:}") String mailPassword) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.mailPassword = mailPassword;
    }

    public void sendAppointmentEmail(Appointment appointment) {
        if (!StringUtils.hasText(fromAddress) || !StringUtils.hasText(toAddress) || !StringUtils.hasText(mailPassword)) {
            log.warn("Appointment email skipped because mail configuration is incomplete. fromAddressPresent={}, toAddressPresent={}, passwordPresent={}",
                StringUtils.hasText(fromAddress), StringUtils.hasText(toAddress), StringUtils.hasText(mailPassword));
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toAddress);
            message.setReplyTo(appointment.getEmail());
            message.setSubject("New Appointment Request - " + appointment.getDepartment());
            message.setText("""
                New appointment request received.

                Name: %s
                Email: %s
                Phone: %s
                Department: %s
                Preferred Date: %s
                Preferred Time: %s
                """.formatted(
                appointment.getName(),
                appointment.getEmail(),
                appointment.getPhone(),
                appointment.getDepartment(),
                appointment.getDate(),
                appointment.getTime()
            ));

            mailSender.send(message);
            log.info("Appointment email sent for {} to {}", appointment.getDepartment(), toAddress);
        } catch (Exception ignored) {
            log.error("Failed to send appointment email for {}: {}", appointment.getDepartment(), ignored.getMessage(), ignored);
        }
    }
}
