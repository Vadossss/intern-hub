package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.dto.VacancySourceResponseDto;
import com.diplom.internhubbackend.dto.VacancySourceUpsertDto;
import com.diplom.internhubbackend.services.VacancySourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/vacancy-sources")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class VacancySourceAdminController {

    private final VacancySourceService vacancySourceService;

    @GetMapping
    public List<VacancySourceResponseDto> getSources() {
        return vacancySourceService.getAdminSources();
    }

    @PostMapping
    public VacancySourceResponseDto createSource(@RequestBody VacancySourceUpsertDto request) {
        return vacancySourceService.createSource(request);
    }

    @PatchMapping("/{source_id}")
    public VacancySourceResponseDto updateSource(
            @PathVariable(name = "source_id") Short sourceId,
            @RequestBody VacancySourceUpsertDto request
    ) {
        return vacancySourceService.updateSource(sourceId, request);
    }

    @DeleteMapping("/{source_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSource(@PathVariable(name = "source_id") Short sourceId) {
        vacancySourceService.deleteSource(sourceId);
    }
}
