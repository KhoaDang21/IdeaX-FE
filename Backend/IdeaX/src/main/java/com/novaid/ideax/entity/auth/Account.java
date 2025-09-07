package com.novaid.ideax.entity.auth;

import com.novaid.ideax.enums.Role;
import com.novaid.ideax.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "Account")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Email", unique = true, nullable = false)
    private String email;

    @Column(name = "Password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false)
    private Role role; // ADMIN, STARTUP, INVESTOR

    @Column(name = "Full_Name")
    @Nationalized
    private String fullName;

    @Column(name = "Company_Name")
    @Nationalized
    private String companyName;

    @Column(name = "Website")
    private String website;

    @Column(name = "Company_Logo")
    private String companyLogo; // Lưu link file (S3/Firebase)

    @Column(name = "Company_Description", columnDefinition = "TEXT")
    @Nationalized
    private String companyDescription;

    @Column(name = "Phone", unique = true)
    private String phone;

    @Column(name = "Create_at")
    private LocalDateTime createAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status")
    private Status status; // ACTIVE, INACTIVE

    @PrePersist
    protected void onCreate() {
        this.createAt = LocalDateTime.now();
    }

    // Spring Security methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == Status.ACTIVE;
    }
}

