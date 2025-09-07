package com.novaid.ideax.dto.auth;

import lombok.Data;

@Data
public class InvestorSignUpRequestDTO {
    private String fullName;
    private String companyName;
    private String position;
    private String investmentFocus;
    private String email;
    private String password;
}