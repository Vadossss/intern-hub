package com.diplom.internhubbackend.security.jwt;

import com.diplom.internhubbackend.models.User;
import com.diplom.internhubbackend.security.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtil {

    private final JwtProperties jwtProperties;

    public JwtUtil(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String bearerToken) {
        return extractExpiry(bearerToken).before(new Date());
    }

    public Date extractExpiry(String bearerToken) {
        return extractExpiration(bearerToken);
    }

    public String createAccessToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(getExpiryDate(jwtProperties.getAccessTokenExpirationTime()))
                .signWith(getSignKey(jwtProperties.getSecret()), SignatureAlgorithm.HS256)
                .compact();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        log.info(claims.getExpiration().toString()) ;
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignKey(jwtProperties.getSecret()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(token);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);

            return username != null
                    && username.equals(userDetails.getUsername())
                    && !isTokenExpired(token);

        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Date getExpiryDate(final int tokenExpirationInSec) {
        Date now = new Date();
        return new Date(now.getTime() + tokenExpirationInSec * 1000L);
    }
}
