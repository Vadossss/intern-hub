package com.diplom.internhubbackend.models;

import com.diplom.internhubbackend.enums.AccountStatus;
import com.diplom.internhubbackend.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User {
    public static final int START_SEQ = 100000;

    @Id
    @SequenceGenerator(name = "user_seq", sequenceName = "user_seq", allocationSize = 1, initialValue = START_SEQ)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    private Integer id;

    @Column(unique = true, length = 200)
    private String email;

    @Column(unique = true, length = 20)
    private String phoneNumber;

    private String password;

    private String city;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    private String firstName;
    private String lastName;

    private String companyName;

    private Boolean isAggregated;

    @Enumerated(EnumType.STRING)
    private AccountStatus status =  AccountStatus.ACTIVE;

    private String blockReason;

    private LocalDateTime blockedAt;

    private LocalDateTime blockedUntil;

    private Boolean verified;
    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;

    private String avatarUrl = null;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merged_into_id")
    private User mergedInto;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }
}
