package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

}
