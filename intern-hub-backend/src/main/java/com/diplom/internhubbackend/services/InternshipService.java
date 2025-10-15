package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Internship;
import com.diplom.internhubbackend.models.InternshipRequest;
import com.diplom.internhubbackend.models.KeySkill;
import com.diplom.internhubbackend.repositories.InternshipRepository;
import com.diplom.internhubbackend.repositories.KeySkillRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class InternshipService {
    private final InternshipRepository internshipRepository;
    private final KeySkillRepository keySkillRepository;
    private final RestClient defaultRestClient = RestClient.create();

    public InternshipService(InternshipRepository internshipRepository, KeySkillRepository keySkillRepository) {
        this.internshipRepository = internshipRepository;
        this.keySkillRepository = keySkillRepository;
    }

    public ResponseEntity<Object> createInternship(InternshipRequest internshipRequest) {
        Internship internship = new Internship();
        internship.setName(internshipRequest.getName());
        internship.setDescription(internshipRequest.getDescription());
        internship.setLocation(internshipRequest.getLocation());
        internship.setIsPaid(internshipRequest.getIsPaid());
        internship.setStartDate(internshipRequest.getStartDate());
        internship.setEndDate(internshipRequest.getEndDate());
        internship.setDuration(internshipRequest.getDuration());
        internship.setSalary(internshipRequest.getSalary());

        Set<KeySkill> skills = new HashSet<>(keySkillRepository.findAllById(internshipRequest.getSkills()));
        internship.setSkills(skills);

        internshipRepository.save(internship);
        return ResponseEntity.ok().body("Successfully created internship");
    }

    public ResponseEntity<Object> fetchInternship() {
        String str = defaultRestClient.get()
                .uri("https://api.hh.ru/vacancies?text=intern&per_page=10").retrieve().body(String.class);
        JsonNode node = null;
        List<JsonNode> interns = new ArrayList<>();
        try {
            node = new ObjectMapper().readTree(str);
            JsonNode items = node.get("items");
            for (JsonNode item : items) {
                if (!item.get("id").isNull()) {
                    JsonNode itemData = new ObjectMapper().readTree(defaultRestClient.get()
                            .uri(String.format("https://api.hh.ru/vacancies/%d",
                                    item.get("id").asInt())).retrieve().body(String.class));
                    interns.add(itemData);
                }
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok().body(interns);
    }


}
