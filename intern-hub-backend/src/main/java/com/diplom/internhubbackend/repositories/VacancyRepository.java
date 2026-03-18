package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    @Query("SELECT v FROM Vacancy v WHERE v.stack = :stack")
    List<Vacancy> findByStack(Stack stack);

    @Query("SELECT v FROM Vacancy v WHERE lower(v.publicId) = :publicId")
    Optional<Vacancy> findByPublicId(String publicId);

    @Query("SELECT v FROM Vacancy v WHERE v.publicId = :publicId and v.status = 'ACTIVE'")
    Optional<Vacancy> findActiveVacancyByPublicId(String publicId);

    @Query("SELECT v FROM Vacancy v JOIN v.source as s WHERE s.code = :sourceCode AND v.externalId = :externalId")
    Optional<Vacancy> findBySourceCodeAndExternalId(String externalId, String sourceCode);

    @Query("SELECT v FROM Vacancy v JOIN FavoriteVacancy fv on fv.vacancy = v WHERE fv.user = :user")
    Optional<List<Vacancy>> findAllFavoriteVacancies(User user);

    @Modifying
    @Query("""
        UPDATE Vacancy v SET v.status = 'ARCHIVED'
        WHERE v.expiresAt < :dateTimeNow and v.status = 'ACTIVE'
        """)
    int archiveVacancies(LocalDateTime dateTimeNow);


    @Modifying
    @Query("""
        DELETE FROM Vacancy v WHERE v.status = 'ARCHIVED'
        and v.isAggregated = true and v.expiresAt < :dateTime
        """)
    int deleteOldVacancies(LocalDateTime dateTime);
}
