package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.dto.hh.HhKeySkill;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class KeySkillService {
    private final KeySkillRepository keySkillRepository;

    public KeySkillService(KeySkillRepository keySkillRepository) {
        this.keySkillRepository = keySkillRepository;
    }

    @Cacheable(value = "keySkills")
    public Set<KeySkill> getAllKeySkillsById(Set<Integer> ids) {
        return new HashSet<>(keySkillRepository.findAllById(ids));
    }

    public KeySkill getKeySkillByName(String name) {
        return keySkillRepository.findByName(name)
                .orElseGet(() -> keySkillRepository.save(KeySkill.builder().name(name).build()));
    }

    public ResponseEntity<Object> addListKeySkills(KeySkillRequest request) {
        Set<KeySkill> keySkills = request.getKeySkills();
        if (keySkills.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        keySkillRepository.saveAll(keySkills);
        return ResponseEntity.ok().body("Success adding key skills");
    }

    public Set<KeySkill> parseAndSaveKeySkills(List<HhKeySkill> keySkills) {
        Set<String> names = keySkills.stream()
                .map(HhKeySkill::name)
                .collect(Collectors.toSet());

        List<KeySkill> existing = keySkillRepository.findAllByNameIn(names);

        Map<String, KeySkill> map = existing.stream()
                .collect(Collectors.toMap(KeySkill::getName, key -> key));

        Set<KeySkill> result = new HashSet<>();

        for (String name : names) {
            KeySkill keySkill = map.get(name);
            if (keySkill == null) {
                keySkill = keySkillRepository.save(KeySkill.builder().name(name).build());
            }
            result.add(keySkill);
        }

        return result;
    }
}
