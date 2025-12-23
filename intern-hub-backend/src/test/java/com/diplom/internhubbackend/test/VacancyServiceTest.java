package com.diplom.internhubbackend.test;

import com.diplom.internhubbackend.models.*;
import com.diplom.internhubbackend.models.enums.VacancySource;
import com.diplom.internhubbackend.repositories.VacancyRepository;
import com.diplom.internhubbackend.services.CustomUserDetailsService;
import com.diplom.internhubbackend.services.VacanciesCacheService;
import com.diplom.internhubbackend.services.VacancyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class VacancyServiceTest {
    @Mock
    private VacancyRepository vacancyRepository;

    @Mock
    private VacanciesCacheService cacheService;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @InjectMocks
    private VacancyService vacancyService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createVacancy() {
        Vacancy vacancy = new Vacancy();

        User employer = new User();
        employer.setId(1);

        when(customUserDetailsService.getCurrentUser()).thenReturn(employer);

        ResponseEntity<Object> response = vacancyService.createVacancy(vacancy);

        assertEquals("Successfully created vacancy", response.getBody());
        assertEquals(200, response.getStatusCodeValue());

        verify(customUserDetailsService, times(1)).getCurrentUser();
        verify(vacancyRepository, times(1)).save(vacancy);

        assertEquals(employer, vacancy.getEmployer());
    }

    @Test
    void testCacheFromDB() {
        Stack stack = new Stack();
        stack.setId("java");
        stack.setName("Java");

        WorkFormat workFormat = new WorkFormat();
        workFormat.setName("remote");

        Employment employment = new Employment();
        employment.setName("full");

        Currency currency = new Currency();
        currency.setAbbr("RUB");

        Vacancy vacancy = new Vacancy();
        vacancy.setId(100);
        vacancy.setTitle("Java Developer");
        vacancy.setCity("Москва");
        vacancy.setStack(stack);
        vacancy.setWorkFormat(workFormat);
        vacancy.setEmployment(employment);
        vacancy.setSalaryFrom(100000);
        vacancy.setSalaryTo(150000);
        vacancy.setCurrency(currency);

        List<Vacancy> vacancies = List.of(vacancy);

        when(vacancyRepository.findByStack(stack)).thenReturn(vacancies);

        vacancyService.cacheFromDB(stack);

        verify(cacheService, times(1)).save(
                eq("ih_100"),
                eq(VacancySource.INTERNHUB),
                eq(stack),
                eq("Java Developer"),
                eq("remote"),
                eq("full"),
                eq("Москва"),
                eq("100000-150000 RUB")
        );
    }

}
