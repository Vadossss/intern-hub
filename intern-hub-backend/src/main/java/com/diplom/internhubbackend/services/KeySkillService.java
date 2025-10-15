package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class KeySkillService {
    private final KeySkillRepository keySkillRepository;

    public KeySkillService(KeySkillRepository keySkillRepository) {
        this.keySkillRepository = keySkillRepository;
    }

    public ResponseEntity<Object> addListKeySkills(KeySkillRequest request) {
        Set<KeySkill> keySkills = request.getKeySkills();
        if (keySkills.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        keySkillRepository.saveAll(keySkills);
        return ResponseEntity.ok().body("Success adding key skills");
    }
}
