package com.novaid.ideax.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final SignUpService signUpService;

    @PostMapping("/signup/startup")
    public ResponseEntity<SignUpResponseDTO> signupStartup(@RequestBody StartupSignUpRequestDTO dto) {
        return ResponseEntity.ok(signUpService.registerStartup(dto));
    }

    @PostMapping("/signup/investor")
    public ResponseEntity<SignUpResponseDTO> signupInvestor(@RequestBody InvestorSignUpRequestDTO dto) {
        return ResponseEntity.ok(signUpService.registerInvestor(dto));
    }
}