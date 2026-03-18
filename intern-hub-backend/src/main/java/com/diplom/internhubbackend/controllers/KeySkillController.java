package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.services.KeySkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skill")
public class KeySkillController {
    private final KeySkillService keySkillService;

    public KeySkillController(KeySkillService keySkillService) {
        this.keySkillService = keySkillService;
    }

    @PostMapping("/add-list-skill")
    public ResponseEntity<Object> addListSkill(@RequestBody KeySkillRequest request) {
        return keySkillService.addListKeySkills(request);
    }
}
