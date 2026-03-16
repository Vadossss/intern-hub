package com.diplom.internhubbackend.schedulers;

import com.diplom.internhubbackend.services.StackService;
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
    private final StackService stackService;

    @Scheduled(cron = "0 0 0/2 * * *")
    public void runAggregation() {
        stackService.getAllStacks().forEach(stack -> {
            log.info("Aggregating stack {}", stack.getName());
            vacancyService.fetchAndSave(stack);
        });
    }
}
