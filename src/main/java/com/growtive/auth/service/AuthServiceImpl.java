package com.growtive.auth.service;

import com.growtive.auth.mapper.AuthMapper;
import com.growtive.common.exception.BadRequestException;
import com.growtive.common.exception.UnauthorizedException;
import com.growtive.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthMapper authMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 회원가입
     */
    @Override
    public void register(String username,
                         String password,
                         String displayName,
                         String email) {

        User existUser = authMapper.findByUsername(username);

        if (existUser != null) {
            throw new BadRequestException("이미 존재하는 아이디입니다.");
        }

        // 🔐 BCrypt 암호화
        String encodedPassword = passwordEncoder.encode(password);

        User user = new User();

        user.setUsername(username);
        user.setPassword(encodedPassword);   // 🔐 암호화된 비밀번호 저장
        user.setDisplayName(displayName);
        user.setEmail(email);

        authMapper.insertUser(user);
    }

    /**
     * 로그인
     */
    @Override
    public User login(String username, String password) {

        User user = authMapper.findByUsername(username);

        if (user == null) {
            throw new UnauthorizedException("사용자가 없습니다.");
        }

        // 🔐 BCrypt 비교
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("비밀번호가 틀립니다.");
        }

        authMapper.updateLastLogin(user.getId());

        return user;
    }

    /**
     * 소셜 로그인 (카카오 등)
     * - provider + providerId로 기존 회원이면 그대로 로그인
     * - 없으면 닉네임만으로 회원가입 처리 (username/email/password는 자동 생성되는 형식적인 값)
     */
    @Override
    public User loginOrCreateOAuthUser(String provider, String providerId, String nickname) {

        User user = authMapper.findByProviderAndProviderId(provider, providerId);

        if (user == null) {
            User newUser = new User();
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setDisplayName(nickname != null && !nickname.isBlank() ? nickname : provider + " 사용자");
            newUser.setUsername(provider.toLowerCase() + "_" + providerId);
            newUser.setEmail(provider.toLowerCase() + "_" + providerId + "@growtive.local");
            // 🔐 소셜 로그인 계정은 아이디/비밀번호로 로그인할 수 없도록 임의의 값으로 암호화
            newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

            authMapper.insertUser(newUser);

            user = authMapper.findByProviderAndProviderId(provider, providerId);
        }

        authMapper.updateLastLogin(user.getId());

        return user;
    }

    /**
     * 이미 로그인한 계정에 소셜 계정 연결
     * - 해당 provider/providerId가 이미 다른 계정에 연결되어 있으면 거부
     */
    @Override
    public void linkOAuthAccount(Long userId, String provider, String providerId) {

        User existing = authMapper.findByProviderAndProviderId(provider, providerId);

        if (existing != null && !existing.getId().equals(userId)) {
            throw new BadRequestException("이미 다른 계정에 연결된 카카오 계정입니다.");
        }

        authMapper.linkProvider(userId, provider, providerId);
    }
}