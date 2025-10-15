package com.diplom.internhubbackend;

import com.diplom.internhubbackend.security.jwt.JWTCreator;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static com.diplom.internhubbackend.security.jwt.JWTCreator.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class InternHubBackendApplicationTests {

    @Test
    void contextLoads() {
    }

}
