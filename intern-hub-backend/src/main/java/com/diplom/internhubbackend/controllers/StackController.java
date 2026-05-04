package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.services.StackService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stack")
public class StackController {
    private final StackService stackService;

    public StackController(StackService stackService) {
        this.stackService = stackService;
    }

    @Operation(summary = "Получить все направления")
    @GetMapping
    public List<Stack> getAllStacks() {
        return stackService.getAllStacks();
    }
}
