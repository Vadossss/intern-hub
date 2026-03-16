package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.models.Currency;
import com.diplom.internhubbackend.repositories.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CurrencyService {
    private final CurrencyRepository currencyRepository;

    @Cacheable(value = "currency", key = "#currencyId")
    public Currency getCurrencyById(String currencyId) {
        return currencyRepository.findById(currencyId).orElse(null);
    }
}
