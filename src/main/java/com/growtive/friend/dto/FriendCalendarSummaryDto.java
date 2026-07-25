package com.growtive.friend.dto;

import com.growtive.money.dto.DailyTransactionDto;
import com.growtive.schedule.dto.ScheduleEventDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class FriendCalendarSummaryDto {

    private Long friendUserId;
    private String friendUsername;
    private String friendDisplayName;

    private long totalIncome;
    private long totalExpense;

    private List<DailyTransactionDto> transactions;
    private List<ScheduleEventDto> events;
}
