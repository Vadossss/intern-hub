package com.diplom.internhubbackend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

public class JWTCreator {
    private static String secret = "5JzoMbk6E5qIqHSuBTgeQCARtUsxAkBiHwdjXOSW8kWdXzYmP3X51C0";

    public static String createJwt() {

        Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(secret),
                SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .claim("id", "abc123")
                .claim("role", "admin")
                .setIssuer("TestApplication")
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(10, ChronoUnit.MINUTES)))
                .signWith(hmacKey)
                .compact();
    }

    public static Jws<Claims> parseJwt(String jwtString) {
        Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(secret), SignatureAlgorithm.HS256.getJcaName());

        return Jwts.parserBuilder()
                .setSigningKey(hmacKey)
                .build()
                .parseClaimsJws(jwtString);
    }
}
