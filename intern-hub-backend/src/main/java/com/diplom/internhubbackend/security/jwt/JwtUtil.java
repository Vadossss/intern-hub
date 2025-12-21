package com.diplom.internhubbackend.security.jwt;

import com.diplom.internhubbackend.exception.ExpiredTokenException;
import com.diplom.internhubbackend.models.JwtPair;
import com.diplom.internhubbackend.security.config.CustomUserDetails;
import com.diplom.internhubbackend.security.config.JwtProperties;
import com.diplom.internhubbackend.services.CustomUserDetailsService;
import io.jsonwebtoken.*;
import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
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
public class JwtUtil {

    private final JwtProperties jwtProperties;

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.accessTokenExpirationTime}")
    private int accessTokenExpirationTime;

    @Value("${security.jwt.refreshTokenExpirationTime}")
    private int refreshTokenExpirationTime;

    private final CustomUserDetailsService customUserDetailsService;

    public JwtUtil(JwtProperties jwtProperties, CustomUserDetailsService customUserDetailsService) {
        this.jwtProperties = jwtProperties;
        this.customUserDetailsService = customUserDetailsService;
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
        return Jwts.parserBuilder().setSigningKey(jwtProperties.getSecret())
                .build().parseClaimsJws(bearerToken);
    }

//    public boolean validateToken(String token, UserDetails userDetails) {
//        final String userName = extractUsername(token);
//        return userName.equals(userDetails.getUsername()) && !isTokenExpired(token);
//    }

    private Boolean isTokenExpired(String bearerToken) {
        return extractExpiry(bearerToken).before(new Date());
    }

    public Date extractExpiry(String bearerToken) {
        return extractClaimBody(bearerToken, Claims::getExpiration);
    }


    public JwtPair generateTokenPair(CustomUserDetails customUserDetails) {
        return new JwtPair(createAccessToken(customUserDetails), createRefreshToken(customUserDetails));
    }

    public String createToken(Map<String, Object> claims, String subject) {
        Date expiryDate = Date.from(Instant.ofEpochMilli(System.currentTimeMillis() + jwtProperties.getValidity()));
        Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(jwtProperties.getSecret()),
                SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(expiryDate)
                .signWith(hmacKey)
                .compact();
    }

    private String createRefreshToken(final UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(getExpiryDate(jwtProperties.getRefreshTokenExpirationTime()))
                .signWith(SignatureAlgorithm.HS512, jwtProperties.getSecret())
                .compact();
    }

    private String createAccessToken(final UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(getExpiryDate(jwtProperties.getAccessTokenExpirationTime()))
                .signWith(SignatureAlgorithm.HS512, jwtProperties.getSecret())
                .compact();
    }

    public CustomUserDetails parseJwtToken(final String token) {
        CustomUserDetails customUserDetails = null;
        if (StringUtils.isNotEmpty(token) && validateToken(token)) {
            String email = Jwts.parserBuilder().setSigningKey(jwtProperties.getSecret()).
                    build().parseClaimsJws(token).getBody().getSubject();
            customUserDetails = customUserDetailsService.loadUserByUsername(email);
        }
        return customUserDetails;
    }

    public boolean validateToken(final String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtProperties.getSecret()).parseClaimsJws(authToken);
            return true;
        } catch (UnsupportedJwtException | MalformedJwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid JWT token: ", ex);
        } catch (SignatureException | ExpiredJwtException expiredEx) {
            throw new ExpiredTokenException(authToken, "JWT Token expired", expiredEx);
        }
    }

    private Date getExpiryDate(final int tokenExpirationInSec) {
        Date now = new Date();
        return new Date(now.getTime() + tokenExpirationInSec * 1000L);
    }
}
