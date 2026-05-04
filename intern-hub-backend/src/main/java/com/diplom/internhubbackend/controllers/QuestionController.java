package com.diplom.internhubbackend.controllers;

import com.diplom.internhubbackend.models.Question;
import com.diplom.internhubbackend.services.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/question")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @Operation(summary = "Добавить новый вопрос")
    @PostMapping("/add")
    public ResponseEntity<Object> addQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.addQuestion(question));
    }

    @Operation(summary = "Удалить вопрос по id")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteQuestion(@PathVariable Integer id) {
        return ResponseEntity.ok(questionService.deleteQuestion(id));
    }

    @Operation(summary = "Получить все вопросы")
    @GetMapping("/get-all")
    public ResponseEntity<Object> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @Operation(summary = "Получить вопрос по id")
    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<Object> getQuestionById(@PathVariable Integer id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }


}
