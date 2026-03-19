package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.LearnIsNotFoundException;
import com.diplom.internhubbackend.exception.LearnNullException;
import com.diplom.internhubbackend.models.Learn;
import org.apache.logging.log4j.message.Message;
import org.springframework.stereotype.Service;
import com.diplom.internhubbackend.repositories.LearnRepository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
public class LearnService {
    private final LearnRepository learnRepository;

    public LearnService(LearnRepository learnRepository) {
        this.learnRepository = learnRepository;
    }

    public Learn addLearn(Learn learn) {

        if (learn.getHeading()==null || learn.getContent()==null){
            throw new LearnNullException("Learn is null");
        }

        return learnRepository.save(learn);
    }

    public String deleteLearn(@PathVariable Integer learnId) {
        learnRepository.deleteById(learnId);
        return "Lern " + learnId + " was successfully deleted";
    }

    public Learn getLearnById(int id) {
        return learnRepository.findById(id).get();
    }

    public List<Learn> getAllLearns() { return learnRepository.findAll(); }


}
