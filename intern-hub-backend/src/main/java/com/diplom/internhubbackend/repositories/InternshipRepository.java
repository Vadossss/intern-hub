package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Internship;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternshipRepository extends JpaRepository<Internship, Integer> {
}
