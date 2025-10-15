package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.services.KeySkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/skill")
public class KeySkillController {
    private final KeySkillService keySkillService;

    public KeySkillController(KeySkillService keySkillService) {
        this.keySkillService = keySkillService;
    }

    @PostMapping("/addListSkill")
    public ResponseEntity<Object> addListSkill(@RequestBody KeySkillRequest request) {
        return keySkillService.addListKeySkills(request);
    }
}
