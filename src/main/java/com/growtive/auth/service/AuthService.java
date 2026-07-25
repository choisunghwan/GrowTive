package com.growtive.auth.service;

import com.growtive.user.model.User;

public interface AuthService {

    /*회원가입*/
    void register(String username, String password, String displayName, String email);
    /*로그인*/
    User login(String username, String password);
    /*소셜 로그인 - 최초 로그인이면 회원가입까지 자동 처리*/
    User loginOrCreateOAuthUser(String provider, String providerId, String nickname);
}