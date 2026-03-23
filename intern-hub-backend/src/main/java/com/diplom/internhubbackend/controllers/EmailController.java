package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.EmailDetails;
import com.diplom.internhubbackend.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send-mail")
    public String sendMail(
            @RequestBody EmailDetails details) {

        return emailService.sendSimpleEmail(details);
    }

    @PostMapping("/send-mail-with-attachment")
    public String sendMailWithAttachment(
            @RequestBody EmailDetails details) {

        return emailService
                .sendMailWithAttachment(details);
    }
}
