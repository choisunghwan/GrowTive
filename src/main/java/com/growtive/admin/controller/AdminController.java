package com.growtive.admin.controller;

import com.growtive.admin.dto.AdminUserDto;
import com.growtive.admin.dto.AdminUserUpdateRequestDto;
import com.growtive.admin.service.AdminService;
import com.growtive.common.exception.ForbiddenException;
import com.growtive.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;

    private Long requireAdmin(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        String role = (String) session.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            throw new ForbiddenException("관리자 권한이 필요합니다.");
        }
        return userId;
    }

    @GetMapping("/users")
    public List<AdminUserDto> listUsers(HttpSession session) {
        requireAdmin(session);
        return service.getAllUsers();
    }

    @PutMapping("/users/{id}")
    public AdminUserDto updateUser(@PathVariable Long id,
                                    @RequestBody AdminUserUpdateRequestDto request,
                                    HttpSession session) {
        requireAdmin(session);
        return service.updateUser(id, request.getDisplayName(), request.getEmail());
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id, HttpSession session) {
        Long adminId = requireAdmin(session);
        service.deleteUser(id, adminId);
    }
}
