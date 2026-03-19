package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Learn;
import com.diplom.internhubbackend.services.LearnService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/learn")
public class LearnController {

    private final LearnService learnService;

    public LearnController(LearnService learnService) {
        this.learnService = learnService;
    }

    @Operation(summary = "Добавить новое обучение")
    @PostMapping("/addLearn")
    public ResponseEntity<Object> addLearn(@RequestBody Learn learn) {
        return ResponseEntity.ok(learnService.addLearn(learn));
    }

    @Operation(summary = "Удалить обучение из базы")
    @DeleteMapping("/deleteLearn/{learnId}")
    public ResponseEntity<Object> deleteLearn(@PathVariable Integer learnId) {
        return ResponseEntity.ok(learnService.deleteLearn(learnId));
    }

    @Operation(summary = "Получить обучение по id")
    @GetMapping("/getLearn/{id}")
    public ResponseEntity<Object> findLearn(@PathVariable Integer id) {
       return ResponseEntity.ok(learnService.getLearnById(id));
    }

    @Operation(summary = "Получить все записи обучения")
    @GetMapping("/getAllLearns")
    public ResponseEntity<Object> findAllLearns() {
        return ResponseEntity.ok(learnService.getAllLearns());
    }



}
