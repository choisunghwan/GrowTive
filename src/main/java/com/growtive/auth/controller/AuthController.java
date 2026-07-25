package com.growtive.auth.controller;

import com.growtive.auth.dto.LoginRequestDto;
import com.growtive.auth.dto.UserResponseDto;
import com.growtive.auth.service.AuthService;

import com.growtive.user.model.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.growtive.auth.dto.RegisterRequestDto;


import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 작성자: 최성환
     * 세션에 LOGIN_USER 저장
     * @param LoginRequestDto
     * @param session
     */
    @PostMapping("/login")
    public void login(
            @RequestBody LoginRequestDto request,
            HttpSession session,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        User user = authService.login(
                request.getUsername(),
                request.getPassword()
        );

        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("displayName", user.getDisplayName());
        session.setAttribute("role", user.getRole());

        // 🔒 로그인 유지: 체크 시 세션 쿠키를 브라우저 종료 후에도 30일간 유지되게 함
        if (request.isRememberMe()) {
            int thirtyDaysInSeconds = 60 * 60 * 24 * 30;
            session.setMaxInactiveInterval(thirtyDaysInSeconds);

            Cookie cookie = new Cookie("JSESSIONID", session.getId());
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setSecure(httpRequest.isSecure());
            cookie.setMaxAge(thirtyDaysInSeconds);
            httpResponse.addCookie(cookie);
        }
    }

    /**
     * 작성자: 최성환
     * 현재 로그인 유저 조회
     * @param session
     * @return
     */
    @GetMapping("/me")
    public UserResponseDto me(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        String username = (String) session.getAttribute("username");
        String displayName = (String) session.getAttribute("displayName");
        String role = (String) session.getAttribute("role");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return new UserResponseDto(
                userId,
                username,
                displayName,
                role
        );
    }
    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate(); // 🔥 세션 완전 삭제
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequestDto request) {

        authService.register(
                request.getUsername(),
                request.getPassword(),
                request.getDisplayName(),
                request.getEmail()
        );

    }
}
