package com.growtive.auth.mapper;

import com.growtive.user.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    /*로그인*/
    User findByUsername(String username);

    /*소셜 로그인 - provider + providerId로 기존 회원 조회*/
    User findByProviderAndProviderId(@Param("provider") String provider, @Param("providerId") String providerId);

    /*회원가입*/
    void insertUser(User user);

    /*로그인 성공 시 최근 접속 시각 갱신*/
    void updateLastLogin(@Param("userId") Long userId);

}