package com.diplom.internhubbackend.repositories;

import com.diplom.internhubbackend.models.Currency;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyRepository extends JpaRepository<Currency, String> {
}
