package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.FavoriteVacancy;
import com.diplom.internhubbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface FavoriteVacancyRepository extends JpaRepository<FavoriteVacancy, Long> {
    @Modifying
    @Query("delete from FavoriteVacancy fv where fv.user = :user and fv.vacancy.publicId = :publicId")
    void deleteByUserAndVacancyPublicId(User user, String publicId);
}