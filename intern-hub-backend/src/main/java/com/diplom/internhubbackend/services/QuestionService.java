package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.QuestionNullException;
import com.diplom.internhubbackend.models.Question;
import com.diplom.internhubbackend.repositories.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;


    public Question addQuestion(Question question) {
        if (question.getHeading()==null || question.getContent()==null){
            throw new QuestionNullException("Question`s Heading` or Content` is null");
        }

        return  questionRepository.save(question);
    }

    public String deleteQuestion(@PathVariable Integer id) {
        questionRepository.deleteById(id);

        return "Question" + id + "deleted";
    }

    public Question getQuestionById(@PathVariable int id) {
        return questionRepository.findById(id).orElse(null);
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
}
