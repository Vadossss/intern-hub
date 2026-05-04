package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.dto.KeySkillDto;
import com.diplom.internhubbackend.models.KeySkill;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class KeySkillMapper {
    public KeySkillDto toDto(KeySkill keySkill) {
        return new KeySkillDto(keySkill.getId(), keySkill.getName());
    }

    public Set<KeySkillDto> toDto(Set<KeySkill> keySkills) {
        return keySkills.stream().map(this::toDto).collect(Collectors.toSet());
    }
}
