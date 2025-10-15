package com.diplom.internhubbackend.security.jwt;

import com.diplom.internhubbackend.security.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtHelper {

    private final JwtProperties jwtProperties;


    public JwtHelper(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String extractUsername(String bearerToken) {
        return extractClaimBody(bearerToken, Claims::getSubject);
    }

    public <T> T extractClaimBody(String bearerToken,
                                  Function<Claims, T> claimsResolver) {
        Jws<Claims> jwsClaims = extractClaims(bearerToken);
        return claimsResolver.apply(jwsClaims.getBody());
    }

    private Jws<Claims> extractClaims(String bearerToken) {
        return Jwts.parserBuilder().setSigningKey(jwtProperties.getSecretKey())
                .build().parseClaimsJws(bearerToken);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUsername(token);
        return userName.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private Boolean isTokenExpired(String bearerToken) {
        return extractExpiry(bearerToken).before(new Date());
    }

    public Date extractExpiry(String bearerToken) {
        return extractClaimBody(bearerToken, Claims::getExpiration);
    }

    public String createToken(Map<String, Object> claims, String subject) {
        Date expiryDate = Date.from(Instant.ofEpochMilli(System.currentTimeMillis() + jwtProperties.getValidity()));
        Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(jwtProperties.getSecretKey()),
                SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(expiryDate)
                .signWith(hmacKey)
                .compact();
    }
}
