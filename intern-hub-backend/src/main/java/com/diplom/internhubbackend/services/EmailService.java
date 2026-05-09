package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.EmailDetails;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@Slf4j
public class EmailService {

    @Autowired
    public JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public void sendSimpleEmail(String recipient, String subject, String body) {
        EmailDetails details = new EmailDetails(recipient, body, subject, null);
        sendSimpleEmail(details);
    }

    public String sendSimpleEmail(EmailDetails details) {
        try {

            SimpleMailMessage mailMessage =
                    new SimpleMailMessage();

            mailMessage.setFrom(sender);
            mailMessage.setTo(details.getRecipient());
            mailMessage.setText(details.getMsgBody());
            mailMessage.setSubject(details.getSubject());

            javaMailSender.send(mailMessage);

            return "Mail Sent Successfully";

        } catch (Exception e) {
            log.error("Error while sending mail", e);
            return "Error while sending mail";
        }
    }


    public String sendMailWithAttachment(
            EmailDetails details) {

        MimeMessage mimeMessage =
                javaMailSender.createMimeMessage();

        MimeMessageHelper helper;

        try {

            helper =
                    new MimeMessageHelper(mimeMessage, true);

            helper.setFrom(sender);
            helper.setTo(details.getRecipient());
            helper.setText(details.getMsgBody());
            helper.setSubject(details.getSubject());

            FileSystemResource file =
                    new FileSystemResource(
                            new File(details.getAttachment()));

            helper.addAttachment(
                    file.getFilename(), file);

            javaMailSender.send(mimeMessage);

            return "Mail Sent Successfully";

        } catch (MessagingException e) {

            return "Error while sending mail";
        }
    }
}
