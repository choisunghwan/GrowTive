package com.growtive.auth.controller;


import com.growtive.auth.service.InviteService;
import com.growtive.common.enums.WorkspaceRole;
import com.growtive.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
public class InviteController {

    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    public record InviteCreateReq(String email, String role) {}
    public record InviteVerifyReq(String token) {}

    private Long getUserId(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) throw new UnauthorizedException("로그인이 필요합니다.");
        return userId;
    }

    // 워크스페이스 소유자/OWNER/ADMIN만 초대장을 발급할 수 있다 (InviteService에서 검증)
    @PostMapping("/workspaces/{workspaceId}/invites")
    public String createInvite(@PathVariable long workspaceId, @RequestBody InviteCreateReq req, HttpSession session) {
        Long requesterId = getUserId(session);

        WorkspaceRole role = (req.role() == null || req.role().isBlank())
                ? WorkspaceRole.MEMBER
                : WorkspaceRole.valueOf(req.role());

        return inviteService.createInviteLink(workspaceId, req.email(), role, requesterId);
    }

    // 로그인한 사용자가 초대 링크를 열람하면 해당 워크스페이스 멤버로 등록된다
    @PostMapping("/workspaces/invites/verify")
    public long verifyInvite(@RequestBody InviteVerifyReq req, HttpSession session) {
        Long userId = getUserId(session);
        return inviteService.verifyAndJoin(req.token(), userId);
    }
}
