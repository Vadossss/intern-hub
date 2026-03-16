package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.KeySkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface KeySkillRepository extends JpaRepository<KeySkill, Integer> {

    @Query("select k from KeySkill k where LOWER(k.name) = LOWER(:name)")
    Optional<KeySkill> findByName(String name);

    List<KeySkill> findAllByNameIn(Set<String> names);
}
