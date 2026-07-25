package com.growtive.auth.service;

import com.growtive.auth.mapper.InviteMapper;
import com.growtive.auth.util.HashUtil;
import com.growtive.auth.util.TokenUtil;
import com.growtive.common.enums.WorkspaceRole;
import com.growtive.common.exception.BadRequestException;
import com.growtive.common.exception.ForbiddenException;
import com.growtive.common.exception.NotFoundException;
import com.growtive.workspace.mapper.WorkspaceMapper;
import com.growtive.workspace.mapper.WorkspaceMemberMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InviteService {

    private final InviteMapper inviteMapper;
    private final WorkspaceMapper workspaceMapper;
    private final WorkspaceMemberMapper workspaceMemberMapper;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public InviteService(InviteMapper inviteMapper, WorkspaceMapper workspaceMapper,
                          WorkspaceMemberMapper workspaceMemberMapper) {
        this.inviteMapper = inviteMapper;
        this.workspaceMapper = workspaceMapper;
        this.workspaceMemberMapper = workspaceMemberMapper;
    }

    /**
     * requesterId가 해당 워크스페이스의 소유자이거나 OWNER/ADMIN 권한을 가진 경우에만
     * 초대 링크 발급을 허용한다.
     */
    @Transactional
    public String createInviteLink(long workspaceId, String email, WorkspaceRole role, long requesterId) {
        if (email == null || email.isBlank()) throw new BadRequestException("email is required");
        if (role == null) role = WorkspaceRole.MEMBER;

        Long ownerId = workspaceMapper.findOwnerUserId(workspaceId);
        if (ownerId == null) throw new NotFoundException("workspace not found: " + workspaceId);

        boolean isOwner = ownerId.equals(requesterId);
        if (!isOwner) {
            String roleStr = workspaceMemberMapper.findRoleString(workspaceId, requesterId);
            boolean isAdmin = "OWNER".equals(roleStr) || "ADMIN".equals(roleStr);
            if (!isAdmin) {
                throw new ForbiddenException("이 워크스페이스에 초대장을 발급할 권한이 없습니다.");
            }
        }

        String token = TokenUtil.generateToken(32);
        String tokenHash = HashUtil.sha256Hex(token);

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30);

        inviteMapper.insertInvite(
                workspaceId,
                email.trim().toLowerCase(),
                role.name(),
                tokenHash,
                expiresAt,
                requesterId
        );

        return baseUrl + "/#/invites/verify?token=" + token;
    }

    /**
     * 초대 토큰을 검증하고, 로그인한 사용자를 해당 워크스페이스의 멤버로 등록한다.
     * 1회용이며 만료 시간(발급 후 30분)이 지나면 사용할 수 없다.
     */
    @Transactional
    public long verifyAndJoin(String token, long userId) {
        if (token == null || token.isBlank()) throw new BadRequestException("token is required");

        String tokenHash = HashUtil.sha256Hex(token);
        InviteMapper.InviteRow invite = inviteMapper.findValidByTokenHash(tokenHash);
        if (invite == null) {
            throw new NotFoundException("초대 링크가 유효하지 않거나 만료되었습니다.");
        }

        workspaceMemberMapper.insertMember(invite.workspaceId, userId, WorkspaceRole.valueOf(invite.role));
        inviteMapper.markUsed(invite.id);

        return invite.workspaceId;
    }
}
