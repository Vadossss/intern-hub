package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Internship;
import com.diplom.internhubbackend.models.InternshipRequest;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import com.diplom.internhubbackend.services.InternshipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internship")
public class InternshipController {

    private final InternshipService internshipService;
    private final KeySkillRepository keySkillRepository;

    public InternshipController(InternshipService internshipService, KeySkillRepository keySkillRepository) {
        this.internshipService = internshipService;
        this.keySkillRepository = keySkillRepository;
    }

    @PostMapping("/createInternship")
    public ResponseEntity<Object> createInternship(@RequestBody InternshipRequest internshipRequest) {
        return internshipService.createInternship(internshipRequest);
    }

    @GetMapping("/get")
    public ResponseEntity<Object> getInternship() {
        return internshipService.fetchInternship();
    }
}
