package com.growtive.friend.service;

import com.growtive.friend.dto.FriendCalendarSummaryDto;
import com.growtive.friend.dto.FriendConnectionDto;

import java.time.LocalDate;
import java.util.List;

public interface FriendService {

    FriendConnectionDto createRequest(Long userId, String targetUsername);

    List<FriendConnectionDto> getIncoming(Long userId);

    List<FriendConnectionDto> getOutgoing(Long userId);

    List<FriendConnectionDto> getFriends(Long userId);

    void accept(Long userId, Long connectionId);

    void remove(Long userId, Long connectionId);

    void setSharesRange(Long userId, Long connectionId, LocalDate sharesFrom, LocalDate sharesUntil);

    FriendCalendarSummaryDto getFriendCalendar(Long viewerId, Long connectionId, int year, int month);
}
