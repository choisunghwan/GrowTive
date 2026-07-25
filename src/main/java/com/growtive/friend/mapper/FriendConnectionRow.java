package com.growtive.friend.mapper;

import lombok.Data;

import java.time.LocalDate;

/**
 * friend_connection 원본 row (권한 체크용 내부 전용 모델, API로 노출 안 함)
 */
@Data
public class FriendConnectionRow {

    private Long id;
    private Long requesterId;
    private Long addresseeId;
    private String status;
    private LocalDate requesterSharesFrom;
    private LocalDate requesterSharesUntil;
    private LocalDate addresseeSharesFrom;
    private LocalDate addresseeSharesUntil;

    public boolean isRequesterConfigured() {
        return requesterSharesFrom != null && requesterSharesUntil != null;
    }

    public boolean isAddresseeConfigured() {
        return addresseeSharesFrom != null && addresseeSharesUntil != null;
    }

    public boolean isBothConfigured() {
        return isRequesterConfigured() && isAddresseeConfigured();
    }
}
