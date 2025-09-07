package com.novaid.ideax.config;



import com.novaid.ideax.entity.auth.Account;
import com.novaid.ideax.enums.Role;
import com.novaid.ideax.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializr implements CommandLineRunner {
    @Autowired
    private AuthenticationRepository authenticationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initAdminAccount();
    }
    private void initAdminAccount() {
        if (!authenticationRepository.existsByRole(Role.ADMIN)) {
            Account admin = Account.builder()
                    .email("admin@system.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .status(Status.ACTIVE)
                    .fullName("Admin System")
                    .companyName("System Default")
                    .phone("0000000000")
                    .companyDescription("System default administrator account")
                    .createAt(LocalDateTime.now())
                    .build();
            authenticationRepository.save(admin);
            System.out.println("✅ Default admin account created: admin@system.com / 123456");
        }
    }

}
