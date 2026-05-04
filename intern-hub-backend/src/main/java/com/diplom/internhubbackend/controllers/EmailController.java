package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.EmailDetails;
import com.diplom.internhubbackend.services.EmailService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(summary = "Отправить письмо на почту")
    @PostMapping()
    public String sendMail(
            @RequestBody EmailDetails details) {

        return emailService.sendSimpleEmail(details);
    }

    @Operation(summary = "Отправить письмо на почту с файлом")
    @PostMapping("/attachment")
    public String sendMailWithAttachment(
            @RequestBody EmailDetails details) {

        return emailService
                .sendMailWithAttachment(details);
    }
}
