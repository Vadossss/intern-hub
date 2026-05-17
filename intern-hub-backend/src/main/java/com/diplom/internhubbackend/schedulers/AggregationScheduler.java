package com.diplom.internhubbackend.schedulers;

import com.diplom.internhubbackend.services.VacancyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AggregationScheduler {

    private final VacancyService vacancyService;

//    @Scheduled(cron = "0 0 0/2 * * *")
//    @Scheduled(initialDelay = 5000)
    public void runAggregation() {
        vacancyService.fetchAndSaveHH();
    }

//    @Scheduled(initialDelay = 5000)
    public void runAggregationSJ() {
        vacancyService.fetchAndSaveSJ();
    }
}
