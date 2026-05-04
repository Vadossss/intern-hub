package com.diplom.internhubbackend.schedulers;

import com.diplom.internhubbackend.repositories.VacancyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class VacancyCleanupScheduler {

    private final VacancyRepository vacancyRepository;

    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public void archivedAggregationVacancies() {
        LocalDateTime dateTimeNow = LocalDateTime.now();
        int count = vacancyRepository.archiveVacancies(dateTimeNow);
        log.info("Archived {} vacancies", count);
    }


    @Transactional
    @Scheduled(cron = "0 0 1 * * *")
    public void deletedOldAggregationVacancies() {
        LocalDateTime dateTime = LocalDateTime.now().minusDays(90);
        int count = vacancyRepository.deleteOldVacancies(dateTime);
        log.info("Deleted {} old vacancies", count);
    }
}
