package com.growtive.admin.mapper;

import com.growtive.admin.dto.AdminUserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {

    List<AdminUserDto> findAllUsers();

    AdminUserDto findUserById(@Param("id") Long id);

    /** email이 다른 사용자에게 이미 쓰이고 있는지 확인 (본인 제외) */
    int countByEmailExcludingId(@Param("email") String email, @Param("id") Long id);

    int updateUserProfile(@Param("id") Long id,
                           @Param("displayName") String displayName,
                           @Param("email") String email);

    int deleteUser(@Param("id") Long id);
}
