package com.growtive.admin.service;

import com.growtive.admin.dto.AdminUserDto;

import java.util.List;

public interface AdminService {

    List<AdminUserDto> getAllUsers();

    AdminUserDto updateUser(Long id, String displayName, String email);

    void deleteUser(Long id, Long requestingAdminId);
}
