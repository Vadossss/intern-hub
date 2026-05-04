package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.dto.hh.HhKeySkill;
import com.diplom.internhubbackend.mapper.KeySkillMapper;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.KeySkillRequest;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import jakarta.transaction.Transactional;
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
    private final KeySkillMapper  keySkillMapper;

    public KeySkillService(KeySkillRepository keySkillRepository, KeySkillMapper keySkillMapper) {
        this.keySkillRepository = keySkillRepository;
        this.keySkillMapper = keySkillMapper;
    }

    @Cacheable(value = "keySkills")
    public Set<KeySkill> getAllKeySkillsById(Set<Integer> ids) {
        return new HashSet<>(keySkillRepository.findAllById(ids));
    }

    public Set<KeySkillDto> getAllKeySkills() {
        return keySkillMapper.toDto(new HashSet<>(keySkillRepository.findAll()));
    }

    public KeySkill getKeySkillByName(String name) {
        return keySkillRepository.findByName(name).orElse(null);
    }

    public Set<KeySkill> getExistingKeySkillsByNames(Set<String> names) {
        if (names == null || names.isEmpty()) {
            return Collections.emptySet();
        }
        return new HashSet<>(keySkillRepository.findAllByNameIn(names));
    }

    @Transactional
    public void ensureCatalogSkillsExist(Set<String> catalogSkills) {
        if (catalogSkills == null || catalogSkills.isEmpty()) {
            return;
        }

        Set<String> normalized = catalogSkills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (normalized.isEmpty()) {
            return;
        }

        Set<String> existingNames = keySkillRepository.findAllByNameIn(normalized).stream()
                .map(KeySkill::getName)
                .collect(Collectors.toSet());

        List<KeySkill> missing = normalized.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> KeySkill.builder().name(name).build())
                .toList();

        if (!missing.isEmpty()) {
            keySkillRepository.saveAll(missing);
        }
    }

    public ResponseEntity<Object> addListKeySkills(KeySkillRequest request) {
        Set<KeySkill> keySkills = request.getKeySkills();
        if (keySkills.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        keySkillRepository.saveAll(keySkills);
        return ResponseEntity.ok().body("Success adding key skills");
    }

    @Transactional
    public Set<KeySkill> parseAndSaveKeySkills(List<HhKeySkill> keySkills) {
        if (keySkills == null || keySkills.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> names = keySkills.stream()
                .map(HhKeySkill::name)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());

        if (names.isEmpty()) {
            return Collections.emptySet();
        }

        return getExistingKeySkillsByNames(names);
    }
}
