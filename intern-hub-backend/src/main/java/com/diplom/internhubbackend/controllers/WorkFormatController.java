package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.WorkFormat;
import com.diplom.internhubbackend.services.WorkFormatService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/format")
public class WorkFormatController {

    private final WorkFormatService workFormatService;

    public WorkFormatController(WorkFormatService workFormatService) {
        this.workFormatService = workFormatService;
    }

    @GetMapping()
    public List<WorkFormat> getAllWorkFormats() {
        return workFormatService.getAllWorkFormat();
    }
}
