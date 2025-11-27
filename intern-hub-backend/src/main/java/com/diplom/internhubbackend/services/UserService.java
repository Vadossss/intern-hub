package com.diplom.internhubbackend.services;

import com.diplom.internhubbackend.exception.EmailAlreadyExistsException;
import com.diplom.internhubbackend.exception.PhoneNumberAlreadyExistsException;
import com.diplom.internhubbackend.exception.UserNotFoundException;
import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void registerUser(User user) {
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        else {
            if (user.getPhoneNumber() != null && existsByPhoneNumber(user.getPhoneNumber())) {
                    throw new PhoneNumberAlreadyExistsException("Phone Number already exists");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
    }

    private void generateAuthResponse() {

    }

    @Transactional
    public boolean existsByEmail(final String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public boolean existsByPhoneNumber(final String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}
