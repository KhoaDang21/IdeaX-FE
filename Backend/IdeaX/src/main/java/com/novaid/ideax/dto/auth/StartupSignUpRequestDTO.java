package com.novaid.ideax.dto.auth;

import lombok.Data;

@Data
public class StartupSignUpRequestDTO {
    private String fullName;
    private String companyName;
    private String email;
    private String website;
    private String companyLogo;
    private String companyDescription;
    private String password;
}
