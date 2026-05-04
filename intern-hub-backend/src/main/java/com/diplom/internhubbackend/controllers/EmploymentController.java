package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Employment;
import com.diplom.internhubbackend.services.EmploymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employment")
public class EmploymentController {

    private final EmploymentService employmentService;

    public EmploymentController(EmploymentService employmentService) {
        this.employmentService = employmentService;
    }

    @GetMapping
    public List<Employment> getAllEmployments() {
        return employmentService.getAllEmployments();
    }
}
