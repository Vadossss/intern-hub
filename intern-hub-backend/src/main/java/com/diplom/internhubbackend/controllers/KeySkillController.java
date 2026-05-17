package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.projection.KeySkillProjection;
import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.services.KeySkillService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/skill")
public class KeySkillController {
    private final KeySkillService keySkillService;

    public KeySkillController(KeySkillService keySkillService) {
        this.keySkillService = keySkillService;
    }

    @Operation(summary = "Добавить ключевые навыки")
    @PostMapping()
    public ResponseEntity<Object> addListSkill(@RequestBody KeySkillRequest request) {
        return keySkillService.addListKeySkills(request);
    }

    @GetMapping()
    public Set<KeySkillProjection> getAllKeySkills() {
        return keySkillService.getAllKeySkills();
    }
}
