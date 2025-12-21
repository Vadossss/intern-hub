package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Stack;
import com.diplom.internhubbackend.repositories.StackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StackService {
    private final StackRepository stackRepository;

    public StackService(StackRepository stackRepository) {
        this.stackRepository = stackRepository;
    }

    public List<Stack> getAllStacks() {
        return stackRepository.findAll();
    }
}
