package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.WorkFormat;
import com.diplom.internhubbackend.repositories.WorkFormatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkFormatService {
    private final WorkFormatRepository workFormatRepository;

    @Cacheable(value = "workFormat", key = "#workFormatId")
    public WorkFormat getWorkFormatById(String workFormatId) {
        return workFormatRepository.findById(workFormatId).orElse(null);
    }

    public List<WorkFormat> getAllWorkFormatById(List<String> workFormats) {
        return workFormatRepository.findAllById(workFormats);
    }

    public List<WorkFormat> getAllWorkFormat() {
        return workFormatRepository.findAll();
    }
}
