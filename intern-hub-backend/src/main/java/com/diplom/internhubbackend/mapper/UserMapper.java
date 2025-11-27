package com.diplom.internhubbackend.mapper;

import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.models.dto.UserRegisterDto;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User fromDto(UserRegisterDto userDto) {
        User user = createUser(userDto);
        return user;
    }

    private static User createUser(final UserRegisterDto userDto) {
        return new User(userDto.getEmail(), userDto.getPhoneNumber(), userDto.getPassword());
    }
}
