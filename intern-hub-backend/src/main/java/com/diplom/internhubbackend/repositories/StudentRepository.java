package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {
}
