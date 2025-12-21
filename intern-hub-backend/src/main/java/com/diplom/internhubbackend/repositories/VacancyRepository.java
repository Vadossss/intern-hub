package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    @Query("SELECT v FROM Vacancy v WHERE v.stack = :stack")
    List<Vacancy> findByStack(Stack stack);
}
