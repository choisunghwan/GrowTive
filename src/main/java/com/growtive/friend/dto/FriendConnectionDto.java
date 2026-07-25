package com.growtive.friend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FriendConnectionDto {

    private Long id;

    private Long otherUserId;
    private String otherUsername;
    private String otherDisplayName;

    /**
     * PENDING / ACCEPTED
     */
    private String status;

    /**
     * 내가 이 친구에게 공유하는 기간 (null = 아직 설정 안 함 → 공유 안 됨)
     */
    private LocalDate mySharesFrom;
    private LocalDate mySharesUntil;

    /**
     * 이 친구가 나에게 공유하는 기간 (null = 아직 설정 안 함 → 공유 안 됨)
     */
    private LocalDate friendSharesFrom;
    private LocalDate friendSharesUntil;

    /**
     * 양쪽 다 공유 기간을 설정해서 실제로 비교가 가능한 상태인지
     */
    private boolean comparisonAvailable;

    private LocalDateTime createdAt;
}
