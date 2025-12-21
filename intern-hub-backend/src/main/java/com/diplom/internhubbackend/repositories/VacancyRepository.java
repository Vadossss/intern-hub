package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
//    @Query("SELECT v FROM Vacancy v WHERE v.id = :id JOIN FETCH ")
//    Vacancy fullFindById(Integer id);
}
