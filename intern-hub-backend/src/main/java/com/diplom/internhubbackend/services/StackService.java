package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.repositories.StackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StackService {
    private final StackRepository stackRepository;

    @Cacheable(value = "stacks")
    public List<Stack> getAllStacks() {
        return stackRepository.findAll();
    }

    @Cacheable(value = "stacks", key = "#id")
    public Stack getStackById(String id) {
        return stackRepository.findById(id).orElse(null);
    }
}
