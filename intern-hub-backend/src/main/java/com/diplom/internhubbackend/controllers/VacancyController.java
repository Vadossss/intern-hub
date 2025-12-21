package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.mapper.VacancyMapper;
import com.diplom.internhubbackend.models.VacancyCache;
import com.diplom.internhubbackend.models.dto.FilterParams;
import com.diplom.internhubbackend.models.dto.NewVacancyDto;
import com.diplom.internhubbackend.models.dto.PageResponse;
import com.diplom.internhubbackend.models.enums.VacancySource;
import com.diplom.internhubbackend.services.VacancyService;
import com.diplom.internhubbackend.services.VacanciesCacheService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internship")
public class VacancyController {

    private final VacancyService vacancyService;
    private final VacanciesCacheService vacanciesCacheService;
    private final VacancyMapper vacancyMapper;

    public VacancyController(VacancyService vacancyService, VacanciesCacheService vacanciesCacheService,
                             VacancyMapper vacancyMapper) {
        this.vacancyService = vacancyService;
        this.vacanciesCacheService = vacanciesCacheService;
        this.vacancyMapper = vacancyMapper;
    }

    @PostMapping("/createVacancy")
    public ResponseEntity<Object> createInternship(@RequestBody NewVacancyDto vacancyRequest) {
        return vacancyService.createVacancy(vacancyMapper.fromDto(vacancyRequest));
    }

    @GetMapping("/getVacancies")
    public ResponseEntity<Object> getVacancy(@RequestParam Integer id) {
        return ResponseEntity.ok(vacancyMapper.toDto(vacancyService.getVacancy(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Расширенный поиск вакансий с использованием RediSearch")
    public ResponseEntity<PageResponse<VacancyCache>> searchVacancies(
            @RequestParam(required = false) VacancySource source,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String schedule,
            @RequestParam(required = false) String employment,
            @RequestParam(required = false) String salaryMin,
            @RequestParam(required = false) String salaryMax,
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) List<String> workFormats,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection) {

        FilterParams filterParams = new FilterParams();
        filterParams.setSource(source);
        filterParams.setPosition(position);
        filterParams.setCity(city);
        filterParams.setSchedule(schedule);
        filterParams.setEmployment(employment);
        filterParams.setSalaryMin(salaryMin);
        filterParams.setSalaryMax(salaryMax);
        filterParams.setSearchText(searchText);
        filterParams.setWorkFormats(workFormats);
        filterParams.setPage(page);
        filterParams.setSize(size);
        filterParams.setSortBy(sortBy);
        filterParams.setSortDirection(sortDirection);

        List<VacancyCache> results = vacanciesCacheService.searchWithRediSearch(filterParams);

        int fromIndex = filterParams.getPage() != null ? filterParams.getPage() * filterParams.getSize() : 0;
        int pageSize = filterParams.getSize() != null ? filterParams.getSize() : results.size();

        if (fromIndex >= results.size()) {
            return ResponseEntity.ok(PageResponse.of(
                    List.of(),
                    filterParams.getPage() != null ? filterParams.getPage() : 0,
                    pageSize,
                    results.size()
            ));
        }

        int toIndex = Math.min(fromIndex + pageSize, results.size());
        List<VacancyCache> pageContent = results.subList(fromIndex, toIndex);

        return ResponseEntity.ok(PageResponse.of(
                pageContent,
                filterParams.getPage() != null ? filterParams.getPage() : 0,
                pageSize,
                results.size()
        ));
    }

    @GetMapping("/search/text")
    @Operation(summary = "Полнотекстовый поиск по всем полям")
    public ResponseEntity<List<VacancyCache>> fullTextSearch(
            @RequestParam String query) {

        List<VacancyCache> results = vacanciesCacheService.fullTextSearch(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/cities")
    @Operation(summary = "Получить список уникальных городов")
    public ResponseEntity<List<String>> getCities() {
        List<String> cities = vacanciesCacheService.getDistinctCities();
        return ResponseEntity.ok(cities);
    }
}
