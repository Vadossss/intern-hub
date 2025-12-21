package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.models.dto.KeySkillDto;
import org.mapstruct.*;


import java.util.Set;

@Mapper(componentModel = "spring")
public interface KeySkillMapper {

    KeySkillDto toDto(KeySkill skill);

    Set<KeySkillDto> toDtoSet(Set<KeySkill> skills);
}
